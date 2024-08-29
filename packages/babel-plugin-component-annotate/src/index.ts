/**
 * MIT License
 *
 * Copyright (c) 2020 Engineering at FullStory
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

/**
 * The following code is based on the FullStory Babel plugin, but has been modified to work
 * with Sentry products:
 *
 * - Added `sentry` to data properties, i.e `data-sentry-component`
 * - Converted to TypeScript
 * - Code cleanups
 */

import type * as Babel from "@babel/core";
import type { PluginObj, PluginPass } from "@babel/core";

import { DEFAULT_IGNORED_ELEMENTS, KNOWN_INCOMPATIBLE_PLUGINS } from "./constants";

const webComponentName = "data-sentry-component";
const webElementName = "data-sentry-element";
const webSourceFileName = "data-sentry-source-file";

const nativeComponentName = "dataSentryComponent";
const nativeElementName = "dataSentryElement";
const nativeSourceFileName = "dataSentrySourceFile";

interface AnnotationOpts {
  native?: boolean;
  "annotate-fragments"?: boolean;
  ignoreComponents?: IgnoredComponent[];
}

interface AnnotationPluginPass extends PluginPass {
  opts: AnnotationOpts;
}

type IgnoredComponent = [file: string, component: string, element: string];

type AnnotationPlugin = PluginObj<AnnotationPluginPass>;

// We must export the plugin as default, otherwise the Babel loader will not be able to resolve it when configured using its string identifier
export default function componentNameAnnotatePlugin({ types: t }: typeof Babel): AnnotationPlugin {
  return {
    visitor: {
      FunctionDeclaration(path, state) {
        if (!path.node.id || !path.node.id.name) {
          return;
        }
        if (isKnownIncompatiblePluginFromState(state)) {
          return;
        }

        functionBodyPushAttributes(
          state.opts["annotate-fragments"] === true,
          t,
          path,
          path.node.id.name,
          sourceFileNameFromState(state),
          attributeNamesFromState(state),
          state.opts.ignoreComponents ?? []
        );
      },
      ArrowFunctionExpression(path, state) {
        // We're expecting a `VariableDeclarator` like `const MyComponent =`
        const parent = path.parent;

        if (
          !parent ||
          !("id" in parent) ||
          !parent.id ||
          !("name" in parent.id) ||
          !parent.id.name
        ) {
          return;
        }

        if (isKnownIncompatiblePluginFromState(state)) {
          return;
        }

        functionBodyPushAttributes(
          state.opts["annotate-fragments"] === true,
          t,
          path,
          parent.id.name,
          sourceFileNameFromState(state),
          attributeNamesFromState(state),
          state.opts.ignoreComponents ?? []
        );
      },
      ClassDeclaration(path, state) {
        const name = path.get("id");
        const properties = path.get("body").get("body");
        const render = properties.find((prop) => {
          return prop.isClassMethod() && prop.get("key").isIdentifier({ name: "render" });
        });

        if (!render || !render.traverse || isKnownIncompatiblePluginFromState(state)) {
          return;
        }

        const ignoredComponents = state.opts.ignoreComponents ?? [];

        render.traverse({
          ReturnStatement(returnStatement) {
            const arg = returnStatement.get("argument");

            if (!arg.isJSXElement() && !arg.isJSXFragment()) {
              return;
            }

            processJSX(
              state.opts["annotate-fragments"] === true,
              t,
              arg,
              name.node && name.node.name,
              sourceFileNameFromState(state),
              attributeNamesFromState(state),
              ignoredComponents
            );
          },
        });
      },
    },
  };
}

function functionBodyPushAttributes(
  annotateFragments: boolean,
  t: typeof Babel.types,
  path: Babel.NodePath<Babel.types.Function>,
  componentName: string,
  sourceFileName: string | undefined,
  attributeNames: string[],
  ignoredComponents: IgnoredComponent[]
) {
  let jsxNode: Babel.NodePath;

  const functionBody = path.get("body").get("body");

  if (
    !("length" in functionBody) &&
    functionBody.parent &&
    (functionBody.parent.type === "JSXElement" || functionBody.parent.type === "JSXFragment")
  ) {
    const maybeJsxNode = functionBody.find((c) => {
      return c.type === "JSXElement" || c.type === "JSXFragment";
    });

    if (!maybeJsxNode) {
      return;
    }

    jsxNode = maybeJsxNode;
  } else {
    const returnStatement = functionBody.find((c) => {
      return c.type === "ReturnStatement";
    });
    if (!returnStatement) {
      return;
    }

    const arg = returnStatement.get("argument");
    if (!arg) {
      return;
    }

    if (Array.isArray(arg)) {
      return;
    }

    // Handle the case of a function body returning a ternary operation.
    // `return (maybeTrue ? '' : (<SubComponent />))`
    if (arg.isConditionalExpression()) {
      const consequent = arg.get("consequent");
      if (consequent.isJSXFragment() || consequent.isJSXElement()) {
        processJSX(
          annotateFragments,
          t,
          consequent,
          componentName,
          sourceFileName,
          attributeNames,
          ignoredComponents
        );
      }
      const alternate = arg.get("alternate");
      if (alternate.isJSXFragment() || alternate.isJSXElement()) {
        processJSX(
          annotateFragments,
          t,
          alternate,
          componentName,
          sourceFileName,
          attributeNames,
          ignoredComponents
        );
      }
      return;
    }

    if (!arg.isJSXFragment() && !arg.isJSXElement()) {
      return;
    }

    jsxNode = arg;
  }

  if (!jsxNode) {
    return;
  }

  processJSX(
    annotateFragments,
    t,
    jsxNode,
    componentName,
    sourceFileName,
    attributeNames,
    ignoredComponents
  );
}

