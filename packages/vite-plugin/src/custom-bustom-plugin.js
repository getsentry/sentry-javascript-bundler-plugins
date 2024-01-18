const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse");
const generate = require("@babel/generator");

function parsingTest() {
  const code = "const n = 1";

  // parse the code -> ast
  const ast = parse(code);

  // transform the ast
  traverse(ast, {
    enter(path) {
      // in this example change all the variable `n` to `x`
      if (path.isIdentifier({ name: "n" })) {
        path.node.name = "x";
      }
    },
  });
  // generate code <- ast
  const output = generate(ast, undefined, code);
  console.log(output.code); // 'const x = 1;'
}

module.exports = parsingTest;
