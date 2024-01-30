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

const BananasPizzaAppStandardOutputNoAttributes = `
"import React, { Component } from 'react';
import { StyleSheet, Text, TextInput, View, Image, UIManager } from 'react-native';
UIManager.getViewManagerConfig('RCTView').NativeProps.fsClass = \\"String\\";

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

}

class PizzaTranslator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ''
    };
  }

  render() {
    return /*#__PURE__*/React.createElement(View, {
      style: {
        padding: 10
      }
    }, /*#__PURE__*/React.createElement(TextInput, {
      style: {
        backgroundColor: '#000',
        color: '#eee',
        padding: 8
      },
      placeholder: \\"Type here to translate!\\" // not supported on iOS
      ,
      onChangeText: text => this.setState({
        text
      }),
      value: this.state.text
    }), /*#__PURE__*/React.createElement(Text, {
      style: {
        padding: 10,
        fontSize: 42
      }
    }, this.state.text.split(' ').map(word => word && '🍕').join(' ')));
  }

}

export default function App() {
  return /*#__PURE__*/React.createElement(View, {
    style: styles.container
  }, /*#__PURE__*/React.createElement(Text, {
    style: {
      color: '#eee'
    }
  }, \\"FullStory ReactNative testing app\\"), /*#__PURE__*/React.createElement(Bananas, null), /*#__PURE__*/React.createElement(PizzaTranslator, null));
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
});"
`;

const BananasPizzaAppStandardOutputBananasPizzaAppAttributesNoBananasElements = `
"import React, { Component } from 'react';
import { StyleSheet, Text, TextInput, View, Image, UIManager } from 'react-native';
UIManager.getViewManagerConfig('RCTView').NativeProps.fsClass = \\"String\\";

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

}

class PizzaTranslator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ''
    };
  }

  render() {
    return /*#__PURE__*/React.createElement(View, {
      style: {
        padding: 10
      },
      dataSentryElement: \\"View\\",
      dataSentryComponent: \\"PizzaTranslator\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    }, /*#__PURE__*/React.createElement(TextInput, {
      style: {
        backgroundColor: '#000',
        color: '#eee',
        padding: 8
      },
      placeholder: \\"Type here to translate!\\" // not supported on iOS
      ,
      onChangeText: text => this.setState({
        text
      }),
      value: this.state.text,
      dataSentryElement: \\"TextInput\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    }), /*#__PURE__*/React.createElement(Text, {
      style: {
        padding: 10,
        fontSize: 42
      },
      dataSentryElement: \\"Text\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    }, this.state.text.split(' ').map(word => word && '🍕').join(' ')));
  }

}

export default function App() {
  return /*#__PURE__*/React.createElement(View, {
    style: styles.container,
    dataSentryElement: \\"View\\",
    dataSentryComponent: \\"App\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }, /*#__PURE__*/React.createElement(Text, {
    style: {
      color: '#eee'
    },
    dataSentryElement: \\"Text\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }, \\"FullStory ReactNative testing app\\"), /*#__PURE__*/React.createElement(Bananas, null), /*#__PURE__*/React.createElement(PizzaTranslator, {
    dataSentryElement: \\"PizzaTranslator\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }));
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
});"
`;

const BananasPizzaAppStandardOutputBananasPizzaAppAttributesNoPizzaElements = `
"import React, { Component } from 'react';
import { StyleSheet, Text, TextInput, View, Image, UIManager } from 'react-native';
UIManager.getViewManagerConfig('RCTView').NativeProps.fsClass = \\"String\\";

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

}

class PizzaTranslator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ''
    };
  }

  render() {
    return /*#__PURE__*/React.createElement(View, {
      style: {
        padding: 10
      },
      dataSentryElement: \\"View\\",
      dataSentryComponent: \\"PizzaTranslator\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    }, /*#__PURE__*/React.createElement(TextInput, {
      style: {
        backgroundColor: '#000',
        color: '#eee',
        padding: 8
      },
      placeholder: \\"Type here to translate!\\" // not supported on iOS
      ,
      onChangeText: text => this.setState({
        text
      }),
      value: this.state.text,
      dataSentryElement: \\"TextInput\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    }), /*#__PURE__*/React.createElement(Text, {
      style: {
        padding: 10,
        fontSize: 42
      },
      dataSentryElement: \\"Text\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    }, this.state.text.split(' ').map(word => word && '🍕').join(' ')));
  }

}

export default function App() {
  return /*#__PURE__*/React.createElement(View, {
    style: styles.container,
    dataSentryElement: \\"View\\",
    dataSentryComponent: \\"App\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }, /*#__PURE__*/React.createElement(Text, {
    style: {
      color: '#eee'
    },
    dataSentryElement: \\"Text\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }, \\"FullStory ReactNative testing app\\"), /*#__PURE__*/React.createElement(Bananas, {
    dataSentryElement: \\"Bananas\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }), /*#__PURE__*/React.createElement(PizzaTranslator, null));
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
});"
`;

const BananasPizzaAppStandardOutputBananasPizzaAppAttributesNoBananasPizzaElements = `
"import React, { Component } from 'react';
import { StyleSheet, Text, TextInput, View, Image, UIManager } from 'react-native';
UIManager.getViewManagerConfig('RCTView').NativeProps.fsClass = \\"String\\";

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

}

class PizzaTranslator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ''
    };
  }

  render() {
    return /*#__PURE__*/React.createElement(View, {
      style: {
        padding: 10
      },
      dataSentryElement: \\"View\\",
      dataSentryComponent: \\"PizzaTranslator\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    }, /*#__PURE__*/React.createElement(TextInput, {
      style: {
        backgroundColor: '#000',
        color: '#eee',
        padding: 8
      },
      placeholder: \\"Type here to translate!\\" // not supported on iOS
      ,
      onChangeText: text => this.setState({
        text
      }),
      value: this.state.text,
      dataSentryElement: \\"TextInput\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    }), /*#__PURE__*/React.createElement(Text, {
      style: {
        padding: 10,
        fontSize: 42
      },
      dataSentryElement: \\"Text\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    }, this.state.text.split(' ').map(word => word && '🍕').join(' ')));
  }

}

export default function App() {
  return /*#__PURE__*/React.createElement(View, {
    style: styles.container,
    dataSentryElement: \\"View\\",
    dataSentryComponent: \\"App\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }, /*#__PURE__*/React.createElement(Text, {
    style: {
      color: '#eee'
    },
    dataSentryElement: \\"Text\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }, \\"FullStory ReactNative testing app\\"), /*#__PURE__*/React.createElement(Bananas, null), /*#__PURE__*/React.createElement(PizzaTranslator, null));
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
});"
`;

const BananasPizzaAppStandardOutputBananasPizzaAppAttributes = `
"import React, { Component } from 'react';
import { StyleSheet, Text, TextInput, View, Image, UIManager } from 'react-native';
UIManager.getViewManagerConfig('RCTView').NativeProps.fsClass = \\"String\\";

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

}

class PizzaTranslator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ''
    };
  }

  render() {
    return /*#__PURE__*/React.createElement(View, {
      style: {
        padding: 10
      },
      dataSentryElement: \\"View\\",
      dataSentryComponent: \\"PizzaTranslator\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    }, /*#__PURE__*/React.createElement(TextInput, {
      style: {
        backgroundColor: '#000',
        color: '#eee',
        padding: 8
      },
      placeholder: \\"Type here to translate!\\" // not supported on iOS
      ,
      onChangeText: text => this.setState({
        text
      }),
      value: this.state.text,
      dataSentryElement: \\"TextInput\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    }), /*#__PURE__*/React.createElement(Text, {
      style: {
        padding: 10,
        fontSize: 42
      },
      dataSentryElement: \\"Text\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    }, this.state.text.split(' ').map(word => word && '🍕').join(' ')));
  }

}

export default function App() {
  return /*#__PURE__*/React.createElement(View, {
    style: styles.container,
    dataSentryElement: \\"View\\",
    dataSentryComponent: \\"App\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }, /*#__PURE__*/React.createElement(Text, {
    style: {
      color: '#eee'
    },
    dataSentryElement: \\"Text\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }, \\"FullStory ReactNative testing app\\"), /*#__PURE__*/React.createElement(Bananas, {
    dataSentryElement: \\"Bananas\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }), /*#__PURE__*/React.createElement(PizzaTranslator, {
    dataSentryElement: \\"PizzaTranslator\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }));
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
});"
`;

const BananasPizzaAppStandardOutputBananasAttributes = `
"import React, { Component } from 'react';
import { StyleSheet, Text, TextInput, View, Image, UIManager } from 'react-native';
UIManager.getViewManagerConfig('RCTView').NativeProps.fsClass = \\"String\\";

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

}

class PizzaTranslator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ''
    };
  }

  render() {
    return /*#__PURE__*/React.createElement(View, {
      style: {
        padding: 10
      }
    }, /*#__PURE__*/React.createElement(TextInput, {
      style: {
        backgroundColor: '#000',
        color: '#eee',
        padding: 8
      },
      placeholder: \\"Type here to translate!\\" // not supported on iOS
      ,
      onChangeText: text => this.setState({
        text
      }),
      value: this.state.text,
      dataSentryElement: \\"TextInput\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    }), /*#__PURE__*/React.createElement(Text, {
      style: {
        padding: 10,
        fontSize: 42
      },
      dataSentryElement: \\"Text\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    }, this.state.text.split(' ').map(word => word && '🍕').join(' ')));
  }

}

export default function App() {
  return /*#__PURE__*/React.createElement(View, {
    style: styles.container
  }, /*#__PURE__*/React.createElement(Text, {
    style: {
      color: '#eee'
    },
    dataSentryElement: \\"Text\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }, \\"FullStory ReactNative testing app\\"), /*#__PURE__*/React.createElement(Bananas, {
    dataSentryElement: \\"Bananas\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }), /*#__PURE__*/React.createElement(PizzaTranslator, {
    dataSentryElement: \\"PizzaTranslator\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }));
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
});"
`;

const BananasPizzaAppStandardOutputPizzaAttributes = `
"import React, { Component } from 'react';
import { StyleSheet, Text, TextInput, View, Image, UIManager } from 'react-native';
UIManager.getViewManagerConfig('RCTView').NativeProps.fsClass = \\"String\\";

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

}

class PizzaTranslator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ''
    };
  }

  render() {
    return /*#__PURE__*/React.createElement(View, {
      style: {
        padding: 10
      },
      dataSentryElement: \\"View\\",
      dataSentryComponent: \\"PizzaTranslator\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    }, /*#__PURE__*/React.createElement(TextInput, {
      style: {
        backgroundColor: '#000',
        color: '#eee',
        padding: 8
      },
      placeholder: \\"Type here to translate!\\" // not supported on iOS
      ,
      onChangeText: text => this.setState({
        text
      }),
      value: this.state.text,
      dataSentryElement: \\"TextInput\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    }), /*#__PURE__*/React.createElement(Text, {
      style: {
        padding: 10,
        fontSize: 42
      },
      dataSentryElement: \\"Text\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    }, this.state.text.split(' ').map(word => word && '🍕').join(' ')));
  }

}

export default function App() {
  return /*#__PURE__*/React.createElement(View, {
    style: styles.container
  }, /*#__PURE__*/React.createElement(Text, {
    style: {
      color: '#eee'
    },
    dataSentryElement: \\"Text\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }, \\"FullStory ReactNative testing app\\"), /*#__PURE__*/React.createElement(Bananas, {
    dataSentryElement: \\"Bananas\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }), /*#__PURE__*/React.createElement(PizzaTranslator, {
    dataSentryElement: \\"PizzaTranslator\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }));
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
});"
`;