function processJSX(
  annotateFragments: boolean,
  t: typeof Babel.types,
  jsxNode: Babel.NodePath,
  componentName: string | null,
  sourceFileName: string | undefined,
  attributeNames: string[],
  ignoredComponents: IgnoredComponent[]
) {
  if (!jsxNode) {
    return;
  }
  // NOTE: I don't know of a case where `openingElement` would have more than one item,
  // but it's safer to always iterate
  const paths = jsxNode.get("openingElement");
  const openingElements = Array.isArray(paths) ? paths : [paths];

  openingElements.forEach((openingElement) => {
    applyAttributes(
      t,
      openingElement as Babel.NodePath<Babel.types.JSXOpeningElement>,
      componentName,
      sourceFileName,
      attributeNames,
      ignoredComponents
    );
  });

  let children = jsxNode.get("children");
  // TODO: See why `Array.isArray` doesn't have correct behaviour here
  if (children && !("length" in children)) {
    // A single child was found, maybe a bit of static text
    children = [children];
  }

  let shouldSetComponentName = annotateFragments;

  children.forEach((child) => {
    // Happens for some node types like plain text
    if (!child.node) {
      return;
    }

    // Children don't receive the data-component attribute so we pass null for componentName unless it's the first child of a Fragment with a node and `annotateFragments` is true
    const openingElement = child.get("openingElement");
    // TODO: Improve this. We never expect to have multiple opening elements
    // but if it's possible, this should work
    if (Array.isArray(openingElement)) {
      return;
    }

    if (shouldSetComponentName && openingElement && openingElement.node) {
      shouldSetComponentName = false;
      processJSX(
        annotateFragments,
        t,
        child,
        componentName,
        sourceFileName,
        attributeNames,
        ignoredComponents
      );
    } else {
      processJSX(
        annotateFragments,
        t,
        child,
        null,
        sourceFileName,
        attributeNames,
        ignoredComponents
      );
    }
  });
}

function applyAttributes(
  t: typeof Babel.types,
  openingElement: Babel.NodePath<Babel.types.JSXOpeningElement>,
  componentName: string | null,
  sourceFileName: string | undefined,
  attributeNames: string[],
  ignoredComponents: IgnoredComponent[]
) {
  const [componentAttributeName, elementAttributeName, sourceFileAttributeName] = attributeNames;

  if (isReactFragment(t, openingElement)) {
    return;
  }
  // e.g., Raw JSX text like the `A` in `<h1>a</h1>`
  if (!openingElement.node) {
    return;
  }

  if (!openingElement.node.attributes) openingElement.node.attributes = [];
  const elementName = getPathName(t, openingElement);

  const isAnIgnoredComponent = ignoredComponents.some(
    (ignoredComponent) =>
      matchesIgnoreRule(ignoredComponent[0], sourceFileName) &&
      matchesIgnoreRule(ignoredComponent[1], componentName) &&
      matchesIgnoreRule(ignoredComponent[2], elementName)
  );

  // Add a stable attribute for the element name but only for non-DOM names
  let isAnIgnoredElement = false;
  if (
    !isAnIgnoredComponent &&
    !hasAttributeWithName(openingElement, componentAttributeName) &&
    (componentAttributeName !== elementAttributeName || !componentName)
  ) {
    if (DEFAULT_IGNORED_ELEMENTS.includes(elementName)) {
      isAnIgnoredElement = true;
    } else {
      // TODO: Is it possible to avoid this null check?
      if (elementAttributeName) {
        openingElement.node.attributes.push(
          t.jSXAttribute(t.jSXIdentifier(elementAttributeName), t.stringLiteral(elementName))
        );
      }
    }
  }

  // Add a stable attribute for the component name (absent for non-root elements)
  if (
    componentName &&
    !isAnIgnoredComponent &&
    !hasAttributeWithName(openingElement, componentAttributeName)
  ) {
    // TODO: Is it possible to avoid this null check?
    if (componentAttributeName) {
      openingElement.node.attributes.push(
        t.jSXAttribute(t.jSXIdentifier(componentAttributeName), t.stringLiteral(componentName))
      );
    }
  }

  // Add a stable attribute for the source file name (absent for non-root elements)
  if (
    sourceFileName &&
    !isAnIgnoredComponent &&
    (componentName || isAnIgnoredElement === false) &&
    !hasAttributeWithName(openingElement, sourceFileAttributeName)
  ) {
    // TODO: Is it possible to avoid this null check?
    if (sourceFileAttributeName) {
      openingElement.node.attributes.push(
        t.jSXAttribute(t.jSXIdentifier(sourceFileAttributeName), t.stringLiteral(sourceFileName))
      );
    }
  }
}

