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

import { transform } from "@babel/core";
import plugin from "../src/index";

const BananasPizzaAppStandardInput = `import React, { Component } from 'react';
import { StyleSheet, Text, TextInput, View, Image, UIManager } from 'react-native';

UIManager.getViewManagerConfig('RCTView').NativeProps.fsClass = "String";

class Bananas extends Component {
  render() {
    let pic = {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
    };
    return <Image source={pic} style={{ width: 193, height: 110, marginTop: 10 }} fsClass="test-class" />;
  }
}

class PizzaTranslator extends Component {
  constructor(props) {
    super(props);
    this.state = { text: '' };
  }

  render() {
    return <View style={{ padding: 10 }}>
        <TextInput style={{
        backgroundColor: '#000',
        color: '#eee',
        padding: 8
      }} placeholder="Type here to translate!" // not supported on iOS
      onChangeText={text => this.setState({ text })} value={this.state.text} />
        <Text style={{ padding: 10, fontSize: 42 }}>
          {this.state.text.split(' ').map(word => word && '🍕').join(' ')}
        </Text>
      </View>;
  }
}

export default function App() {
  return <View style={styles.container}>
      <Text style={{ color: '#eee' }}>FullStory ReactNative testing app</Text>
      <Bananas />
      <PizzaTranslator />
    </View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center'
  }
});`;

const BananasStandardInput = `import React, { Component } from 'react';
import { Image } from 'react-native';

class Bananas extends Component {
  render() {
    let pic = {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
    };
    return <Image source={pic} style={{ width: 193, height: 110, marginTop: 10 }} fsClass="test-class" />;
  }
}`;