const BananasPizzaAppStandardOutputAppAttributes = `
"import React, { Component } from 'react';
import { StyleSheet, Text, TextInput, View, Image, UIManager } from 'react-native';
UIManager.getViewManagerConfig('RCTView').NativeProps.fsClass = \\"String\\";

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

}

class PizzaTranslator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ''
    };
  }

  render() {
    return /*#__PURE__*/React.createElement(View, {
      style: {
        padding: 10
      }
    }, /*#__PURE__*/React.createElement(TextInput, {
      style: {
        backgroundColor: '#000',
        color: '#eee',
        padding: 8
      },
      placeholder: \\"Type here to translate!\\" // not supported on iOS
      ,
      onChangeText: text => this.setState({
        text
      }),
      value: this.state.text,
      dataSentryElement: \\"TextInput\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    }), /*#__PURE__*/React.createElement(Text, {
      style: {
        padding: 10,
        fontSize: 42
      },
      dataSentryElement: \\"Text\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    }, this.state.text.split(' ').map(word => word && '🍕').join(' ')));
  }

}

export default function App() {
  return /*#__PURE__*/React.createElement(View, {
    style: styles.container,
    dataSentryElement: \\"View\\",
    dataSentryComponent: \\"App\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }, /*#__PURE__*/React.createElement(Text, {
    style: {
      color: '#eee'
    },
    dataSentryElement: \\"Text\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }, \\"FullStory ReactNative testing app\\"), /*#__PURE__*/React.createElement(Bananas, {
    dataSentryElement: \\"Bananas\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }), /*#__PURE__*/React.createElement(PizzaTranslator, {
    dataSentryElement: \\"PizzaTranslator\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }));
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
});"
`;

const BananasPizzaAppStandardOutputBananasPizzaAttributes = `
"import React, { Component } from 'react';
import { StyleSheet, Text, TextInput, View, Image, UIManager } from 'react-native';
UIManager.getViewManagerConfig('RCTView').NativeProps.fsClass = \\"String\\";

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

}

class PizzaTranslator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ''
    };
  }

  render() {
    return /*#__PURE__*/React.createElement(View, {
      style: {
        padding: 10
      },
      dataSentryElement: \\"View\\",
      dataSentryComponent: \\"PizzaTranslator\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    }, /*#__PURE__*/React.createElement(TextInput, {
      style: {
        backgroundColor: '#000',
        color: '#eee',
        padding: 8
      },
      placeholder: \\"Type here to translate!\\" // not supported on iOS
      ,
      onChangeText: text => this.setState({
        text
      }),
      value: this.state.text,
      dataSentryElement: \\"TextInput\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    }), /*#__PURE__*/React.createElement(Text, {
      style: {
        padding: 10,
        fontSize: 42
      },
      dataSentryElement: \\"Text\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    }, this.state.text.split(' ').map(word => word && '🍕').join(' ')));
  }

}

export default function App() {
  return /*#__PURE__*/React.createElement(View, {
    style: styles.container
  }, /*#__PURE__*/React.createElement(Text, {
    style: {
      color: '#eee'
    },
    dataSentryElement: \\"Text\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }, \\"FullStory ReactNative testing app\\"), /*#__PURE__*/React.createElement(Bananas, {
    dataSentryElement: \\"Bananas\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }), /*#__PURE__*/React.createElement(PizzaTranslator, {
    dataSentryElement: \\"PizzaTranslator\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }));
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
});"
`;

const BananasPizzaAppStandardOutputBananasAppAttributes = `
"import React, { Component } from 'react';
import { StyleSheet, Text, TextInput, View, Image, UIManager } from 'react-native';
UIManager.getViewManagerConfig('RCTView').NativeProps.fsClass = \\"String\\";

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

}

class PizzaTranslator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ''
    };
  }

  render() {
    return /*#__PURE__*/React.createElement(View, {
      style: {
        padding: 10
      }
    }, /*#__PURE__*/React.createElement(TextInput, {
      style: {
        backgroundColor: '#000',
        color: '#eee',
        padding: 8
      },
      placeholder: \\"Type here to translate!\\" // not supported on iOS
      ,
      onChangeText: text => this.setState({
        text
      }),
      value: this.state.text,
      dataSentryElement: \\"TextInput\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    }), /*#__PURE__*/React.createElement(Text, {
      style: {
        padding: 10,
        fontSize: 42
      },
      dataSentryElement: \\"Text\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    }, this.state.text.split(' ').map(word => word && '🍕').join(' ')));
  }

}

export default function App() {
  return /*#__PURE__*/React.createElement(View, {
    style: styles.container,
    dataSentryElement: \\"View\\",
    dataSentryComponent: \\"App\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }, /*#__PURE__*/React.createElement(Text, {
    style: {
      color: '#eee'
    },
    dataSentryElement: \\"Text\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }, \\"FullStory ReactNative testing app\\"), /*#__PURE__*/React.createElement(Bananas, {
    dataSentryElement: \\"Bananas\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }), /*#__PURE__*/React.createElement(PizzaTranslator, {
    dataSentryElement: \\"PizzaTranslator\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }));
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
});"
`;

const BananasPizzaAppStandardOutputPizzaAppAttributes = `
"import React, { Component } from 'react';
import { StyleSheet, Text, TextInput, View, Image, UIManager } from 'react-native';
UIManager.getViewManagerConfig('RCTView').NativeProps.fsClass = \\"String\\";

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

}

class PizzaTranslator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ''
    };
  }

  render() {
    return /*#__PURE__*/React.createElement(View, {
      style: {
        padding: 10
      },
      dataSentryElement: \\"View\\",
      dataSentryComponent: \\"PizzaTranslator\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    }, /*#__PURE__*/React.createElement(TextInput, {
      style: {
        backgroundColor: '#000',
        color: '#eee',
        padding: 8
      },
      placeholder: \\"Type here to translate!\\" // not supported on iOS
      ,
      onChangeText: text => this.setState({
        text
      }),
      value: this.state.text,
      dataSentryElement: \\"TextInput\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    }), /*#__PURE__*/React.createElement(Text, {
      style: {
        padding: 10,
        fontSize: 42
      },
      dataSentryElement: \\"Text\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    }, this.state.text.split(' ').map(word => word && '🍕').join(' ')));
  }

}

export default function App() {
  return /*#__PURE__*/React.createElement(View, {
    style: styles.container,
    dataSentryElement: \\"View\\",
    dataSentryComponent: \\"App\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }, /*#__PURE__*/React.createElement(Text, {
    style: {
      color: '#eee'
    },
    dataSentryElement: \\"Text\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }, \\"FullStory ReactNative testing app\\"), /*#__PURE__*/React.createElement(Bananas, {
    dataSentryElement: \\"Bananas\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }), /*#__PURE__*/React.createElement(PizzaTranslator, {
    dataSentryElement: \\"PizzaTranslator\\",
    dataSentrySourceFile: \\"filename-test.js\\"
  }));
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
});"
`;

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

const BananasStandardOutputNoAttributes = `
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
`;

const BananasStandardOutputWithAttributes = `
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
`;

const BananasStandardOutputWithFSTagName = `
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
      fsTagName: \\"Bananas\\",
      dataSentrySourceFile: \\"filename-test.js\\"
    });
  }

}"
`;

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
  expect(result?.code).toMatchInlineSnapshot(
    `
    "\\"use strict\\";

    function _typeof(obj) { \\"@babel/helpers - typeof\\"; return _typeof = \\"function\\" == typeof Symbol && \\"symbol\\" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && \\"function\\" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? \\"symbol\\" : typeof obj; }, _typeof(obj); }
    var _react = _interopRequireWildcard(require(\\"react\\"));
    var _reactNative = require(\\"react-native\\");
    function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== \\"function\\") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
    function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== \\"object\\" && typeof obj !== \\"function\\") { return { \\"default\\": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== \\"default\\" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj[\\"default\\"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\\"Cannot call a class as a function\\"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\\"value\\" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \\"prototype\\", { writable: false }); return Constructor; }
    function _toPropertyKey(arg) { var key = _toPrimitive(arg, \\"string\\"); return _typeof(key) === \\"symbol\\" ? key : String(key); }
    function _toPrimitive(input, hint) { if (_typeof(input) !== \\"object\\" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || \\"default\\"); if (_typeof(res) !== \\"object\\") return res; throw new TypeError(\\"@@toPrimitive must return a primitive value.\\"); } return (hint === \\"string\\" ? String : Number)(input); }
    function _inherits(subClass, superClass) { if (typeof superClass !== \\"function\\" && superClass !== null) { throw new TypeError(\\"Super expression must either be null or a function\\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, \\"prototype\\", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
    function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \\"object\\" || typeof call === \\"function\\")) { return call; } else if (call !== void 0) { throw new TypeError(\\"Derived constructors may only return object or undefined\\"); } return _assertThisInitialized(self); }
    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\\"this hasn't been initialised - super() hasn't been called\\"); } return self; }
    function _isNativeReflectConstruct() { if (typeof Reflect === \\"undefined\\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \\"function\\") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
    var Bananas = /*#__PURE__*/function (_Component) {
      _inherits(Bananas, _Component);
      var _super = _createSuper(Bananas);
      function Bananas() {
        _classCallCheck(this, Bananas);
        return _super.apply(this, arguments);
      }
      _createClass(Bananas, [{
        key: \\"render\\",
        value: function render() {
          var pic = {
            uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
          };
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Image, {
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
      }]);
      return Bananas;
    }(_react.Component);"
  `
  );
});

it("ignore components dataSentrySourceFile=* dataSentryComponent=nomatch dataSentryElement=nomatch snapshot matches", () => {
  const result = transform(BananasStandardInput, {
    filename: "/filename-test.js",
    configFile: false,
    presets: ["@babel/preset-react"],
    plugins: [[plugin, { native: true, ignoreComponents: [["*", "nomatch", "nomatch"]] }]],
  });
  expect(result?.code).toMatchInlineSnapshot(
    `
    "\\"use strict\\";

    function _typeof(obj) { \\"@babel/helpers - typeof\\"; return _typeof = \\"function\\" == typeof Symbol && \\"symbol\\" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && \\"function\\" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? \\"symbol\\" : typeof obj; }, _typeof(obj); }
    var _react = _interopRequireWildcard(require(\\"react\\"));
    var _reactNative = require(\\"react-native\\");
    function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== \\"function\\") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
    function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== \\"object\\" && typeof obj !== \\"function\\") { return { \\"default\\": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== \\"default\\" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj[\\"default\\"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\\"Cannot call a class as a function\\"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\\"value\\" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \\"prototype\\", { writable: false }); return Constructor; }
    function _toPropertyKey(arg) { var key = _toPrimitive(arg, \\"string\\"); return _typeof(key) === \\"symbol\\" ? key : String(key); }
    function _toPrimitive(input, hint) { if (_typeof(input) !== \\"object\\" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || \\"default\\"); if (_typeof(res) !== \\"object\\") return res; throw new TypeError(\\"@@toPrimitive must return a primitive value.\\"); } return (hint === \\"string\\" ? String : Number)(input); }
    function _inherits(subClass, superClass) { if (typeof superClass !== \\"function\\" && superClass !== null) { throw new TypeError(\\"Super expression must either be null or a function\\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, \\"prototype\\", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
    function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \\"object\\" || typeof call === \\"function\\")) { return call; } else if (call !== void 0) { throw new TypeError(\\"Derived constructors may only return object or undefined\\"); } return _assertThisInitialized(self); }
    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\\"this hasn't been initialised - super() hasn't been called\\"); } return self; }
    function _isNativeReflectConstruct() { if (typeof Reflect === \\"undefined\\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \\"function\\") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
    var Bananas = /*#__PURE__*/function (_Component) {
      _inherits(Bananas, _Component);
      var _super = _createSuper(Bananas);
      function Bananas() {
        _classCallCheck(this, Bananas);
        return _super.apply(this, arguments);
      }
      _createClass(Bananas, [{
        key: \\"render\\",
        value: function render() {
          var pic = {
            uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
          };
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Image, {
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
      }]);
      return Bananas;
    }(_react.Component);"
  `
  );
});