function sourceFileNameFromState(state: AnnotationPluginPass) {
  const name = fullSourceFileNameFromState(state);
  if (!name) {
    return undefined;
  }

  if (name.indexOf("/") !== -1) {
    return name.split("/").pop();
  } else if (name.indexOf("\\") !== -1) {
    return name.split("\\").pop();
  } else {
    return name;
  }
}

function fullSourceFileNameFromState(state: AnnotationPluginPass): string | null {
  // @ts-expect-error This type is incorrect in Babel, `sourceFileName` is the correct type
  const name = state.file.opts.parserOpts?.sourceFileName as unknown;

  if (typeof name === "string") {
    return name;
  }

  return null;
}

function isKnownIncompatiblePluginFromState(state: AnnotationPluginPass) {
  const fullSourceFileName = fullSourceFileNameFromState(state);

  if (!fullSourceFileName) {
    return false;
  }

  return KNOWN_INCOMPATIBLE_PLUGINS.some((pluginName) => {
    if (
      fullSourceFileName.includes(`/node_modules/${pluginName}/`) ||
      fullSourceFileName.includes(`\\node_modules\\${pluginName}\\`)
    ) {
      return true;
    }

    return false;
  });
}

function attributeNamesFromState(state: AnnotationPluginPass): [string, string, string] {
  if (state.opts.native) {
    return [nativeComponentName, nativeElementName, nativeSourceFileName];
  }

  return [webComponentName, webElementName, webSourceFileName];
}

function isReactFragment(t: typeof Babel.types, openingElement: Babel.NodePath): boolean {
  if (openingElement.isJSXFragment()) {
    return true;
  }

  const elementName = getPathName(t, openingElement);

  if (elementName === "Fragment" || elementName === "React.Fragment") {
    return true;
  }

  // TODO: All these objects are typed as unknown, maybe an oversight in Babel types?
  if (
    openingElement.node &&
    "name" in openingElement.node &&
    openingElement.node.name &&
    typeof openingElement.node.name === "object" &&
    "type" in openingElement.node.name &&
    openingElement.node.name.type === "JSXMemberExpression"
  ) {
    if (!("name" in openingElement.node)) {
      return false;
    }

    const nodeName = openingElement.node.name;
    if (typeof nodeName !== "object" || !nodeName) {
      return false;
    }

    if ("object" in nodeName && "property" in nodeName) {
      const nodeNameObject = nodeName.object;
      const nodeNameProperty = nodeName.property;

      if (typeof nodeNameObject !== "object" || typeof nodeNameProperty !== "object") {
        return false;
      }

      if (!nodeNameObject || !nodeNameProperty) {
        return false;
      }

      const objectName = "name" in nodeNameObject && nodeNameObject.name;
      const propertyName = "name" in nodeNameProperty && nodeNameProperty.name;

      if (objectName === "React" && propertyName === "Fragment") {
        return true;
      }
    }
  }

  return false;
}

function matchesIgnoreRule(rule: string, name: string | undefined | null) {
  return rule === "*" || rule === name;
}

function hasAttributeWithName(
  openingElement: Babel.NodePath<Babel.types.JSXOpeningElement>,
  name: string | undefined | null
): boolean {
  if (!name) {
    return false;
  }

  return openingElement.node.attributes.some((node) => {
    if (node.type === "JSXAttribute") {
      return node.name.name === name;
    }

    return false;
  });
}

function getPathName(t: typeof Babel.types, path: Babel.NodePath): string {
  if (!path.node) return UNKNOWN_ELEMENT_NAME;
  if (!("name" in path.node)) {
    return UNKNOWN_ELEMENT_NAME;
  }

  const name = path.node.name;

  if (typeof name === "string") {
    return name;
  }

  if (t.isIdentifier(name) || t.isJSXIdentifier(name)) {
    return name.name;
  }

  if (t.isJSXNamespacedName(name)) {
    return name.name.name;
  }

  return UNKNOWN_ELEMENT_NAME;
}

const UNKNOWN_ELEMENT_NAME = "unknown";
