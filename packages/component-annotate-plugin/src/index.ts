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
 * with Sentry products
 */

import type * as Babel from "@babel/core";
import type { PluginObj, PluginPass } from "@babel/core";

const webComponentName = "data-sentry-component";
const webElementName = "data-sentry-element";
const webSourceFileName = "data-sentry-source-file";

const nativeComponentName = "dataSentryComponent";
const nativeElementName = "dataSentryElement";
const nativeSourceFileName = "dataSentrySourceFile";
const fsTagName = "fsTagName";

const knownIncompatiblePlugins = [
  // This module might be causing an issue preventing clicks. For safety, we won't run on this module.
  "react-native-testfairy",
  // This module checks for unexpected property keys and throws an exception.
  "@react-navigation",
];

interface AnnotationOpts {
  setFSTagName?: boolean;
  native?: boolean;
  "annotate-fragments"?: boolean;
  excludedComponents?: boolean;
}

interface AnnotationPluginPass extends PluginPass {
  opts: AnnotationOpts;
}

type AnnotationPlugin = PluginObj<AnnotationPluginPass>;

export default function reactAnnotate({ types: t }: typeof Babel): AnnotationPlugin {
  return {
    pre() {
      this["excludedComponents"] = this.opts["excludedComponents"] || [];
      if (this.opts.setFSTagName && !this.opts.native) {
        throw new Error(
          "`setFSTagName: true` is invalid unless `native: true` is also set in the configuration for @fullstory/babel-plugin-annotate-react"
        );
      }
    },
    visitor: {
      FunctionDeclaration(path, state) {
        if (!path.node.id || !path.node.id.name) return;
        if (isKnownIncompatiblePluginFromState(state)) return;

        functionBodyPushAttributes(
          state.opts["annotate-fragments"] === true,
          t,
          path,
          path.node.id.name,
          sourceFileNameFromState(state),
          attributeNamesFromState(state),
          this["excludedComponents"] as [string, string, string][]
        );
      },
      ArrowFunctionExpression(path, state) {
        const parent = path.parent; // We're expecting a `VariableDeclarator` like `const MyComponent =`
        if (!parent) return;
        if (!("id" in parent)) return;
        if (!parent.id) return;
        if (!("name" in parent.id)) return;
        if (!parent.id.name) return;

        if (isKnownIncompatiblePluginFromState(state)) return;

        functionBodyPushAttributes(
          state.opts["annotate-fragments"] === true,
          t,
          path,
          parent.id.name,
          sourceFileNameFromState(state),
          attributeNamesFromState(state),
          this["excludedComponents"] as [string, string, string][]
        );
      },
      ClassDeclaration(path, state) {
        const name = path.get("id");
        const properties = path.get("body").get("body");
        const render = properties.find((prop) => {
          return prop.isClassMethod() && prop.get("key").isIdentifier({ name: "render" });
        });

        if (!render || !render.traverse) return;
        if (isKnownIncompatiblePluginFromState(state)) return;

        const excludedComponents = this["excludedComponents"];

        render.traverse({
          ReturnStatement(returnStatement) {
            const arg = returnStatement.get("argument");

            if (!arg.isJSXElement() && !arg.isJSXFragment()) return;
            processJSX(
              state.opts["annotate-fragments"] === true,
              t,
              arg,
              name.node && name.node.name,
              sourceFileNameFromState(state),
              attributeNamesFromState(state),
              excludedComponents as [string, string, string][]
            );
          },
        });
      },
    },
  };
}

function fullSourceFileNameFromState(state: AnnotationPluginPass) {
  // NOTE: This was originally written as `sourceFileName` which is incorrect according to Babel types
  const name = state.file.opts.parserOpts?.sourceFilename;

  if (typeof name !== "string") {
    return undefined;
  }

  return name;
}