it("Bananas ignore components dataSentrySourceFile=nomatch dataSentryComponent=* dataSentryElement=nomatch snapshot matches", () => {
  const result = transform(BananasStandardInput, {
    filename: "/filename-test.js",
    configFile: false,
    presets: ["@babel/preset-react"],
    plugins: [[plugin, { native: true, ignoreComponents: [["nomatch.js", "*", "nomatch"]] }]],
  });
  expect(result?.code).toMatchInlineSnapshot(
    `
    "\\"use strict\\";

    function _typeof(obj) { \\"@babel/helpers - typeof\\"; return _typeof = \\"function\\" == typeof Symbol && \\"symbol\\" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && \\"function\\" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? \\"symbol\\" : typeof obj; }, _typeof(obj); }
    var _react = _interopRequireWildcard(require(\\"react\\"));
    var _reactNative = require(\\"react-native\\");
    function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== \\"function\\") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
    function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== \\"object\\" && typeof obj !== \\"function\\") { return { \\"default\\": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== \\"default\\" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj[\\"default\\"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\\"Cannot call a class as a function\\"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\\"value\\" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \\"prototype\\", { writable: false }); return Constructor; }
    function _toPropertyKey(arg) { var key = _toPrimitive(arg, \\"string\\"); return _typeof(key) === \\"symbol\\" ? key : String(key); }
    function _toPrimitive(input, hint) { if (_typeof(input) !== \\"object\\" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || \\"default\\"); if (_typeof(res) !== \\"object\\") return res; throw new TypeError(\\"@@toPrimitive must return a primitive value.\\"); } return (hint === \\"string\\" ? String : Number)(input); }
    function _inherits(subClass, superClass) { if (typeof superClass !== \\"function\\" && superClass !== null) { throw new TypeError(\\"Super expression must either be null or a function\\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, \\"prototype\\", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
    function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \\"object\\" || typeof call === \\"function\\")) { return call; } else if (call !== void 0) { throw new TypeError(\\"Derived constructors may only return object or undefined\\"); } return _assertThisInitialized(self); }
    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\\"this hasn't been initialised - super() hasn't been called\\"); } return self; }
    function _isNativeReflectConstruct() { if (typeof Reflect === \\"undefined\\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \\"function\\") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
    var Bananas = /*#__PURE__*/function (_Component) {
      _inherits(Bananas, _Component);
      var _super = _createSuper(Bananas);
      function Bananas() {
        _classCallCheck(this, Bananas);
        return _super.apply(this, arguments);
      }
      _createClass(Bananas, [{
        key: \\"render\\",
        value: function render() {
          var pic = {
            uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
          };
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Image, {
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
      }]);
      return Bananas;
    }(_react.Component);"
  `
  );
});

it("Bananas ignore components dataSentrySourceFile=nomatch dataSentryComponent=nomatch dataSentryElement=* snapshot matches", () => {
  const result = transform(BananasStandardInput, {
    filename: "/filename-test.js",
    configFile: false,
    presets: ["@babel/preset-react"],
    plugins: [[plugin, { native: true, ignoreComponents: [["nomatch.js", "nomatch", "*"]] }]],
  });
  expect(result?.code).toMatchInlineSnapshot(
    `
    "\\"use strict\\";

    function _typeof(obj) { \\"@babel/helpers - typeof\\"; return _typeof = \\"function\\" == typeof Symbol && \\"symbol\\" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && \\"function\\" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? \\"symbol\\" : typeof obj; }, _typeof(obj); }
    var _react = _interopRequireWildcard(require(\\"react\\"));
    var _reactNative = require(\\"react-native\\");
    function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== \\"function\\") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
    function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== \\"object\\" && typeof obj !== \\"function\\") { return { \\"default\\": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== \\"default\\" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj[\\"default\\"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\\"Cannot call a class as a function\\"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\\"value\\" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \\"prototype\\", { writable: false }); return Constructor; }
    function _toPropertyKey(arg) { var key = _toPrimitive(arg, \\"string\\"); return _typeof(key) === \\"symbol\\" ? key : String(key); }
    function _toPrimitive(input, hint) { if (_typeof(input) !== \\"object\\" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || \\"default\\"); if (_typeof(res) !== \\"object\\") return res; throw new TypeError(\\"@@toPrimitive must return a primitive value.\\"); } return (hint === \\"string\\" ? String : Number)(input); }
    function _inherits(subClass, superClass) { if (typeof superClass !== \\"function\\" && superClass !== null) { throw new TypeError(\\"Super expression must either be null or a function\\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, \\"prototype\\", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
    function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \\"object\\" || typeof call === \\"function\\")) { return call; } else if (call !== void 0) { throw new TypeError(\\"Derived constructors may only return object or undefined\\"); } return _assertThisInitialized(self); }
    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\\"this hasn't been initialised - super() hasn't been called\\"); } return self; }
    function _isNativeReflectConstruct() { if (typeof Reflect === \\"undefined\\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \\"function\\") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
    var Bananas = /*#__PURE__*/function (_Component) {
      _inherits(Bananas, _Component);
      var _super = _createSuper(Bananas);
      function Bananas() {
        _classCallCheck(this, Bananas);
        return _super.apply(this, arguments);
      }
      _createClass(Bananas, [{
        key: \\"render\\",
        value: function render() {
          var pic = {
            uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
          };
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Image, {
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
      }]);
      return Bananas;
    }(_react.Component);"
  `
  );
});

it("Bananas ignore components dataSentrySourceFile=* dataSentryComponent=* dataSentryElement=nomatch snapshot matches", () => {
  const result = transform(BananasStandardInput, {
    filename: "/filename-test.js",
    configFile: false,
    presets: ["@babel/preset-react"],
    plugins: [[plugin, { native: true, ignoreComponents: [["nomatch.js", "nomatch", "nomatch"]] }]],
  });
  expect(result?.code).toMatchInlineSnapshot(
    `
    "\\"use strict\\";

    function _typeof(obj) { \\"@babel/helpers - typeof\\"; return _typeof = \\"function\\" == typeof Symbol && \\"symbol\\" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && \\"function\\" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? \\"symbol\\" : typeof obj; }, _typeof(obj); }
    var _react = _interopRequireWildcard(require(\\"react\\"));
    var _reactNative = require(\\"react-native\\");
    function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== \\"function\\") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
    function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== \\"object\\" && typeof obj !== \\"function\\") { return { \\"default\\": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== \\"default\\" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj[\\"default\\"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\\"Cannot call a class as a function\\"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\\"value\\" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \\"prototype\\", { writable: false }); return Constructor; }
    function _toPropertyKey(arg) { var key = _toPrimitive(arg, \\"string\\"); return _typeof(key) === \\"symbol\\" ? key : String(key); }
    function _toPrimitive(input, hint) { if (_typeof(input) !== \\"object\\" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || \\"default\\"); if (_typeof(res) !== \\"object\\") return res; throw new TypeError(\\"@@toPrimitive must return a primitive value.\\"); } return (hint === \\"string\\" ? String : Number)(input); }
    function _inherits(subClass, superClass) { if (typeof superClass !== \\"function\\" && superClass !== null) { throw new TypeError(\\"Super expression must either be null or a function\\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, \\"prototype\\", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
    function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \\"object\\" || typeof call === \\"function\\")) { return call; } else if (call !== void 0) { throw new TypeError(\\"Derived constructors may only return object or undefined\\"); } return _assertThisInitialized(self); }
    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\\"this hasn't been initialised - super() hasn't been called\\"); } return self; }
    function _isNativeReflectConstruct() { if (typeof Reflect === \\"undefined\\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \\"function\\") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
    var Bananas = /*#__PURE__*/function (_Component) {
      _inherits(Bananas, _Component);
      var _super = _createSuper(Bananas);
      function Bananas() {
        _classCallCheck(this, Bananas);
        return _super.apply(this, arguments);
      }
      _createClass(Bananas, [{
        key: \\"render\\",
        value: function render() {
          var pic = {
            uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
          };
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Image, {
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
      }]);
      return Bananas;
    }(_react.Component);"
  `
  );
});

it("Bananas ignore components dataSentrySourceFile=* dataSentryComponent=nomatch dataSentryElement=* snapshot matches", () => {
  const result = transform(BananasStandardInput, {
    filename: "/filename-test.js",
    configFile: false,
    presets: ["@babel/preset-react"],
    plugins: [[plugin, { native: true, ignoreComponents: [["nomatch.js", "nomatch", "nomatch"]] }]],
  });
  expect(result?.code).toMatchInlineSnapshot(
    `
    "\\"use strict\\";

    function _typeof(obj) { \\"@babel/helpers - typeof\\"; return _typeof = \\"function\\" == typeof Symbol && \\"symbol\\" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && \\"function\\" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? \\"symbol\\" : typeof obj; }, _typeof(obj); }
    var _react = _interopRequireWildcard(require(\\"react\\"));
    var _reactNative = require(\\"react-native\\");
    function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== \\"function\\") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
    function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== \\"object\\" && typeof obj !== \\"function\\") { return { \\"default\\": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== \\"default\\" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj[\\"default\\"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\\"Cannot call a class as a function\\"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\\"value\\" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \\"prototype\\", { writable: false }); return Constructor; }
    function _toPropertyKey(arg) { var key = _toPrimitive(arg, \\"string\\"); return _typeof(key) === \\"symbol\\" ? key : String(key); }
    function _toPrimitive(input, hint) { if (_typeof(input) !== \\"object\\" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || \\"default\\"); if (_typeof(res) !== \\"object\\") return res; throw new TypeError(\\"@@toPrimitive must return a primitive value.\\"); } return (hint === \\"string\\" ? String : Number)(input); }
    function _inherits(subClass, superClass) { if (typeof superClass !== \\"function\\" && superClass !== null) { throw new TypeError(\\"Super expression must either be null or a function\\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, \\"prototype\\", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
    function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \\"object\\" || typeof call === \\"function\\")) { return call; } else if (call !== void 0) { throw new TypeError(\\"Derived constructors may only return object or undefined\\"); } return _assertThisInitialized(self); }
    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\\"this hasn't been initialised - super() hasn't been called\\"); } return self; }
    function _isNativeReflectConstruct() { if (typeof Reflect === \\"undefined\\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \\"function\\") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
    var Bananas = /*#__PURE__*/function (_Component) {
      _inherits(Bananas, _Component);
      var _super = _createSuper(Bananas);
      function Bananas() {
        _classCallCheck(this, Bananas);
        return _super.apply(this, arguments);
      }
      _createClass(Bananas, [{
        key: \\"render\\",
        value: function render() {
          var pic = {
            uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
          };
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Image, {
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
      }]);
      return Bananas;
    }(_react.Component);"
  `
  );
});

it("Bananas ignore components dataSentrySourceFile=nomatch dataSentryComponent=* dataSentryElement=* snapshot matches", () => {
  const result = transform(BananasStandardInput, {
    filename: "/filename-test.js",
    configFile: false,
    presets: ["@babel/preset-react"],
    plugins: [[plugin, { native: true, ignoreComponents: [["nomatch.js", "nomatch", "nomatch"]] }]],
  });
  expect(result?.code).toMatchInlineSnapshot(
    `
    "\\"use strict\\";

    function _typeof(obj) { \\"@babel/helpers - typeof\\"; return _typeof = \\"function\\" == typeof Symbol && \\"symbol\\" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && \\"function\\" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? \\"symbol\\" : typeof obj; }, _typeof(obj); }
    var _react = _interopRequireWildcard(require(\\"react\\"));
    var _reactNative = require(\\"react-native\\");
    function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== \\"function\\") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
    function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== \\"object\\" && typeof obj !== \\"function\\") { return { \\"default\\": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== \\"default\\" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj[\\"default\\"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\\"Cannot call a class as a function\\"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\\"value\\" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \\"prototype\\", { writable: false }); return Constructor; }
    function _toPropertyKey(arg) { var key = _toPrimitive(arg, \\"string\\"); return _typeof(key) === \\"symbol\\" ? key : String(key); }
    function _toPrimitive(input, hint) { if (_typeof(input) !== \\"object\\" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || \\"default\\"); if (_typeof(res) !== \\"object\\") return res; throw new TypeError(\\"@@toPrimitive must return a primitive value.\\"); } return (hint === \\"string\\" ? String : Number)(input); }
    function _inherits(subClass, superClass) { if (typeof superClass !== \\"function\\" && superClass !== null) { throw new TypeError(\\"Super expression must either be null or a function\\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, \\"prototype\\", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
    function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \\"object\\" || typeof call === \\"function\\")) { return call; } else if (call !== void 0) { throw new TypeError(\\"Derived constructors may only return object or undefined\\"); } return _assertThisInitialized(self); }
    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\\"this hasn't been initialised - super() hasn't been called\\"); } return self; }
    function _isNativeReflectConstruct() { if (typeof Reflect === \\"undefined\\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \\"function\\") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
    var Bananas = /*#__PURE__*/function (_Component) {
      _inherits(Bananas, _Component);
      var _super = _createSuper(Bananas);
      function Bananas() {
        _classCallCheck(this, Bananas);
        return _super.apply(this, arguments);
      }
      _createClass(Bananas, [{
        key: \\"render\\",
        value: function render() {
          var pic = {
            uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
          };
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Image, {
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
      }]);
      return Bananas;
    }(_react.Component);"
  `
  );
});