it("unknown-element snapshot matches", () => {
  const result = transform(
    `import React, { Component } from 'react';

class componentName extends Component {
  render() {
    return <bogus><h1>A</h1></bogus>;
  }
}

export default componentName;
`,
    {
      filename: "/filename-test.js",
      configFile: false,
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("component-fragment snapshot matches", () => {
  const result = transform(
    `import React, { Component, Fragment } from 'react';

class componentName extends Component {
  render() {
    return <Fragment>A</Fragment>;
  }
}

export default componentName;
`,
    {
      filename: "/filename-test.js",
      configFile: false,
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("component-react-fragment snapshot matches", () => {
  const result = transform(
    `import React, { Component } from 'react';

class componentName extends Component {
  render() {
    return <React.Fragment>A</React.Fragment>;
  }
}

export default componentName;
`,
    {
      filename: "/filename-test.js",
      configFile: false,
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("component-shorthand-fragment snapshot matches", () => {
  const result = transform(
    `import React, { Component } from 'react';

class componentName extends Component {
  render() {
    return <>A</>;
  }
}

export default componentName;
`,
    {
      filename: "/filename-test.js",
      configFile: false,
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("component-annotate-fragment snapshot matches", () => {
  const result = transform(
    `import React, { Component } from 'react';

class componentName extends Component {
  render() {
    return <>A</>;
  }
}

export default componentName;
`,
    {
      filename: "/filename-test.js",
      configFile: false,
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("component-annotate-react-fragment snapshot matches", () => {
  const result = transform(
    `import React, { Component } from 'react';

class componentName extends Component {
  render() {
    return <React.Fragment>
      <h1>Hello world</h1>
    </React.Fragment>;
  }
}

export default componentName;
`,
    {
      filename: "/filename-test.js",
      configFile: false,
      presets: ["@babel/preset-react"],
      plugins: [[plugin, { "annotate-fragments": true }]],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("component-annotate-shorthand-fragment snapshot matches", () => {
  const result = transform(
    `import React, { Component } from 'react';

class componentName extends Component {
  render() {
    return <>
      <h1>Hello world</h1>
    </>;
  }
}

export default componentName;
`,
    {
      filename: "/filename-test.js",
      configFile: false,
      presets: ["@babel/preset-react"],
      plugins: [[plugin, { "annotate-fragments": true }]],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("arrow-noreturn-fragment snapshot matches", () => {
  const result = transform(
    `import React, { Component, Fragment } from 'react';

const componentName = () => (
  <Fragment>
    <h1>Hello world</h1>
  </Fragment>
);

export default componentName;
`,
    {
      filename: "/filename-test.js",
      configFile: false,
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("arrow-noreturn-shorthand-fragment snapshot matches", () => {
  const result = transform(
    `import React, { Component } from 'react';

const componentName = () => (
  <>
    <h1>Hello world</h1>
  </>
);

export default componentName;
`,
    {
      filename: "/filename-test.js",
      configFile: false,
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("arrow-noreturn-react-fragment snapshot matches", () => {
  const result = transform(
    `import React, { Component } from 'react';

const componentName = () => (
  <React.Fragment>
    <h1>Hello world</h1>
  </React.Fragment>
);

export default componentName;
`,
    {
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("arrow-noreturn-annotate-trivial-fragment snapshot matches", () => {
  const result = transform(
    `import React, { Component, Fragment } from 'react';

const componentName = () => (
  <Fragment>Hello world</Fragment>
);

export default componentName;
`,
    {
      filename: "/filename-test.js",
      configFile: false,
      presets: ["@babel/preset-react"],
      plugins: [[plugin, { "annotate-fragments": true }]],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("arrow-noreturn-annotate-fragment snapshot matches", () => {
  const result = transform(
    `import React, { Component, Fragment } from 'react';

const componentName = () => (
  <Fragment>
    <h1>Hello world</h1>
  </Fragment>
);

export default componentName;
`,
    {
      filename: "/filename-test.js",
      configFile: false,
      presets: ["@babel/preset-react"],
      plugins: [[plugin, { "annotate-fragments": true }]],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("arrow-noreturn-annotate-react-fragment snapshot matches", () => {
  const result = transform(
    `import React, { Component } from 'react';

const componentName = () => (
  <React.Fragment>
    <h1>Hello world</h1>
  </React.Fragment>
);

export default componentName;
`,
    {
      filename: "/filename-test.js",
      configFile: false,
      presets: ["@babel/preset-react"],
      plugins: [[plugin, { "annotate-fragments": true }]],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("arrow-noreturn-annotate-shorthand-fragment snapshot matches", () => {
  const result = transform(
    `import React, { Component } from 'react';

const componentName = () => (
  <>
    <h1>Hello world</h1>
  </>
);

export default componentName;
`,
    {
      filename: "/filename-test.js",
      configFile: false,
      presets: ["@babel/preset-react"],
      plugins: [[plugin, { "annotate-fragments": true }]],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("arrow-noreturn-annotate-fragment-once snapshot matches", () => {
  const result = transform(
    `import React, { Component, Fragment } from 'react';

const componentName = () => (
  <Fragment>
    <h1>Hello world</h1>
    <h1>Hola Sol</h1>
  </Fragment>
);

export default componentName;
`,
    {
      filename: "/filename-test.js",
      configFile: false,
      presets: ["@babel/preset-react"],
      plugins: [[plugin, { "annotate-fragments": true }]],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("arrow-noreturn-annotate-fragment-no-whitespace snapshot matches", () => {
  const result = transform(
    `import React, { Component, Fragment } from 'react';

const componentName = () => (
  <Fragment><h1>Hello world</h1><h1>Hola Sol</h1></Fragment>
);

export default componentName;
`,
    {
      filename: "/filename-test.js",
      configFile: false,
      presets: ["@babel/preset-react"],
      plugins: [[plugin, { "annotate-fragments": true }]],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("arrow snapshot matches", () => {
  const result = transform(
    `import React, { Component } from 'react';

const componentName = () => {
  return <div>
    <h1>Hello world</h1>
  </div>;
};

export default componentName;
`,
    {
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("option-attribute snapshot matches", () => {
  const result = transform(
    `import React, { Component } from 'react';

const componentName = () => {
  return <div>
    <h1>Hello world</h1>
  </div>;
};

export default componentName;
`,
    {
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("component snapshot matches", () => {
  const result = transform(
    `import React, { Component } from 'react';

class componentName extends Component {
  render() {
    return <div>
        <h1>Hello world</h1>
      </div>;
  }
}

export default componentName;
`,
    {
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("rawfunction-annotate-fragment snapshot matches", () => {
  const result = transform(
    `import React, { Component, Fragment } from 'react';

function SubComponent() {
  return <Fragment>Sub</Fragment>;
}

const componentName = () => {
  return <Fragment>
    <SubComponent />
  </Fragment>;
};

export default componentName;
`,
    {
      presets: ["@babel/preset-react"],
      plugins: [[plugin, { "annotate-fragments": true }]],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("rawfunction-annotate-react-fragment snapshot matches", () => {
  const result = transform(
    `import React, { Component } from 'react';

function SubComponent() {
  return <React.Fragment>Sub</React.Fragment>;
}

const componentName = () => {
  return <React.Fragment>
    <SubComponent />
  </React.Fragment>;
};

export default componentName;
`,
    {
      presets: ["@babel/preset-react"],
      plugins: [[plugin, { "annotate-fragments": true }]],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("rawfunction-annotate-shorthand-fragment snapshot matches", () => {
  const result = transform(
    `import React, { Component } from 'react';

function SubComponent() {
  return <>Sub</>;
}

const componentName = () => {
  return <>
    <SubComponent />
  </>;
};

export default componentName;
`,
    {
      presets: ["@babel/preset-react"],
      plugins: [[plugin, { "annotate-fragments": true }]],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("rawfunction-fragment snapshot matches", () => {
  const result = transform(
    `import React, { Component, Fragment } from 'react';

function SubComponent() {
  return <Fragment>Sub</Fragment>;
}

const componentName = () => {
  return <Fragment>
    <SubComponent />
  </Fragment>;
};

export default componentName;
`,
    {
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("rawfunction-react-fragment snapshot matches", () => {
  const result = transform(
    `import React, { Component } from 'react';

function SubComponent() {
  return <React.Fragment>Sub</React.Fragment>;
}

const componentName = () => {
  return <React.Fragment>
    <SubComponent />
  </React.Fragment>;
};

export default componentName;
`,
    {
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("rawfunction-shorthand-fragment snapshot matches", () => {
  const result = transform(
    `import React, { Component } from 'react';

function SubComponent() {
  return <>Sub</>;
}

const componentName = () => {
  return <>
    <SubComponent />
  </>;
};

export default componentName;
`,
    {
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("arrow-noreturn snapshot matches", () => {
  const result = transform(
    `import React, { Component } from 'react';

const componentName = () => (
  <div>
    <h1>Hello world</h1>
  </div>
);

export default componentName;
`,
    {
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("tags snapshot matches", () => {
  const result = transform(
    `import React, { Component } from 'react';
import { StyleSheet, Text, TextInput, View, Image, UIManager } from 'react-native';

UIManager.getViewManagerConfig('RCTView').NativeProps.fsClass = "String";

class Bananas extends Component {
  render() {
    let pic = {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
    };
    return <Image source={pic} style={{ width: 193, height: 110, marginTop: 10 }} fsClass="test-class" />;
  }
}

class PizzaTranslator extends Component {
  constructor(props) {
    super(props);
    this.state = { text: '' };
  }

  render() {
    return <View style={{ padding: 10 }}>
        <TextInput style={{
        backgroundColor: '#000',
        color: '#eee',
        padding: 8
      }} placeholder="Type here to translate!" // not supported on iOS
      onChangeText={text => this.setState({ text })} value={this.state.text} />
        <Text style={{ padding: 10, fontSize: 42 }}>
          {this.state.text.split(' ').map(word => word && '🍕').join(' ')}
        </Text>
      </View>;
  }
}

export default function App() {
  return <View style={styles.container}>
      <Text style={{ color: '#eee' }}>FullStory ReactNative testing app</Text>
      <Bananas />
      <PizzaTranslator />
    </View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
`,
    {
      filename: "/filename-test.js",
      configFile: false,
      presets: ["@babel/preset-react"],
      plugins: [[plugin, { native: true }]],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("option-format snapshot matches", () => {
  const result = transform(
    `import React, { Component } from 'react';

const componentName = () => {
  return <div>
    <h1>Hello world</h1>
  </div>;
};

export default componentName;
`,
    {
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("pureComponent-fragment snapshot matches", () => {
  const result = transform(
    `import React, { Fragment } from 'react';

class PureComponentName extends React.PureComponent {
    render() {
        return <Fragment>
            <h1>Hello world</h1>
        </Fragment>;
    }
}

export default PureComponentName;
`,
    {
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("pureComponent-shorthand-fragment snapshot matches", () => {
  const result = transform(
    `import React from 'react';

class PureComponentName extends React.PureComponent {
    render() {
        return <>
            <h1>Hello world</h1>
        </>;
    }
}

export default PureComponentName;
`,
    {
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("pureComponent-react-fragment snapshot matches", () => {
  const result = transform(
    `import React from 'react';

class PureComponentName extends React.PureComponent {
    render() {
        return <React.Fragment>
            <h1>Hello world</h1>
        </React.Fragment>;
    }
}

export default PureComponentName;
`,
    {
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("rawfunction snapshot matches", () => {
  const result = transform(
    `import React, { Component } from 'react';

function SubComponent() {
  return <div>Sub</div>;
}

const componentName = () => {
  return <div>
    <SubComponent />
  </div>;
};

export default componentName;
`,
    {
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("arrow-fragment snapshot matches", () => {
  const result = transform(
    `import React, { Component, Fragment } from 'react';

const componentName = () => {
  return <Fragment>
    <h1>Hello world</h1>
  </Fragment>;
};

export default componentName;
`,
    {
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("arrow-shorthand-fragment snapshot matches", () => {
  const result = transform(
    `import React from 'react';

const componentName = () => {
  return <>
    <h1>Hello world</h1>
  </>;
};

export default componentName;
`,
    {
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("arrow-react-fragment snapshot matches", () => {
  const result = transform(
    `import React, { Component } from 'react';

const componentName = () => {
  return <React.Fragment>
    <h1>Hello world</h1>
  </React.Fragment>;
};

export default componentName;
`,
    {
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("nonJSX snapshot matches", () => {
  const result = transform(
    `import React, { Component } from 'react';

class TestClass extends Component {
  test() {
    return true;
  }
}

export default TestClass;
`,
    {
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("arrow-anonymous-fragment snapshot matches", () => {
  const result = transform(
    `import React, { Component, Fragment } from 'react';

const componentName = () => {
  return (() => <Fragment>
    <h1>Hello world</h1>
  </Fragment>)();
};

export default componentName;
`,
    {
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("arrow-anonymous-shorthand-fragment snapshot matches", () => {
  const result = transform(
    `import React, { Component } from 'react';

const componentName = () => {
  return (() => <>
    <h1>Hello world</h1>
  </>)();
};

export default componentName;
`,
    {
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("arrow-anonymous-react-fragment snapshot matches", () => {
  const result = transform(
    `import React, { Component } from 'react';

const componentName = () => {
  return (() => <React.Fragment>
    <h1>Hello world</h1>
  </React.Fragment>)();
};

export default componentName;
`,
    {
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("pure snapshot matches", () => {
  const result = transform(
    `import React from 'react';

class PureComponentName extends React.PureComponent {
    render() {
        return <div>
            <h1>Hello world</h1>
        </div>;
    }
}

export default PureComponentName;
`,
    {
      presets: ["@babel/preset-react"],
      plugins: [plugin],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("component-fragment-native snapshot matches", () => {
  const result = transform(
    `import React, { Component, Fragment } from 'react';

class componentName extends Component {
  render() {
    return <Fragment>A</Fragment>;
  }
}

export default componentName;
`,
    {
      presets: ["@babel/preset-react"],
      plugins: [[plugin, { native: true }]],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("pure-native snapshot matches", () => {
  const result = transform(
    `import React from 'react';

class PureComponentName extends React.PureComponent {
    render() {
        return <div>
            <h1>Hello world</h1>
        </div>;
    }
}

export default PureComponentName;
`,
    {
      filename: "/filename-test.js",
      configFile: false,
      presets: ["@babel/preset-react"],
      plugins: [[plugin, { native: true }]],
    }
  );
  expect(result?.code).toMatchSnapshot();
});

it("Bananas ignore components dataSentrySourceFile=nomatch dataSentryComponent=nomatch dataSentryElement=nomatch snapshot matches", () => {
  const result = transform(BananasStandardInput, {
    filename: "/filename-test.js",
    configFile: false,
    presets: ["@babel/preset-react"],
    plugins: [[plugin, { native: true, ignoreComponents: [["nomatch.js", "nomatch", "nomatch"]] }]],
  });
  expect(result?.code).toMatchInlineSnapshot(`
    "import React, { Component } from 'react';
    import { Image } from 'react-native';
    class Bananas extends Component {
      render() {
        let pic = {
          uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
        };
        return /*#__PURE__*/React.createElement(Image, {
          source: pic,
          style: {
            width: 193,
            height: 110,
            marginTop: 10
          },
          fsClass: \\"test-class\\",
          dataSentryElement: \\"Image\\",
          dataSentryComponent: \\"Bananas\\",
          dataSentrySourceFile: \\"filename-test.js\\"
        });
      }
    }"
  `);
});

it("ignore components dataSentrySourceFile=* dataSentryComponent=nomatch dataSentryElement=nomatch snapshot matches", () => {
  const result = transform(BananasStandardInput, {
    filename: "/filename-test.js",
    configFile: false,
    presets: ["@babel/preset-react"],
    plugins: [[plugin, { native: true, ignoreComponents: [["*", "nomatch", "nomatch"]] }]],
  });
  expect(result?.code).toMatchInlineSnapshot(`
    "import React, { Component } from 'react';
    import { Image } from 'react-native';
    class Bananas extends Component {
      render() {
        let pic = {
          uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
        };
        return /*#__PURE__*/React.createElement(Image, {
          source: pic,
          style: {
            width: 193,
            height: 110,
            marginTop: 10
          },
          fsClass: \\"test-class\\",
          dataSentryElement: \\"Image\\",
          dataSentryComponent: \\"Bananas\\",
          dataSentrySourceFile: \\"filename-test.js\\"
        });
      }
    }"
  `);
});

it("Bananas ignore components dataSentrySourceFile=nomatch dataSentryComponent=* dataSentryElement=nomatch snapshot matches", () => {
  const result = transform(BananasStandardInput, {
    filename: "/filename-test.js",
    configFile: false,
    presets: ["@babel/preset-react"],
    plugins: [[plugin, { native: true, ignoreComponents: [["nomatch.js", "*", "nomatch"]] }]],
  });
  expect(result?.code).toMatchInlineSnapshot(`
    "import React, { Component } from 'react';
    import { Image } from 'react-native';
    class Bananas extends Component {
      render() {
        let pic = {
          uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
        };
        return /*#__PURE__*/React.createElement(Image, {
          source: pic,
          style: {
            width: 193,
            height: 110,
            marginTop: 10
          },
          fsClass: \\"test-class\\",
          dataSentryElement: \\"Image\\",
          dataSentryComponent: \\"Bananas\\",
          dataSentrySourceFile: \\"filename-test.js\\"
        });
      }
    }"
  `);
});

it("Bananas ignore components dataSentrySourceFile=nomatch dataSentryComponent=nomatch dataSentryElement=* snapshot matches", () => {
  const result = transform(BananasStandardInput, {
    filename: "/filename-test.js",
    configFile: false,
    presets: ["@babel/preset-react"],
    plugins: [[plugin, { native: true, ignoreComponents: [["nomatch.js", "nomatch", "*"]] }]],
  });
  expect(result?.code).toMatchInlineSnapshot(`
    "import React, { Component } from 'react';
    import { Image } from 'react-native';
    class Bananas extends Component {
      render() {
        let pic = {
          uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
        };
        return /*#__PURE__*/React.createElement(Image, {
          source: pic,
          style: {
            width: 193,
            height: 110,
            marginTop: 10
          },
          fsClass: \\"test-class\\",
          dataSentryElement: \\"Image\\",
          dataSentryComponent: \\"Bananas\\",
          dataSentrySourceFile: \\"filename-test.js\\"
        });
      }
    }"
  `);
});

it("Bananas ignore components dataSentrySourceFile=* dataSentryComponent=* dataSentryElement=nomatch snapshot matches", () => {
  const result = transform(BananasStandardInput, {
    filename: "/filename-test.js",
    configFile: false,
    presets: ["@babel/preset-react"],
    plugins: [[plugin, { native: true, ignoreComponents: [["nomatch.js", "nomatch", "nomatch"]] }]],
  });
  expect(result?.code).toMatchInlineSnapshot(`
    "import React, { Component } from 'react';
    import { Image } from 'react-native';
    class Bananas extends Component {
      render() {
        let pic = {
          uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
        };
        return /*#__PURE__*/React.createElement(Image, {
          source: pic,
          style: {
            width: 193,
            height: 110,
            marginTop: 10
          },
          fsClass: \\"test-class\\",
          dataSentryElement: \\"Image\\",
          dataSentryComponent: \\"Bananas\\",
          dataSentrySourceFile: \\"filename-test.js\\"
        });
      }
    }"
  `);
});

it("Bananas ignore components dataSentrySourceFile=* dataSentryComponent=nomatch dataSentryElement=* snapshot matches", () => {
  const result = transform(BananasStandardInput, {
    filename: "/filename-test.js",
    configFile: false,
    presets: ["@babel/preset-react"],
    plugins: [[plugin, { native: true, ignoreComponents: [["nomatch.js", "nomatch", "nomatch"]] }]],
  });
  expect(result?.code).toMatchInlineSnapshot(`
    "import React, { Component } from 'react';
    import { Image } from 'react-native';
    class Bananas extends Component {
      render() {
        let pic = {
          uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
        };
        return /*#__PURE__*/React.createElement(Image, {
          source: pic,
          style: {
            width: 193,
            height: 110,
            marginTop: 10
          },
          fsClass: \\"test-class\\",
          dataSentryElement: \\"Image\\",
          dataSentryComponent: \\"Bananas\\",
          dataSentrySourceFile: \\"filename-test.js\\"
        });
      }
    }"
  `);
});

it("Bananas ignore components dataSentrySourceFile=nomatch dataSentryComponent=* dataSentryElement=* snapshot matches", () => {
  const result = transform(BananasStandardInput, {
    filename: "/filename-test.js",
    configFile: false,
    presets: ["@babel/preset-react"],
    plugins: [[plugin, { native: true, ignoreComponents: [["nomatch.js", "nomatch", "nomatch"]] }]],
  });
  expect(result?.code).toMatchInlineSnapshot(`
    "import React, { Component } from 'react';
    import { Image } from 'react-native';
    class Bananas extends Component {
      render() {
        let pic = {
          uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
        };
        return /*#__PURE__*/React.createElement(Image, {
          source: pic,
          style: {
            width: 193,
            height: 110,
            marginTop: 10
          },
          fsClass: \\"test-class\\",
          dataSentryElement: \\"Image\\",
          dataSentryComponent: \\"Bananas\\",
          dataSentrySourceFile: \\"filename-test.js\\"
        });
      }
    }"
  `);
});

// This tests out matching only `dataSentryElement`, with * for the others
it("Bananas ignore components dataSentrySourceFile=* dataSentryComponent=* dataSentryElement=match snapshot matches", () => {
  const result = transform(BananasStandardInput, {
    filename: "/filename-test.js",
    configFile: false,
    presets: ["@babel/preset-react"],
    plugins: [[plugin, { native: true, ignoreComponents: ["Image"] }]],
  });
  expect(result?.code).toMatchInlineSnapshot(`
    "import React, { Component } from 'react';
    import { Image } from 'react-native';
    class Bananas extends Component {
      render() {
        let pic = {
          uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
        };
        return /*#__PURE__*/React.createElement(Image, {
          source: pic,
          style: {
            width: 193,
            height: 110,
            marginTop: 10
          },
          fsClass: \\"test-class\\"
        });
      }
    }"
  `);
});

it("Bananas incompatible plugin @react-navigation source snapshot matches", () => {
  const result = transform(BananasStandardInput, {
    filename: "test/node_modules/@react-navigation/core/filename-test.js",
    presets: ["@babel/preset-react"],
    plugins: [[plugin, { native: true }]],
  });
  expect(result?.code).toMatchInlineSnapshot(`
    "import React, { Component } from 'react';
    import { Image } from 'react-native';
    class Bananas extends Component {
      render() {
        let pic = {
          uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
        };
        return /*#__PURE__*/React.createElement(Image, {
          source: pic,
          style: {
            width: 193,
            height: 110,
            marginTop: 10
          },
          fsClass: \\"test-class\\"
        });
      }
    }"
  `);
});