function sourceFileNameFromState(state: AnnotationPluginPass) {
  const name = fullSourceFileNameFromState(state);
  if (name === undefined) {
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

function isKnownIncompatiblePluginFromState(state: AnnotationPluginPass) {
  const fullSourceFileName = fullSourceFileNameFromState(state);
  if (fullSourceFileName == undefined) {
    return false;
  }
  for (let i = 0; i < knownIncompatiblePlugins.length; i += 1) {
    const pluginName = knownIncompatiblePlugins[i] as string;
    if (
      fullSourceFileName.includes("/node_modules/" + pluginName + "/") ||
      fullSourceFileName.includes("\\node_modules\\" + pluginName + "\\")
    ) {
      return true;
    }
  }

  return false;
}

function attributeNamesFromState(state: AnnotationPluginPass): [string, string, string] {
  if (state.opts.native) {
    if (state.opts.setFSTagName) {
      return [fsTagName, fsTagName, nativeSourceFileName];
    } else {
      return [nativeComponentName, nativeElementName, nativeSourceFileName];
    }
  }
  return [webComponentName, webElementName, webSourceFileName];
}

function isReactFragment(openingElement: Babel.NodePath) {
  if (openingElement.isJSXFragment()) {
    return true;
  }

  const node = openingElement.node;

  if (!node) return;
  if (!("name" in node)) return;
  if (!node.name) return;

  let name;
  if (typeof node.name === "string") {
    name = node.name;
  } else if ("name" in node.name) {
    name = node.name.name;
  }

  if (!name) return;

  if (name === "Fragment" || name === "React.Fragment") return true;

  if (
    typeof node.name === "string" ||
    !("type" in node.name) ||
    !("object" in node.name) ||
    !("property" in node.name)
  )
    return;

  if (!node.name.type || !node.name.object || !node.name.property) return;

  return (
    node.name.type === "JSXMemberExpression" &&
    "name" in node.name.object &&
    node.name.object.name === "React" &&
    node.name.property.name === "Fragment"
  );
}

function applyAttributes(
  t: typeof Babel.types,
  openingElement: Babel.NodePath,
  componentName: string | null,
  sourceFileName: string | undefined,
  attributeNames: [string, string, string],
  excludedComponents?: [string, string, string][]
) {
  const [componentAttributeName, elementAttributeName, sourceFileAttributeName] = attributeNames;

  if (
    !openingElement ||
    isReactFragment(openingElement) ||
    !openingElement.node ||
    !("name" in openingElement.node)
  ) {
    return;
  }

  // @ts-expect-error This behaviour might not be defined for some types, but changing it is a risk
  if (
    !("attributes" in openingElement.node) ||
    !openingElement.node.attributes ||
    !Array.isArray(openingElement.node.attributes)
  )
    openingElement.node.attributes = [];

  let elementName: string;

  if (openingElement.node.name) {
    if (typeof openingElement.node.name === "string") {
      elementName = openingElement.node.name;
    } else if ("name" in openingElement.node.name) {
      elementName = openingElement.node.name.name.toString();
    } else {
      elementName = "unknown";
    }
  } else {
    elementName = "unknown";
  }

  const ignoredComponentFromOptions =
    excludedComponents &&
    !!excludedComponents.find(
      (component) =>
        matchesIgnoreRule(component[0], sourceFileName ?? "") &&
        matchesIgnoreRule(component[1], componentName ?? "") &&
        matchesIgnoreRule(component[2], elementName ?? "")
    );

  let ignoredElement = false;
  // Add a stable attribute for the element name but only for non-DOM names
  if (
    !ignoredComponentFromOptions &&
    !hasNodeNamed(openingElement, componentAttributeName) &&
    // if componentAttributeName and elementAttributeName are set to the same thing (fsTagName), then only set the element attribute when we don't have a component attribute
    (componentAttributeName !== elementAttributeName || !componentName)
  ) {
    if (defaultIgnoredElements.includes(elementName)) {
      ignoredElement = true;
    } else {
      openingElement.node.attributes.push(
        t.jSXAttribute(t.jSXIdentifier(elementAttributeName), t.stringLiteral(elementName))
      );
    }
  }

  // Add a stable attribute for the component name (absent for non-root elements)
  if (
    componentName &&
    !ignoredComponentFromOptions &&
    !hasNodeNamed(openingElement, componentAttributeName)
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    openingElement.node.attributes.push(
      t.jSXAttribute(t.jSXIdentifier(componentAttributeName), t.stringLiteral(componentName))
    );
  }

  // Add a stable attribute for the source file name (absent for non-root elements)
  if (
    sourceFileName &&
    !ignoredComponentFromOptions &&
    (componentName || ignoredElement === false) &&
    !hasNodeNamed(openingElement, sourceFileAttributeName)
  ) {
    openingElement.node.attributes.push(
      t.jSXAttribute(t.jSXIdentifier(sourceFileAttributeName), t.stringLiteral(sourceFileName))
    );
  }
}

function processJSX(
  annotateFragments: boolean,
  t: typeof Babel.types,
  jsxNode: Babel.NodePath,
  componentName: string | null,
  sourceFileName: string | undefined,
  attributeNames: [string, string, string],
  excludedComponents?: [string, string, string][]
) {
  if (!jsxNode) {
    return;
  }

  // only a JSXElement contains openingElement
  const openingElement = jsxNode.get("openingElement");
  if (Array.isArray(openingElement)) return;

  applyAttributes(
    t,
    openingElement,
    componentName,
    sourceFileName,
    attributeNames,
    excludedComponents
  );

  let children = jsxNode.get("children");

  if (children && !Array.isArray(children)) {
    children = [children];
  }

  if (children && children.length) {
    let shouldSetComponentName = annotateFragments;

    for (let i = 0; i < children.length; i += 1) {
      const child = children[i];
      if (!child) continue;
      // Children don't receive the data-component attribute so we pass null for componentName unless it's the first child of a Fragment with a node and `annotateFragments` is true
      const openingElement = child.get("openingElement");
      if (Array.isArray(openingElement)) continue;

      if (shouldSetComponentName && openingElement && openingElement.node) {
        shouldSetComponentName = false;
        processJSX(
          annotateFragments,
          t,
          child,
          componentName,
          sourceFileName,
          attributeNames,
          excludedComponents
        );
      } else {
        processJSX(
          annotateFragments,
          t,
          child,
          null,
          sourceFileName,
          attributeNames,
          excludedComponents
        );
      }
    }
  }
}

function functionBodyPushAttributes(
  annotateFragments: boolean,
  t: typeof Babel.types,
  path: Babel.NodePath<Babel.types.Function>,
  componentName: string,
  sourceFileName: string | undefined,
  attributeNames: [string, string, string],
  excludedComponents?: [string, string, string][]
) {
  let jsxNode: Babel.NodePath;

  const functionBody = path.get("body").get("body");
  if (Array.isArray(functionBody)) return;

  if (
    functionBody.parent &&
    (functionBody.parent.type === "JSXElement" || functionBody.parent.type === "JSXFragment")
  ) {
    const maybeJsxNode = functionBody.find((c) => {
      return c.type === "JSXElement" || c.type === "JSXFragment";
    });

    if (!maybeJsxNode) return;

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

    if (!arg.isJSXFragment() && !arg.isJSXElement()) {
      return;
    }

    jsxNode = arg;
  }

  if (!jsxNode) return;

  processJSX(
    annotateFragments,
    t,
    jsxNode,
    componentName,
    sourceFileName,
    attributeNames,
    excludedComponents
  );
}

function matchesIgnoreRule(rule: string, name: string): boolean {
  return rule === "*" || rule === name;
}

function hasNodeNamed(openingElement: Babel.NodePath, name: string): boolean {
  if (!("attributes" in openingElement.node)) return false;

  return openingElement.node.attributes.some((node) => {
    if (!("name" in node)) return;
    if (!node.name) return;
    return node.name.name === name;
  });
}

// We don't write data-element attributes for these names
const defaultIgnoredElements = [
  "a",
  "abbr",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "keygen",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "menu",
  "menuitem",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "pre",
  "progress",
  "q",
  "rb",
  "rp",
  "rt",
  "rtc",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr",
];