// This tests out matching only `dataSentryElement`, with * for the others
it("Bananas ignore components dataSentrySourceFile=* dataSentryComponent=* dataSentryElement=match snapshot matches", () => {
  const result = transform(BananasStandardInput, {
    filename: "/filename-test.js",
    configFile: false,
    presets: ["@babel/preset-react"],
    plugins: [[plugin, { native: true, ignoreComponents: [["*", "*", "Image"]] }]],
  });
  expect(result?.code).toMatchInlineSnapshot(
    `
    "\\"use strict\\";

    function _typeof(obj) { \\"@babel/helpers - typeof\\"; return _typeof = \\"function\\" == typeof Symbol && \\"symbol\\" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && \\"function\\" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? \\"symbol\\" : typeof obj; }, _typeof(obj); }
    var _react = _interopRequireWildcard(require(\\"react\\"));
    var _reactNative = require(\\"react-native\\");
    function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== \\"function\\") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
    function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== \\"object\\" && typeof obj !== \\"function\\") { return { \\"default\\": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== \\"default\\" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj[\\"default\\"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\\"Cannot call a class as a function\\"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\\"value\\" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \\"prototype\\", { writable: false }); return Constructor; }
    function _toPropertyKey(arg) { var key = _toPrimitive(arg, \\"string\\"); return _typeof(key) === \\"symbol\\" ? key : String(key); }
    function _toPrimitive(input, hint) { if (_typeof(input) !== \\"object\\" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || \\"default\\"); if (_typeof(res) !== \\"object\\") return res; throw new TypeError(\\"@@toPrimitive must return a primitive value.\\"); } return (hint === \\"string\\" ? String : Number)(input); }
    function _inherits(subClass, superClass) { if (typeof superClass !== \\"function\\" && superClass !== null) { throw new TypeError(\\"Super expression must either be null or a function\\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, \\"prototype\\", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
    function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \\"object\\" || typeof call === \\"function\\")) { return call; } else if (call !== void 0) { throw new TypeError(\\"Derived constructors may only return object or undefined\\"); } return _assertThisInitialized(self); }
    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\\"this hasn't been initialised - super() hasn't been called\\"); } return self; }
    function _isNativeReflectConstruct() { if (typeof Reflect === \\"undefined\\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \\"function\\") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
    var Bananas = /*#__PURE__*/function (_Component) {
      _inherits(Bananas, _Component);
      var _super = _createSuper(Bananas);
      function Bananas() {
        _classCallCheck(this, Bananas);
        return _super.apply(this, arguments);
      }
      _createClass(Bananas, [{
        key: \\"render\\",
        value: function render() {
          var pic = {
            uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
          };
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Image, {
            source: pic,
            style: {
              width: 193,
              height: 110,
              marginTop: 10
            },
            fsClass: \\"test-class\\"
          });
        }
      }]);
      return Bananas;
    }(_react.Component);"
  `
  );
});

// This tests out matching only `dataSentryElement` and `dataSentryComponent`, with * for `dataSentrySourceFile`
it("Bananas ignore components dataSentrySourceFile=* dataSentryComponent=match dataSentryElement=match snapshot matches", () => {
  const result = transform(BananasStandardInput, {
    filename: "/filename-test.js",
    configFile: false,
    presets: ["@babel/preset-react"],
    plugins: [[plugin, { native: true, ignoreComponents: [["*", "Bananas", "Image"]] }]],
  });
  expect(result?.code).toMatchInlineSnapshot(
    `
    "\\"use strict\\";

    function _typeof(obj) { \\"@babel/helpers - typeof\\"; return _typeof = \\"function\\" == typeof Symbol && \\"symbol\\" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && \\"function\\" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? \\"symbol\\" : typeof obj; }, _typeof(obj); }
    var _react = _interopRequireWildcard(require(\\"react\\"));
    var _reactNative = require(\\"react-native\\");
    function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== \\"function\\") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
    function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== \\"object\\" && typeof obj !== \\"function\\") { return { \\"default\\": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== \\"default\\" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj[\\"default\\"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\\"Cannot call a class as a function\\"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\\"value\\" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \\"prototype\\", { writable: false }); return Constructor; }
    function _toPropertyKey(arg) { var key = _toPrimitive(arg, \\"string\\"); return _typeof(key) === \\"symbol\\" ? key : String(key); }
    function _toPrimitive(input, hint) { if (_typeof(input) !== \\"object\\" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || \\"default\\"); if (_typeof(res) !== \\"object\\") return res; throw new TypeError(\\"@@toPrimitive must return a primitive value.\\"); } return (hint === \\"string\\" ? String : Number)(input); }
    function _inherits(subClass, superClass) { if (typeof superClass !== \\"function\\" && superClass !== null) { throw new TypeError(\\"Super expression must either be null or a function\\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, \\"prototype\\", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
    function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \\"object\\" || typeof call === \\"function\\")) { return call; } else if (call !== void 0) { throw new TypeError(\\"Derived constructors may only return object or undefined\\"); } return _assertThisInitialized(self); }
    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\\"this hasn't been initialised - super() hasn't been called\\"); } return self; }
    function _isNativeReflectConstruct() { if (typeof Reflect === \\"undefined\\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \\"function\\") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
    var Bananas = /*#__PURE__*/function (_Component) {
      _inherits(Bananas, _Component);
      var _super = _createSuper(Bananas);
      function Bananas() {
        _classCallCheck(this, Bananas);
        return _super.apply(this, arguments);
      }
      _createClass(Bananas, [{
        key: \\"render\\",
        value: function render() {
          var pic = {
            uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
          };
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Image, {
            source: pic,
            style: {
              width: 193,
              height: 110,
              marginTop: 10
            },
            fsClass: \\"test-class\\"
          });
        }
      }]);
      return Bananas;
    }(_react.Component);"
  `
  );
});

// This tests out matching on all 3 of our ignore list values
it("Bananas ignore components dataSentrySourceFile=match dataSentryComponent=match dataSentryElement=match snapshot matches", () => {
  const result = transform(BananasStandardInput, {
    filename: "/filename-test.js",
    configFile: false,
    presets: ["@babel/preset-react"],
    plugins: [
      [plugin, { native: true, ignoreComponents: [["filename-test.js", "Bananas", "Image"]] }],
    ],
  });
  expect(result?.code).toMatchInlineSnapshot(
    `
    "\\"use strict\\";

    function _typeof(obj) { \\"@babel/helpers - typeof\\"; return _typeof = \\"function\\" == typeof Symbol && \\"symbol\\" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && \\"function\\" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? \\"symbol\\" : typeof obj; }, _typeof(obj); }
    var _react = _interopRequireWildcard(require(\\"react\\"));
    var _reactNative = require(\\"react-native\\");
    function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== \\"function\\") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
    function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== \\"object\\" && typeof obj !== \\"function\\") { return { \\"default\\": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== \\"default\\" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj[\\"default\\"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\\"Cannot call a class as a function\\"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\\"value\\" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \\"prototype\\", { writable: false }); return Constructor; }
    function _toPropertyKey(arg) { var key = _toPrimitive(arg, \\"string\\"); return _typeof(key) === \\"symbol\\" ? key : String(key); }
    function _toPrimitive(input, hint) { if (_typeof(input) !== \\"object\\" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || \\"default\\"); if (_typeof(res) !== \\"object\\") return res; throw new TypeError(\\"@@toPrimitive must return a primitive value.\\"); } return (hint === \\"string\\" ? String : Number)(input); }
    function _inherits(subClass, superClass) { if (typeof superClass !== \\"function\\" && superClass !== null) { throw new TypeError(\\"Super expression must either be null or a function\\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, \\"prototype\\", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
    function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \\"object\\" || typeof call === \\"function\\")) { return call; } else if (call !== void 0) { throw new TypeError(\\"Derived constructors may only return object or undefined\\"); } return _assertThisInitialized(self); }
    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\\"this hasn't been initialised - super() hasn't been called\\"); } return self; }
    function _isNativeReflectConstruct() { if (typeof Reflect === \\"undefined\\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \\"function\\") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
    var Bananas = /*#__PURE__*/function (_Component) {
      _inherits(Bananas, _Component);
      var _super = _createSuper(Bananas);
      function Bananas() {
        _classCallCheck(this, Bananas);
        return _super.apply(this, arguments);
      }
      _createClass(Bananas, [{
        key: \\"render\\",
        value: function render() {
          var pic = {
            uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
          };
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Image, {
            source: pic,
            style: {
              width: 193,
              height: 110,
              marginTop: 10
            },
            fsClass: \\"test-class\\"
          });
        }
      }]);
      return Bananas;
    }(_react.Component);"
  `
  );
});

// This tests out matching on all 3 of our ignore list values via *
it("Bananas/Pizza/App ignore components dataSentrySourceFile=* dataSentryComponent=* dataSentryElement=* snapshot matches", () => {
  const result = transform(BananasPizzaAppStandardInput, {
    filename: "/filename-test.js",
    configFile: false,
    presets: ["@babel/preset-react"],
    plugins: [[plugin, { native: true, ignoreComponents: [["*", "*", "*"]] }]],
  });
  expect(result?.code).toMatchInlineSnapshot(
    `
    "\\"use strict\\";

    function _typeof(obj) { \\"@babel/helpers - typeof\\"; return _typeof = \\"function\\" == typeof Symbol && \\"symbol\\" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && \\"function\\" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? \\"symbol\\" : typeof obj; }, _typeof(obj); }
    Object.defineProperty(exports, \\"__esModule\\", {
      value: true
    });
    exports[\\"default\\"] = App;
    var _react = _interopRequireWildcard(require(\\"react\\"));
    var _reactNative = require(\\"react-native\\");
    var _container;
    function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== \\"function\\") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
    function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== \\"object\\" && typeof obj !== \\"function\\") { return { \\"default\\": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== \\"default\\" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj[\\"default\\"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
    function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\\"Cannot call a class as a function\\"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\\"value\\" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \\"prototype\\", { writable: false }); return Constructor; }
    function _toPropertyKey(arg) { var key = _toPrimitive(arg, \\"string\\"); return _typeof(key) === \\"symbol\\" ? key : String(key); }
    function _toPrimitive(input, hint) { if (_typeof(input) !== \\"object\\" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || \\"default\\"); if (_typeof(res) !== \\"object\\") return res; throw new TypeError(\\"@@toPrimitive must return a primitive value.\\"); } return (hint === \\"string\\" ? String : Number)(input); }
    function _inherits(subClass, superClass) { if (typeof superClass !== \\"function\\" && superClass !== null) { throw new TypeError(\\"Super expression must either be null or a function\\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, \\"prototype\\", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
    function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \\"object\\" || typeof call === \\"function\\")) { return call; } else if (call !== void 0) { throw new TypeError(\\"Derived constructors may only return object or undefined\\"); } return _assertThisInitialized(self); }
    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\\"this hasn't been initialised - super() hasn't been called\\"); } return self; }
    function _isNativeReflectConstruct() { if (typeof Reflect === \\"undefined\\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \\"function\\") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
    _reactNative.UIManager.getViewManagerConfig('RCTView').NativeProps.fsClass = \\"String\\";
    var Bananas = /*#__PURE__*/function (_Component) {
      _inherits(Bananas, _Component);
      var _super = _createSuper(Bananas);
      function Bananas() {
        _classCallCheck(this, Bananas);
        return _super.apply(this, arguments);
      }
      _createClass(Bananas, [{
        key: \\"render\\",
        value: function render() {
          var pic = {
            uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
          };
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Image, {
            source: pic,
            style: {
              width: 193,
              height: 110,
              marginTop: 10
            },
            fsClass: \\"test-class\\"
          });
        }
      }]);
      return Bananas;
    }(_react.Component);
    var PizzaTranslator = /*#__PURE__*/function (_Component2) {
      _inherits(PizzaTranslator, _Component2);
      var _super2 = _createSuper(PizzaTranslator);
      function PizzaTranslator(props) {
        var _this;
        _classCallCheck(this, PizzaTranslator);
        _this = _super2.call(this, props);
        _this.state = {
          text: ''
        };
        return _this;
      }
      _createClass(PizzaTranslator, [{
        key: \\"render\\",
        value: function render() {
          var _this2 = this;
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.View, {
            style: {
              padding: 10
            }
          }, /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.TextInput, {
            style: {
              backgroundColor: '#000',
              color: '#eee',
              padding: 8
            },
            placeholder: \\"Type here to translate!\\" // not supported on iOS
            ,
            onChangeText: function onChangeText(text) {
              return _this2.setState({
                text: text
              });
            },
            value: this.state.text
          }), /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Text, {
            style: {
              padding: 10,
              fontSize: 42
            }
          }, this.state.text.split(' ').map(function (word) {
            return word && '🍕';
          }).join(' ')));
        }
      }]);
      return PizzaTranslator;
    }(_react.Component);
    function App() {
      return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.View, {
        style: styles.container
      }, /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Text, {
        style: {
          color: '#eee'
        }
      }, \\"FullStory ReactNative testing app\\"), /*#__PURE__*/_react[\\"default\\"].createElement(Bananas, null), /*#__PURE__*/_react[\\"default\\"].createElement(PizzaTranslator, null));
    }
    var styles = _reactNative.StyleSheet.create({
      container: (_container = {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: '#222'
      }, _defineProperty(_container, \\"alignItems\\", 'center'), _defineProperty(_container, \\"justifyContent\\", 'center'), _container)
    });"
  `
  );
});

