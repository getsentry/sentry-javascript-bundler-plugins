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

// @ts-nocheck

const webComponentName = "data-sentry-component";
const webElementName = "data-sentry-element";
const webSourceFileName = "data-sentry-source-file";

const nativeComponentName = "dataSentryComponent";
const nativeElementName = "dataSentryElement";
const nativeSourceFileName = "dataSentrySourceFile";
const fsTagName = "fsTagName";

const annotateFragmentsOptionName = "annotate-fragments";
const ignoreComponentsOptionName = "ignoreComponents";

const knownIncompatiblePlugins = [
  // This module might be causing an issue preventing clicks. For safety, we won't run on this module.
  "react-native-testfairy",
  // This module checks for unexpected property keys and throws an exception.
  "@react-navigation",
  // The victory* modules use `dataComponent` and we get a collision.
  "victory",
  "victory-area",
  "victory-axis",
  "victory-bar",
  "victory-box-plot",
  "victory-brush-container",
  "victory-brush-line",
  "victory-candlestick",
  "victory-canvas",
  "victory-chart",
  "victory-core",
  "victory-create-container",
  "victory-cursor-container",
  "victory-errorbar",
  "victory-group",
  "victory-histogram",
  "victory-legend",
  "victory-line",
  "victory-native",
  "victory-pie",
  "victory-polar-axis",
  "victory-scatter",
  "victory-selection-container",
  "victory-shared-events",
  "victory-stack",
  "victory-tooltip",
  "victory-vendor",
  "victory-voronoi",
  "victory-voronoi-container",
  "victory-zoom-container",
];

export function componentNameAnnotatePlugin({ types: t }) {
  return {
    pre() {
      this.ignoreComponentsFromOption = this.opts[ignoreComponentsOptionName] || [];
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
          state.opts[annotateFragmentsOptionName] === true,
          t,
          path,
          path.node.id.name,
          sourceFileNameFromState(state),
          attributeNamesFromState(state),
          this.ignoreComponentsFromOption
        );
      },
      ArrowFunctionExpression(path, state) {
        if (!path.parent.id || !path.parent.id.name) return;
        if (isKnownIncompatiblePluginFromState(state)) return;
        functionBodyPushAttributes(
          state.opts[annotateFragmentsOptionName] === true,
          t,
          path,
          path.parent.id.name,
          sourceFileNameFromState(state),
          attributeNamesFromState(state),
          this.ignoreComponentsFromOption
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

        const ignoreComponentsFromOption = this.ignoreComponentsFromOption;

        render.traverse({
          ReturnStatement(returnStatement) {
            const arg = returnStatement.get("argument");

            if (!arg.isJSXElement() && !arg.isJSXFragment()) return;
            processJSX(
              state.opts[annotateFragmentsOptionName] === true,
              t,
              arg,
              name.node && name.node.name,
              sourceFileNameFromState(state),
              attributeNamesFromState(state),
              ignoreComponentsFromOption
            );
          },
        });
      },
    },
  };
}

function fullSourceFileNameFromState(state) {
  const name = state.file.opts.parserOpts.sourceFileName;
  if (typeof name !== "string") {
    return undefined;
  }
  return name;
}

function sourceFileNameFromState(state) {
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

function isKnownIncompatiblePluginFromState(state) {
  const fullSourceFileName = fullSourceFileNameFromState(state);
  if (fullSourceFileName == undefined) {
    return false;
  }

  for (let i = 0; i < knownIncompatiblePlugins.length; i += 1) {
    let pluginName = knownIncompatiblePlugins[i];
    if (
      fullSourceFileName.includes("/node_modules/" + pluginName + "/") ||
      fullSourceFileName.includes("\\node_modules\\" + pluginName + "\\")
    ) {
      return true;
    }
  }

  return false;
}

function attributeNamesFromState(state) {
  if (state.opts.native) {
    if (state.opts.setFSTagName) {
      return [fsTagName, fsTagName, nativeSourceFileName];
    } else {
      return [nativeComponentName, nativeElementName, nativeSourceFileName];
    }
  }
  return [webComponentName, webElementName, webSourceFileName];
}

function isReactFragment(openingElement) {
  if (openingElement.isJSXFragment()) {
    return true;
  }

  if (!openingElement.node || !openingElement.node.name) return;

  if (
    openingElement.node.name.name === "Fragment" ||
    openingElement.node.name.name === "React.Fragment"
  )
    return true;

  if (
    !openingElement.node.name.type ||
    !openingElement.node.name.object ||
    !openingElement.node.name.property
  )
    return;

  return (
    openingElement.node.name.type === "JSXMemberExpression" &&
    openingElement.node.name.object.name === "React" &&
    openingElement.node.name.property.name === "Fragment"
  );
}

function applyAttributes(
  t,
  openingElement,
  componentName,
  sourceFileName,
  attributeNames,
  ignoreComponentsFromOption
) {
  const [componentAttributeName, elementAttributeName, sourceFileAttributeName] = attributeNames;
  if (
    !openingElement ||
    isReactFragment(openingElement) ||
    !openingElement.node ||
    !openingElement.node.name
  ) {
    return;
  }
  if (!openingElement.node.attributes) openingElement.node.attributes = {};

  const elementName = openingElement.node.name.name || "unknown";

  const ignoredComponentFromOptions =
    ignoreComponentsFromOption &&
    !!ignoreComponentsFromOption.find(
      (component) =>
        matchesIgnoreRule(component[0], sourceFileName) &&
        matchesIgnoreRule(component[1], componentName) &&
        matchesIgnoreRule(component[2], elementName)
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
  annotateFragments,
  t,
  jsxNode,
  componentName,
  sourceFileName,
  attributeNames,
  ignoreComponentsFromOption
) {
  if (!jsxNode) {
    return;
  }

  // only a JSXElement contains openingElement
  const openingElement = jsxNode.get("openingElement");

  applyAttributes(
    t,
    openingElement,
    componentName,
    sourceFileName,
    attributeNames,
    ignoreComponentsFromOption
  );

  const children = jsxNode.get("children");
  if (children && children.length) {
    let shouldSetComponentName = annotateFragments;
    for (let i = 0; i < children.length; i += 1) {
      const child = children[i];
      // Children don't receive the data-component attribute so we pass null for componentName unless it's the first child of a Fragment with a node and `annotateFragments` is true
      if (
        shouldSetComponentName &&
        child.get("openingElement") &&
        child.get("openingElement").node
      ) {
        shouldSetComponentName = false;
        processJSX(
          annotateFragments,
          t,
          child,
          componentName,
          sourceFileName,
          attributeNames,
          ignoreComponentsFromOption
        );
      } else {
        processJSX(
          annotateFragments,
          t,
          child,
          null,
          sourceFileName,
          attributeNames,
          ignoreComponentsFromOption
        );
      }
    }
  }
}

function functionBodyPushAttributes(
  annotateFragments,
  t,
  path,
  componentName,
  sourceFileName,
  attributeNames,
  ignoreComponentsFromOption
) {
  let jsxNode = null;
  const functionBody = path.get("body").get("body");
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
    ignoreComponentsFromOption
  );
}

function matchesIgnoreRule(rule, name) {
  return rule === "*" || rule === name;
}

function hasNodeNamed(openingElement, name) {
  return openingElement.node.attributes.find((node) => {
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