// This tests out matching on all 3 of our ignore list values
it("Bananas/Pizza/App ignore components dataSentrySourceFile=nomatch dataSentryComponent=* dataSentryElement=* snapshot matches", () => {
  const result = transform(BananasPizzaAppStandardInput, {
    filename: "/filename-test.js",
    configFile: false,
    presets: ["@babel/preset-react"],
    plugins: [[plugin, { native: true, ignoreComponents: [["nomatch.js", "*", "*"]] }]],
  });
  expect(result?.code).toMatchInlineSnapshot(
    `
    "\\"use strict\\";

    function _typeof(obj) { \\"@babel/helpers - typeof\\"; return _typeof = \\"function\\" == typeof Symbol && \\"symbol\\" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && \\"function\\" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? \\"symbol\\" : typeof obj; }, _typeof(obj); }
    Object.defineProperty(exports, \\"__esModule\\", {
      value: true
    });
    exports[\\"default\\"] = App;
    var _react = _interopRequireWildcard(require(\\"react\\"));
    var _reactNative = require(\\"react-native\\");
    var _container;
    function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== \\"function\\") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
    function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== \\"object\\" && typeof obj !== \\"function\\") { return { \\"default\\": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== \\"default\\" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj[\\"default\\"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
    function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\\"Cannot call a class as a function\\"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\\"value\\" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \\"prototype\\", { writable: false }); return Constructor; }
    function _toPropertyKey(arg) { var key = _toPrimitive(arg, \\"string\\"); return _typeof(key) === \\"symbol\\" ? key : String(key); }
    function _toPrimitive(input, hint) { if (_typeof(input) !== \\"object\\" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || \\"default\\"); if (_typeof(res) !== \\"object\\") return res; throw new TypeError(\\"@@toPrimitive must return a primitive value.\\"); } return (hint === \\"string\\" ? String : Number)(input); }
    function _inherits(subClass, superClass) { if (typeof superClass !== \\"function\\" && superClass !== null) { throw new TypeError(\\"Super expression must either be null or a function\\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, \\"prototype\\", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
    function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \\"object\\" || typeof call === \\"function\\")) { return call; } else if (call !== void 0) { throw new TypeError(\\"Derived constructors may only return object or undefined\\"); } return _assertThisInitialized(self); }
    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\\"this hasn't been initialised - super() hasn't been called\\"); } return self; }
    function _isNativeReflectConstruct() { if (typeof Reflect === \\"undefined\\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \\"function\\") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
    _reactNative.UIManager.getViewManagerConfig('RCTView').NativeProps.fsClass = \\"String\\";
    var Bananas = /*#__PURE__*/function (_Component) {
      _inherits(Bananas, _Component);
      var _super = _createSuper(Bananas);
      function Bananas() {
        _classCallCheck(this, Bananas);
        return _super.apply(this, arguments);
      }
      _createClass(Bananas, [{
        key: \\"render\\",
        value: function render() {
          var pic = {
            uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
          };
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Image, {
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
      }]);
      return Bananas;
    }(_react.Component);
    var PizzaTranslator = /*#__PURE__*/function (_Component2) {
      _inherits(PizzaTranslator, _Component2);
      var _super2 = _createSuper(PizzaTranslator);
      function PizzaTranslator(props) {
        var _this;
        _classCallCheck(this, PizzaTranslator);
        _this = _super2.call(this, props);
        _this.state = {
          text: ''
        };
        return _this;
      }
      _createClass(PizzaTranslator, [{
        key: \\"render\\",
        value: function render() {
          var _this2 = this;
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.View, {
            style: {
              padding: 10
            },
            dataSentryElement: \\"View\\",
            dataSentryComponent: \\"PizzaTranslator\\",
            dataSentrySourceFile: \\"filename-test.js\\"
          }, /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.TextInput, {
            style: {
              backgroundColor: '#000',
              color: '#eee',
              padding: 8
            },
            placeholder: \\"Type here to translate!\\" // not supported on iOS
            ,
            onChangeText: function onChangeText(text) {
              return _this2.setState({
                text: text
              });
            },
            value: this.state.text,
            dataSentryElement: \\"TextInput\\",
            dataSentrySourceFile: \\"filename-test.js\\"
          }), /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Text, {
            style: {
              padding: 10,
              fontSize: 42
            },
            dataSentryElement: \\"Text\\",
            dataSentrySourceFile: \\"filename-test.js\\"
          }, this.state.text.split(' ').map(function (word) {
            return word && '🍕';
          }).join(' ')));
        }
      }]);
      return PizzaTranslator;
    }(_react.Component);
    function App() {
      return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.View, {
        style: styles.container,
        dataSentryElement: \\"View\\",
        dataSentryComponent: \\"App\\",
        dataSentrySourceFile: \\"filename-test.js\\"
      }, /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Text, {
        style: {
          color: '#eee'
        },
        dataSentryElement: \\"Text\\",
        dataSentrySourceFile: \\"filename-test.js\\"
      }, \\"FullStory ReactNative testing app\\"), /*#__PURE__*/_react[\\"default\\"].createElement(Bananas, {
        dataSentryElement: \\"Bananas\\",
        dataSentrySourceFile: \\"filename-test.js\\"
      }), /*#__PURE__*/_react[\\"default\\"].createElement(PizzaTranslator, {
        dataSentryElement: \\"PizzaTranslator\\",
        dataSentrySourceFile: \\"filename-test.js\\"
      }));
    }
    var styles = _reactNative.StyleSheet.create({
      container: (_container = {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: '#222'
      }, _defineProperty(_container, \\"alignItems\\", 'center'), _defineProperty(_container, \\"justifyContent\\", 'center'), _container)
    });"
  `
  );
});

it("Bananas/Pizza/App only Bananas dataSentrySourceFile=match dataSentryComponent=match dataSentryElement=match snapshot matches", () => {
  const result = transform(BananasPizzaAppStandardInput, {
    filename: "/filename-test.js",
    configFile: false,
    presets: ["@babel/preset-react"],
    plugins: [
      [
        plugin,
        {
          native: true,
          ignoreComponents: [
            // Pizza
            ["filename-test.js", "PizzaTranslator", "View"],
            // App
            ["filename-test.js", "App", "View"],
          ],
        },
      ],
    ],
  });
  expect(result?.code).toMatchInlineSnapshot(
    `
    "\\"use strict\\";

    function _typeof(obj) { \\"@babel/helpers - typeof\\"; return _typeof = \\"function\\" == typeof Symbol && \\"symbol\\" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && \\"function\\" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? \\"symbol\\" : typeof obj; }, _typeof(obj); }
    Object.defineProperty(exports, \\"__esModule\\", {
      value: true
    });
    exports[\\"default\\"] = App;
    var _react = _interopRequireWildcard(require(\\"react\\"));
    var _reactNative = require(\\"react-native\\");
    var _container;
    function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== \\"function\\") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
    function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== \\"object\\" && typeof obj !== \\"function\\") { return { \\"default\\": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== \\"default\\" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj[\\"default\\"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
    function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\\"Cannot call a class as a function\\"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\\"value\\" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \\"prototype\\", { writable: false }); return Constructor; }
    function _toPropertyKey(arg) { var key = _toPrimitive(arg, \\"string\\"); return _typeof(key) === \\"symbol\\" ? key : String(key); }
    function _toPrimitive(input, hint) { if (_typeof(input) !== \\"object\\" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || \\"default\\"); if (_typeof(res) !== \\"object\\") return res; throw new TypeError(\\"@@toPrimitive must return a primitive value.\\"); } return (hint === \\"string\\" ? String : Number)(input); }
    function _inherits(subClass, superClass) { if (typeof superClass !== \\"function\\" && superClass !== null) { throw new TypeError(\\"Super expression must either be null or a function\\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, \\"prototype\\", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
    function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \\"object\\" || typeof call === \\"function\\")) { return call; } else if (call !== void 0) { throw new TypeError(\\"Derived constructors may only return object or undefined\\"); } return _assertThisInitialized(self); }
    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\\"this hasn't been initialised - super() hasn't been called\\"); } return self; }
    function _isNativeReflectConstruct() { if (typeof Reflect === \\"undefined\\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \\"function\\") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
    _reactNative.UIManager.getViewManagerConfig('RCTView').NativeProps.fsClass = \\"String\\";
    var Bananas = /*#__PURE__*/function (_Component) {
      _inherits(Bananas, _Component);
      var _super = _createSuper(Bananas);
      function Bananas() {
        _classCallCheck(this, Bananas);
        return _super.apply(this, arguments);
      }
      _createClass(Bananas, [{
        key: \\"render\\",
        value: function render() {
          var pic = {
            uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
          };
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Image, {
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
      }]);
      return Bananas;
    }(_react.Component);
    var PizzaTranslator = /*#__PURE__*/function (_Component2) {
      _inherits(PizzaTranslator, _Component2);
      var _super2 = _createSuper(PizzaTranslator);
      function PizzaTranslator(props) {
        var _this;
        _classCallCheck(this, PizzaTranslator);
        _this = _super2.call(this, props);
        _this.state = {
          text: ''
        };
        return _this;
      }
      _createClass(PizzaTranslator, [{
        key: \\"render\\",
        value: function render() {
          var _this2 = this;
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.View, {
            style: {
              padding: 10
            }
          }, /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.TextInput, {
            style: {
              backgroundColor: '#000',
              color: '#eee',
              padding: 8
            },
            placeholder: \\"Type here to translate!\\" // not supported on iOS
            ,
            onChangeText: function onChangeText(text) {
              return _this2.setState({
                text: text
              });
            },
            value: this.state.text,
            dataSentryElement: \\"TextInput\\",
            dataSentrySourceFile: \\"filename-test.js\\"
          }), /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Text, {
            style: {
              padding: 10,
              fontSize: 42
            },
            dataSentryElement: \\"Text\\",
            dataSentrySourceFile: \\"filename-test.js\\"
          }, this.state.text.split(' ').map(function (word) {
            return word && '🍕';
          }).join(' ')));
        }
      }]);
      return PizzaTranslator;
    }(_react.Component);
    function App() {
      return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.View, {
        style: styles.container
      }, /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Text, {
        style: {
          color: '#eee'
        },
        dataSentryElement: \\"Text\\",
        dataSentrySourceFile: \\"filename-test.js\\"
      }, \\"FullStory ReactNative testing app\\"), /*#__PURE__*/_react[\\"default\\"].createElement(Bananas, {
        dataSentryElement: \\"Bananas\\",
        dataSentrySourceFile: \\"filename-test.js\\"
      }), /*#__PURE__*/_react[\\"default\\"].createElement(PizzaTranslator, {
        dataSentryElement: \\"PizzaTranslator\\",
        dataSentrySourceFile: \\"filename-test.js\\"
      }));
    }
    var styles = _reactNative.StyleSheet.create({
      container: (_container = {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: '#222'
      }, _defineProperty(_container, \\"alignItems\\", 'center'), _defineProperty(_container, \\"justifyContent\\", 'center'), _container)
    });"
  `
  );
});

it("Bananas/Pizza/App only Pizza dataSentrySourceFile=match dataSentryComponent=match dataSentryElement=match snapshot matches", () => {
  const result = transform(BananasPizzaAppStandardInput, {
    filename: "/filename-test.js",
    configFile: false,
    presets: ["@babel/preset-react"],
    plugins: [
      [
        plugin,
        {
          native: true,
          ignoreComponents: [
            // Bananas
            ["filename-test.js", "Bananas", "Image"],
            // App
            ["filename-test.js", "App", "View"],
          ],
        },
      ],
    ],
  });
  expect(result?.code).toMatchInlineSnapshot(
    `
    "\\"use strict\\";

    function _typeof(obj) { \\"@babel/helpers - typeof\\"; return _typeof = \\"function\\" == typeof Symbol && \\"symbol\\" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && \\"function\\" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? \\"symbol\\" : typeof obj; }, _typeof(obj); }
    Object.defineProperty(exports, \\"__esModule\\", {
      value: true
    });
    exports[\\"default\\"] = App;
    var _react = _interopRequireWildcard(require(\\"react\\"));
    var _reactNative = require(\\"react-native\\");
    var _container;
    function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== \\"function\\") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
    function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== \\"object\\" && typeof obj !== \\"function\\") { return { \\"default\\": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== \\"default\\" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj[\\"default\\"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
    function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\\"Cannot call a class as a function\\"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\\"value\\" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \\"prototype\\", { writable: false }); return Constructor; }
    function _toPropertyKey(arg) { var key = _toPrimitive(arg, \\"string\\"); return _typeof(key) === \\"symbol\\" ? key : String(key); }
    function _toPrimitive(input, hint) { if (_typeof(input) !== \\"object\\" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || \\"default\\"); if (_typeof(res) !== \\"object\\") return res; throw new TypeError(\\"@@toPrimitive must return a primitive value.\\"); } return (hint === \\"string\\" ? String : Number)(input); }
    function _inherits(subClass, superClass) { if (typeof superClass !== \\"function\\" && superClass !== null) { throw new TypeError(\\"Super expression must either be null or a function\\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, \\"prototype\\", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
    function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \\"object\\" || typeof call === \\"function\\")) { return call; } else if (call !== void 0) { throw new TypeError(\\"Derived constructors may only return object or undefined\\"); } return _assertThisInitialized(self); }
    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\\"this hasn't been initialised - super() hasn't been called\\"); } return self; }
    function _isNativeReflectConstruct() { if (typeof Reflect === \\"undefined\\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \\"function\\") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
    _reactNative.UIManager.getViewManagerConfig('RCTView').NativeProps.fsClass = \\"String\\";
    var Bananas = /*#__PURE__*/function (_Component) {
      _inherits(Bananas, _Component);
      var _super = _createSuper(Bananas);
      function Bananas() {
        _classCallCheck(this, Bananas);
        return _super.apply(this, arguments);
      }
      _createClass(Bananas, [{
        key: \\"render\\",
        value: function render() {
          var pic = {
            uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
          };
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Image, {
            source: pic,
            style: {
              width: 193,
              height: 110,
              marginTop: 10
            },
            fsClass: \\"test-class\\"
          });
        }
      }]);
      return Bananas;
    }(_react.Component);
    var PizzaTranslator = /*#__PURE__*/function (_Component2) {
      _inherits(PizzaTranslator, _Component2);
      var _super2 = _createSuper(PizzaTranslator);
      function PizzaTranslator(props) {
        var _this;
        _classCallCheck(this, PizzaTranslator);
        _this = _super2.call(this, props);
        _this.state = {
          text: ''
        };
        return _this;
      }
      _createClass(PizzaTranslator, [{
        key: \\"render\\",
        value: function render() {
          var _this2 = this;
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.View, {
            style: {
              padding: 10
            },
            dataSentryElement: \\"View\\",
            dataSentryComponent: \\"PizzaTranslator\\",
            dataSentrySourceFile: \\"filename-test.js\\"
          }, /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.TextInput, {
            style: {
              backgroundColor: '#000',
              color: '#eee',
              padding: 8
            },
            placeholder: \\"Type here to translate!\\" // not supported on iOS
            ,
            onChangeText: function onChangeText(text) {
              return _this2.setState({
                text: text
              });
            },
            value: this.state.text,
            dataSentryElement: \\"TextInput\\",
            dataSentrySourceFile: \\"filename-test.js\\"
          }), /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Text, {
            style: {
              padding: 10,
              fontSize: 42
            },
            dataSentryElement: \\"Text\\",
            dataSentrySourceFile: \\"filename-test.js\\"
          }, this.state.text.split(' ').map(function (word) {
            return word && '🍕';
          }).join(' ')));
        }
      }]);
      return PizzaTranslator;
    }(_react.Component);
    function App() {
      return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.View, {
        style: styles.container
      }, /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Text, {
        style: {
          color: '#eee'
        },
        dataSentryElement: \\"Text\\",
        dataSentrySourceFile: \\"filename-test.js\\"
      }, \\"FullStory ReactNative testing app\\"), /*#__PURE__*/_react[\\"default\\"].createElement(Bananas, {
        dataSentryElement: \\"Bananas\\",
        dataSentrySourceFile: \\"filename-test.js\\"
      }), /*#__PURE__*/_react[\\"default\\"].createElement(PizzaTranslator, {
        dataSentryElement: \\"PizzaTranslator\\",
        dataSentrySourceFile: \\"filename-test.js\\"
      }));
    }
    var styles = _reactNative.StyleSheet.create({
      container: (_container = {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: '#222'
      }, _defineProperty(_container, \\"alignItems\\", 'center'), _defineProperty(_container, \\"justifyContent\\", 'center'), _container)
    });"
  `
  );
});

it("Bananas/Pizza/App only App dataSentrySourceFile=match dataSentryComponent=match dataSentryElement=match snapshot matches", () => {
  const result = transform(BananasPizzaAppStandardInput, {
    filename: "/filename-test.js",
    configFile: false,
    presets: ["@babel/preset-react"],
    plugins: [
      [
        plugin,
        {
          native: true,
          ignoreComponents: [
            // Bananas
            ["filename-test.js", "Bananas", "Image"],
            // Pizza
            ["filename-test.js", "PizzaTranslator", "View"],
          ],
        },
      ],
    ],
  });
  expect(result?.code).toMatchInlineSnapshot(
    `
    "\\"use strict\\";

    function _typeof(obj) { \\"@babel/helpers - typeof\\"; return _typeof = \\"function\\" == typeof Symbol && \\"symbol\\" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && \\"function\\" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? \\"symbol\\" : typeof obj; }, _typeof(obj); }
    Object.defineProperty(exports, \\"__esModule\\", {
      value: true
    });
    exports[\\"default\\"] = App;
    var _react = _interopRequireWildcard(require(\\"react\\"));
    var _reactNative = require(\\"react-native\\");
    var _container;
    function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== \\"function\\") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
    function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== \\"object\\" && typeof obj !== \\"function\\") { return { \\"default\\": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== \\"default\\" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj[\\"default\\"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
    function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\\"Cannot call a class as a function\\"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\\"value\\" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \\"prototype\\", { writable: false }); return Constructor; }
    function _toPropertyKey(arg) { var key = _toPrimitive(arg, \\"string\\"); return _typeof(key) === \\"symbol\\" ? key : String(key); }
    function _toPrimitive(input, hint) { if (_typeof(input) !== \\"object\\" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || \\"default\\"); if (_typeof(res) !== \\"object\\") return res; throw new TypeError(\\"@@toPrimitive must return a primitive value.\\"); } return (hint === \\"string\\" ? String : Number)(input); }
    function _inherits(subClass, superClass) { if (typeof superClass !== \\"function\\" && superClass !== null) { throw new TypeError(\\"Super expression must either be null or a function\\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, \\"prototype\\", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
    function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \\"object\\" || typeof call === \\"function\\")) { return call; } else if (call !== void 0) { throw new TypeError(\\"Derived constructors may only return object or undefined\\"); } return _assertThisInitialized(self); }
    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\\"this hasn't been initialised - super() hasn't been called\\"); } return self; }
    function _isNativeReflectConstruct() { if (typeof Reflect === \\"undefined\\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \\"function\\") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
    _reactNative.UIManager.getViewManagerConfig('RCTView').NativeProps.fsClass = \\"String\\";
    var Bananas = /*#__PURE__*/function (_Component) {
      _inherits(Bananas, _Component);
      var _super = _createSuper(Bananas);
      function Bananas() {
        _classCallCheck(this, Bananas);
        return _super.apply(this, arguments);
      }
      _createClass(Bananas, [{
        key: \\"render\\",
        value: function render() {
          var pic = {
            uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
          };
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Image, {
            source: pic,
            style: {
              width: 193,
              height: 110,
              marginTop: 10
            },
            fsClass: \\"test-class\\"
          });
        }
      }]);
      return Bananas;
    }(_react.Component);
    var PizzaTranslator = /*#__PURE__*/function (_Component2) {
      _inherits(PizzaTranslator, _Component2);
      var _super2 = _createSuper(PizzaTranslator);
      function PizzaTranslator(props) {
        var _this;
        _classCallCheck(this, PizzaTranslator);
        _this = _super2.call(this, props);
        _this.state = {
          text: ''
        };
        return _this;
      }
      _createClass(PizzaTranslator, [{
        key: \\"render\\",
        value: function render() {
          var _this2 = this;
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.View, {
            style: {
              padding: 10
            }
          }, /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.TextInput, {
            style: {
              backgroundColor: '#000',
              color: '#eee',
              padding: 8
            },
            placeholder: \\"Type here to translate!\\" // not supported on iOS
            ,
            onChangeText: function onChangeText(text) {
              return _this2.setState({
                text: text
              });
            },
            value: this.state.text,
            dataSentryElement: \\"TextInput\\",
            dataSentrySourceFile: \\"filename-test.js\\"
          }), /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Text, {
            style: {
              padding: 10,
              fontSize: 42
            },
            dataSentryElement: \\"Text\\",
            dataSentrySourceFile: \\"filename-test.js\\"
          }, this.state.text.split(' ').map(function (word) {
            return word && '🍕';
          }).join(' ')));
        }
      }]);
      return PizzaTranslator;
    }(_react.Component);
    function App() {
      return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.View, {
        style: styles.container,
        dataSentryElement: \\"View\\",
        dataSentryComponent: \\"App\\",
        dataSentrySourceFile: \\"filename-test.js\\"
      }, /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Text, {
        style: {
          color: '#eee'
        },
        dataSentryElement: \\"Text\\",
        dataSentrySourceFile: \\"filename-test.js\\"
      }, \\"FullStory ReactNative testing app\\"), /*#__PURE__*/_react[\\"default\\"].createElement(Bananas, {
        dataSentryElement: \\"Bananas\\",
        dataSentrySourceFile: \\"filename-test.js\\"
      }), /*#__PURE__*/_react[\\"default\\"].createElement(PizzaTranslator, {
        dataSentryElement: \\"PizzaTranslator\\",
        dataSentrySourceFile: \\"filename-test.js\\"
      }));
    }
    var styles = _reactNative.StyleSheet.create({
      container: (_container = {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: '#222'
      }, _defineProperty(_container, \\"alignItems\\", 'center'), _defineProperty(_container, \\"justifyContent\\", 'center'), _container)
    });"
  `
  );
});

it("Bananas/Pizza/App No Pizza Elements dataSentrySourceFile=match dataSentryComponent=match dataSentryElement=match snapshot matches", () => {
  const result = transform(BananasPizzaAppStandardInput, {
    filename: "/filename-test.js",
    configFile: false,
    presets: ["@babel/preset-react"],
    plugins: [
      [
        plugin,
        {
          native: true,
          ignoreComponents: [
            // Pizza Element
            ["filename-test.js", null, "PizzaTranslator"],
          ],
        },
      ],
    ],
  });
  expect(result?.code).toMatchInlineSnapshot(
    `
    "\\"use strict\\";

    function _typeof(obj) { \\"@babel/helpers - typeof\\"; return _typeof = \\"function\\" == typeof Symbol && \\"symbol\\" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && \\"function\\" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? \\"symbol\\" : typeof obj; }, _typeof(obj); }
    Object.defineProperty(exports, \\"__esModule\\", {
      value: true
    });
    exports[\\"default\\"] = App;
    var _react = _interopRequireWildcard(require(\\"react\\"));
    var _reactNative = require(\\"react-native\\");
    var _container;
    function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== \\"function\\") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
    function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== \\"object\\" && typeof obj !== \\"function\\") { return { \\"default\\": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== \\"default\\" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj[\\"default\\"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
    function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\\"Cannot call a class as a function\\"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\\"value\\" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \\"prototype\\", { writable: false }); return Constructor; }
    function _toPropertyKey(arg) { var key = _toPrimitive(arg, \\"string\\"); return _typeof(key) === \\"symbol\\" ? key : String(key); }
    function _toPrimitive(input, hint) { if (_typeof(input) !== \\"object\\" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || \\"default\\"); if (_typeof(res) !== \\"object\\") return res; throw new TypeError(\\"@@toPrimitive must return a primitive value.\\"); } return (hint === \\"string\\" ? String : Number)(input); }
    function _inherits(subClass, superClass) { if (typeof superClass !== \\"function\\" && superClass !== null) { throw new TypeError(\\"Super expression must either be null or a function\\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, \\"prototype\\", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
    function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \\"object\\" || typeof call === \\"function\\")) { return call; } else if (call !== void 0) { throw new TypeError(\\"Derived constructors may only return object or undefined\\"); } return _assertThisInitialized(self); }
    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\\"this hasn't been initialised - super() hasn't been called\\"); } return self; }
    function _isNativeReflectConstruct() { if (typeof Reflect === \\"undefined\\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \\"function\\") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
    _reactNative.UIManager.getViewManagerConfig('RCTView').NativeProps.fsClass = \\"String\\";
    var Bananas = /*#__PURE__*/function (_Component) {
      _inherits(Bananas, _Component);
      var _super = _createSuper(Bananas);
      function Bananas() {
        _classCallCheck(this, Bananas);
        return _super.apply(this, arguments);
      }
      _createClass(Bananas, [{
        key: \\"render\\",
        value: function render() {
          var pic = {
            uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
          };
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Image, {
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
      }]);
      return Bananas;
    }(_react.Component);
    var PizzaTranslator = /*#__PURE__*/function (_Component2) {
      _inherits(PizzaTranslator, _Component2);
      var _super2 = _createSuper(PizzaTranslator);
      function PizzaTranslator(props) {
        var _this;
        _classCallCheck(this, PizzaTranslator);
        _this = _super2.call(this, props);
        _this.state = {
          text: ''
        };
        return _this;
      }
      _createClass(PizzaTranslator, [{
        key: \\"render\\",
        value: function render() {
          var _this2 = this;
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.View, {
            style: {
              padding: 10
            },
            dataSentryElement: \\"View\\",
            dataSentryComponent: \\"PizzaTranslator\\",
            dataSentrySourceFile: \\"filename-test.js\\"
          }, /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.TextInput, {
            style: {
              backgroundColor: '#000',
              color: '#eee',
              padding: 8
            },
            placeholder: \\"Type here to translate!\\" // not supported on iOS
            ,
            onChangeText: function onChangeText(text) {
              return _this2.setState({
                text: text
              });
            },
            value: this.state.text,
            dataSentryElement: \\"TextInput\\",
            dataSentrySourceFile: \\"filename-test.js\\"
          }), /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Text, {
            style: {
              padding: 10,
              fontSize: 42
            },
            dataSentryElement: \\"Text\\",
            dataSentrySourceFile: \\"filename-test.js\\"
          }, this.state.text.split(' ').map(function (word) {
            return word && '🍕';
          }).join(' ')));
        }
      }]);
      return PizzaTranslator;
    }(_react.Component);
    function App() {
      return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.View, {
        style: styles.container,
        dataSentryElement: \\"View\\",
        dataSentryComponent: \\"App\\",
        dataSentrySourceFile: \\"filename-test.js\\"
      }, /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Text, {
        style: {
          color: '#eee'
        },
        dataSentryElement: \\"Text\\",
        dataSentrySourceFile: \\"filename-test.js\\"
      }, \\"FullStory ReactNative testing app\\"), /*#__PURE__*/_react[\\"default\\"].createElement(Bananas, {
        dataSentryElement: \\"Bananas\\",
        dataSentrySourceFile: \\"filename-test.js\\"
      }), /*#__PURE__*/_react[\\"default\\"].createElement(PizzaTranslator, null));
    }
    var styles = _reactNative.StyleSheet.create({
      container: (_container = {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: '#222'
      }, _defineProperty(_container, \\"alignItems\\", 'center'), _defineProperty(_container, \\"justifyContent\\", 'center'), _container)
    });"
  `
  );
});

it("Bananas/Pizza/App No Bananas Elements dataSentrySourceFile=match dataSentryComponent=match dataSentryElement=match snapshot matches", () => {
  const result = transform(BananasPizzaAppStandardInput, {
    filename: "/filename-test.js",
    configFile: false,
    presets: ["@babel/preset-react"],
    plugins: [
      [
        plugin,
        {
          native: true,
          ignoreComponents: [
            // Bananas Element
            ["filename-test.js", null, "Bananas"],
          ],
        },
      ],
    ],
  });

  expect(result?.code).toMatchInlineSnapshot(
    `
    "\\"use strict\\";

    function _typeof(obj) { \\"@babel/helpers - typeof\\"; return _typeof = \\"function\\" == typeof Symbol && \\"symbol\\" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && \\"function\\" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? \\"symbol\\" : typeof obj; }, _typeof(obj); }
    Object.defineProperty(exports, \\"__esModule\\", {
      value: true
    });
    exports[\\"default\\"] = App;
    var _react = _interopRequireWildcard(require(\\"react\\"));
    var _reactNative = require(\\"react-native\\");
    var _container;
    function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== \\"function\\") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
    function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== \\"object\\" && typeof obj !== \\"function\\") { return { \\"default\\": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== \\"default\\" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj[\\"default\\"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
    function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\\"Cannot call a class as a function\\"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\\"value\\" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \\"prototype\\", { writable: false }); return Constructor; }
    function _toPropertyKey(arg) { var key = _toPrimitive(arg, \\"string\\"); return _typeof(key) === \\"symbol\\" ? key : String(key); }
    function _toPrimitive(input, hint) { if (_typeof(input) !== \\"object\\" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || \\"default\\"); if (_typeof(res) !== \\"object\\") return res; throw new TypeError(\\"@@toPrimitive must return a primitive value.\\"); } return (hint === \\"string\\" ? String : Number)(input); }
    function _inherits(subClass, superClass) { if (typeof superClass !== \\"function\\" && superClass !== null) { throw new TypeError(\\"Super expression must either be null or a function\\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, \\"prototype\\", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
    function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \\"object\\" || typeof call === \\"function\\")) { return call; } else if (call !== void 0) { throw new TypeError(\\"Derived constructors may only return object or undefined\\"); } return _assertThisInitialized(self); }
    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\\"this hasn't been initialised - super() hasn't been called\\"); } return self; }
    function _isNativeReflectConstruct() { if (typeof Reflect === \\"undefined\\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \\"function\\") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
    _reactNative.UIManager.getViewManagerConfig('RCTView').NativeProps.fsClass = \\"String\\";
    var Bananas = /*#__PURE__*/function (_Component) {
      _inherits(Bananas, _Component);
      var _super = _createSuper(Bananas);
      function Bananas() {
        _classCallCheck(this, Bananas);
        return _super.apply(this, arguments);
      }
      _createClass(Bananas, [{
        key: \\"render\\",
        value: function render() {
          var pic = {
            uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
          };
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Image, {
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
      }]);
      return Bananas;
    }(_react.Component);
    var PizzaTranslator = /*#__PURE__*/function (_Component2) {
      _inherits(PizzaTranslator, _Component2);
      var _super2 = _createSuper(PizzaTranslator);
      function PizzaTranslator(props) {
        var _this;
        _classCallCheck(this, PizzaTranslator);
        _this = _super2.call(this, props);
        _this.state = {
          text: ''
        };
        return _this;
      }
      _createClass(PizzaTranslator, [{
        key: \\"render\\",
        value: function render() {
          var _this2 = this;
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.View, {
            style: {
              padding: 10
            },
            dataSentryElement: \\"View\\",
            dataSentryComponent: \\"PizzaTranslator\\",
            dataSentrySourceFile: \\"filename-test.js\\"
          }, /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.TextInput, {
            style: {
              backgroundColor: '#000',
              color: '#eee',
              padding: 8
            },
            placeholder: \\"Type here to translate!\\" // not supported on iOS
            ,
            onChangeText: function onChangeText(text) {
              return _this2.setState({
                text: text
              });
            },
            value: this.state.text,
            dataSentryElement: \\"TextInput\\",
            dataSentrySourceFile: \\"filename-test.js\\"
          }), /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Text, {
            style: {
              padding: 10,
              fontSize: 42
            },
            dataSentryElement: \\"Text\\",
            dataSentrySourceFile: \\"filename-test.js\\"
          }, this.state.text.split(' ').map(function (word) {
            return word && '🍕';
          }).join(' ')));
        }
      }]);
      return PizzaTranslator;
    }(_react.Component);
    function App() {
      return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.View, {
        style: styles.container,
        dataSentryElement: \\"View\\",
        dataSentryComponent: \\"App\\",
        dataSentrySourceFile: \\"filename-test.js\\"
      }, /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Text, {
        style: {
          color: '#eee'
        },
        dataSentryElement: \\"Text\\",
        dataSentrySourceFile: \\"filename-test.js\\"
      }, \\"FullStory ReactNative testing app\\"), /*#__PURE__*/_react[\\"default\\"].createElement(Bananas, null), /*#__PURE__*/_react[\\"default\\"].createElement(PizzaTranslator, {
        dataSentryElement: \\"PizzaTranslator\\",
        dataSentrySourceFile: \\"filename-test.js\\"
      }));
    }
    var styles = _reactNative.StyleSheet.create({
      container: (_container = {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: '#222'
      }, _defineProperty(_container, \\"alignItems\\", 'center'), _defineProperty(_container, \\"justifyContent\\", 'center'), _container)
    });"
  `
  );
});

it("Bananas/Pizza/App No Bananas/Pizza Elements dataSentrySourceFile=match dataSentryComponent=match dataSentryElement=match snapshot matches", () => {
  const result = transform(BananasPizzaAppStandardInput, {
    filename: "/filename-test.js",
    configFile: false,
    presets: ["@babel/preset-react"],
    plugins: [
      [
        plugin,
        {
          native: true,
          ignoreComponents: [
            // Bananas Element
            ["filename-test.js", null, "Bananas"],
            // Pizza Element
            ["filename-test.js", null, "PizzaTranslator"],
          ],
        },
      ],
    ],
  });
  expect(result?.code).toMatchInlineSnapshot(
    `
    "\\"use strict\\";

    function _typeof(obj) { \\"@babel/helpers - typeof\\"; return _typeof = \\"function\\" == typeof Symbol && \\"symbol\\" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && \\"function\\" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? \\"symbol\\" : typeof obj; }, _typeof(obj); }
    Object.defineProperty(exports, \\"__esModule\\", {
      value: true
    });
    exports[\\"default\\"] = App;
    var _react = _interopRequireWildcard(require(\\"react\\"));
    var _reactNative = require(\\"react-native\\");
    var _container;
    function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== \\"function\\") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
    function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== \\"object\\" && typeof obj !== \\"function\\") { return { \\"default\\": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== \\"default\\" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj[\\"default\\"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
    function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\\"Cannot call a class as a function\\"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\\"value\\" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \\"prototype\\", { writable: false }); return Constructor; }
    function _toPropertyKey(arg) { var key = _toPrimitive(arg, \\"string\\"); return _typeof(key) === \\"symbol\\" ? key : String(key); }
    function _toPrimitive(input, hint) { if (_typeof(input) !== \\"object\\" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || \\"default\\"); if (_typeof(res) !== \\"object\\") return res; throw new TypeError(\\"@@toPrimitive must return a primitive value.\\"); } return (hint === \\"string\\" ? String : Number)(input); }
    function _inherits(subClass, superClass) { if (typeof superClass !== \\"function\\" && superClass !== null) { throw new TypeError(\\"Super expression must either be null or a function\\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, \\"prototype\\", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
    function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \\"object\\" || typeof call === \\"function\\")) { return call; } else if (call !== void 0) { throw new TypeError(\\"Derived constructors may only return object or undefined\\"); } return _assertThisInitialized(self); }
    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\\"this hasn't been initialised - super() hasn't been called\\"); } return self; }
    function _isNativeReflectConstruct() { if (typeof Reflect === \\"undefined\\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \\"function\\") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
    _reactNative.UIManager.getViewManagerConfig('RCTView').NativeProps.fsClass = \\"String\\";
    var Bananas = /*#__PURE__*/function (_Component) {
      _inherits(Bananas, _Component);
      var _super = _createSuper(Bananas);
      function Bananas() {
        _classCallCheck(this, Bananas);
        return _super.apply(this, arguments);
      }
      _createClass(Bananas, [{
        key: \\"render\\",
        value: function render() {
          var pic = {
            uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
          };
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Image, {
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
      }]);
      return Bananas;
    }(_react.Component);
    var PizzaTranslator = /*#__PURE__*/function (_Component2) {
      _inherits(PizzaTranslator, _Component2);
      var _super2 = _createSuper(PizzaTranslator);
      function PizzaTranslator(props) {
        var _this;
        _classCallCheck(this, PizzaTranslator);
        _this = _super2.call(this, props);
        _this.state = {
          text: ''
        };
        return _this;
      }
      _createClass(PizzaTranslator, [{
        key: \\"render\\",
        value: function render() {
          var _this2 = this;
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.View, {
            style: {
              padding: 10
            },
            dataSentryElement: \\"View\\",
            dataSentryComponent: \\"PizzaTranslator\\",
            dataSentrySourceFile: \\"filename-test.js\\"
          }, /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.TextInput, {
            style: {
              backgroundColor: '#000',
              color: '#eee',
              padding: 8
            },
            placeholder: \\"Type here to translate!\\" // not supported on iOS
            ,
            onChangeText: function onChangeText(text) {
              return _this2.setState({
                text: text
              });
            },
            value: this.state.text,
            dataSentryElement: \\"TextInput\\",
            dataSentrySourceFile: \\"filename-test.js\\"
          }), /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Text, {
            style: {
              padding: 10,
              fontSize: 42
            },
            dataSentryElement: \\"Text\\",
            dataSentrySourceFile: \\"filename-test.js\\"
          }, this.state.text.split(' ').map(function (word) {
            return word && '🍕';
          }).join(' ')));
        }
      }]);
      return PizzaTranslator;
    }(_react.Component);
    function App() {
      return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.View, {
        style: styles.container,
        dataSentryElement: \\"View\\",
        dataSentryComponent: \\"App\\",
        dataSentrySourceFile: \\"filename-test.js\\"
      }, /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Text, {
        style: {
          color: '#eee'
        },
        dataSentryElement: \\"Text\\",
        dataSentrySourceFile: \\"filename-test.js\\"
      }, \\"FullStory ReactNative testing app\\"), /*#__PURE__*/_react[\\"default\\"].createElement(Bananas, null), /*#__PURE__*/_react[\\"default\\"].createElement(PizzaTranslator, null));
    }
    var styles = _reactNative.StyleSheet.create({
      container: (_container = {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: '#222'
      }, _defineProperty(_container, \\"alignItems\\", 'center'), _defineProperty(_container, \\"justifyContent\\", 'center'), _container)
    });"
  `
  );
});

it("Bananas incompatible plugin victory-core source snapshot matches", () => {
  const result = transform(BananasStandardInput, {
    filename: "test/node_modules/victory-core/filename-test.js",
    presets: ["@babel/preset-react"],
    plugins: [[plugin, { native: true }]],
  });
  expect(result?.code).toMatchInlineSnapshot(
    `
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
  `
  );
});

it("Bananas incompatible plugin victory-valid source snapshot matches", () => {
  const result = transform(BananasStandardInput, {
    filename: "test/node_modules/victory-valid/filename-test.js",
    presets: ["@babel/preset-react"],
    plugins: [[plugin, { native: true }]],
  });
  expect(result?.code).toMatchInlineSnapshot(
    `
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
  `
  );
});

it("Bananas incompatible plugin @react-navigation source snapshot matches", () => {
  const result = transform(BananasStandardInput, {
    filename: "test/node_modules/@react-navigation/core/filename-test.js",
    presets: ["@babel/preset-react"],
    plugins: [[plugin, { native: true }]],
  });
  expect(result?.code).toMatchInlineSnapshot(
    `
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
  `
  );
});

it("setFSTagName sets fsTagName on component with its dataSentryComponent value", () => {
  const result = transform(BananasStandardInput, {
    filename: "filename-test.js",
    presets: ["@babel/preset-react"],
    plugins: [
      [
        plugin,
        {
          native: true,
          setFSTagName: true,
        },
      ],
    ],
  });
  expect(result?.code).toMatchInlineSnapshot(
    `
    "\\"use strict\\";

    function _typeof(obj) { \\"@babel/helpers - typeof\\"; return _typeof = \\"function\\" == typeof Symbol && \\"symbol\\" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && \\"function\\" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? \\"symbol\\" : typeof obj; }, _typeof(obj); }
    var _react = _interopRequireWildcard(require(\\"react\\"));
    var _reactNative = require(\\"react-native\\");
    function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== \\"function\\") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
    function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== \\"object\\" && typeof obj !== \\"function\\") { return { \\"default\\": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== \\"default\\" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj[\\"default\\"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\\"Cannot call a class as a function\\"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\\"value\\" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \\"prototype\\", { writable: false }); return Constructor; }
    function _toPropertyKey(arg) { var key = _toPrimitive(arg, \\"string\\"); return _typeof(key) === \\"symbol\\" ? key : String(key); }
    function _toPrimitive(input, hint) { if (_typeof(input) !== \\"object\\" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || \\"default\\"); if (_typeof(res) !== \\"object\\") return res; throw new TypeError(\\"@@toPrimitive must return a primitive value.\\"); } return (hint === \\"string\\" ? String : Number)(input); }
    function _inherits(subClass, superClass) { if (typeof superClass !== \\"function\\" && superClass !== null) { throw new TypeError(\\"Super expression must either be null or a function\\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, \\"prototype\\", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
    function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \\"object\\" || typeof call === \\"function\\")) { return call; } else if (call !== void 0) { throw new TypeError(\\"Derived constructors may only return object or undefined\\"); } return _assertThisInitialized(self); }
    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\\"this hasn't been initialised - super() hasn't been called\\"); } return self; }
    function _isNativeReflectConstruct() { if (typeof Reflect === \\"undefined\\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \\"function\\") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
    var Bananas = /*#__PURE__*/function (_Component) {
      _inherits(Bananas, _Component);
      var _super = _createSuper(Bananas);
      function Bananas() {
        _classCallCheck(this, Bananas);
        return _super.apply(this, arguments);
      }
      _createClass(Bananas, [{
        key: \\"render\\",
        value: function render() {
          var pic = {
            uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
          };
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Image, {
            source: pic,
            style: {
              width: 193,
              height: 110,
              marginTop: 10
            },
            fsClass: \\"test-class\\",
            fsTagName: \\"Bananas\\",
            dataSentrySourceFile: \\"filename-test.js\\"
          });
        }
      }]);
      return Bananas;
    }(_react.Component);"
  `
  );
});

it("Bananas custom attribute names let component override element with setFSTagName", () => {
  const BananasInputCustomFSTagName = `import React, { Component } from 'react';
import { Image } from 'react-native';

class Bananas extends Component {
  render() {
    let pic = {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
    };
    return <Image source={pic} style={{ width: 193, height: 110, marginTop: 10 }} fsClass="test-class" fsTagName="CustomTagName" />;
  }
}`;

  const result = transform(BananasInputCustomFSTagName, {
    filename: "filename-test.js",
    presets: ["@babel/preset-react"],
    plugins: [
      [
        plugin,
        {
          native: true,
          setFSTagName: true,
        },
      ],
    ],
  });
  expect(result?.code).toMatchInlineSnapshot(
    `
    "\\"use strict\\";

    function _typeof(obj) { \\"@babel/helpers - typeof\\"; return _typeof = \\"function\\" == typeof Symbol && \\"symbol\\" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && \\"function\\" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? \\"symbol\\" : typeof obj; }, _typeof(obj); }
    var _react = _interopRequireWildcard(require(\\"react\\"));
    var _reactNative = require(\\"react-native\\");
    function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== \\"function\\") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
    function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== \\"object\\" && typeof obj !== \\"function\\") { return { \\"default\\": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== \\"default\\" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj[\\"default\\"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\\"Cannot call a class as a function\\"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\\"value\\" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \\"prototype\\", { writable: false }); return Constructor; }
    function _toPropertyKey(arg) { var key = _toPrimitive(arg, \\"string\\"); return _typeof(key) === \\"symbol\\" ? key : String(key); }
    function _toPrimitive(input, hint) { if (_typeof(input) !== \\"object\\" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || \\"default\\"); if (_typeof(res) !== \\"object\\") return res; throw new TypeError(\\"@@toPrimitive must return a primitive value.\\"); } return (hint === \\"string\\" ? String : Number)(input); }
    function _inherits(subClass, superClass) { if (typeof superClass !== \\"function\\" && superClass !== null) { throw new TypeError(\\"Super expression must either be null or a function\\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, \\"prototype\\", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
    function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \\"object\\" || typeof call === \\"function\\")) { return call; } else if (call !== void 0) { throw new TypeError(\\"Derived constructors may only return object or undefined\\"); } return _assertThisInitialized(self); }
    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\\"this hasn't been initialised - super() hasn't been called\\"); } return self; }
    function _isNativeReflectConstruct() { if (typeof Reflect === \\"undefined\\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \\"function\\") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
    var Bananas = /*#__PURE__*/function (_Component) {
      _inherits(Bananas, _Component);
      var _super = _createSuper(Bananas);
      function Bananas() {
        _classCallCheck(this, Bananas);
        return _super.apply(this, arguments);
      }
      _createClass(Bananas, [{
        key: \\"render\\",
        value: function render() {
          var pic = {
            uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
          };
          return /*#__PURE__*/_react[\\"default\\"].createElement(_reactNative.Image, {
            source: pic,
            style: {
              width: 193,
              height: 110,
              marginTop: 10
            },
            fsClass: \\"test-class\\",
            fsTagName: \\"CustomTagName\\",
            dataSentrySourceFile: \\"filename-test.js\\"
          });
        }
      }]);
      return Bananas;
    }(_react.Component);"
  `
  );
});
