"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JisonParser = void 0;
const JisonAPI = require("jison-gho");
const ErroLogger_1 = require("./ErroLogger");
class JisonParser {
    constructor(grammar) {
        this.parser = new JisonAPI.Parser(grammar);
        this.parser.yy.parseError = function (msg, hash) {
            if (hash?.parser?.sourceCode?.src) {
                hash.parser.sourceCode.src = null;
            }
            const { token, expected } = hash;
            const lexerObj = {
                ...hash.parser.lexer,
                yylloc: { ...hash.yy.lexer.yylloc },
                matched: hash.yy.lexer.matched
            };
            const erroWithRange = lexerObj.prettyPrintRange({ ...lexerObj.yylloc });
            const [errorLine, positionDottedLine] = erroWithRange.split("\n");
            const lineNumberSeparator = errorLine.indexOf(' ');
            const lineNumber = errorLine.substring(0, lineNumberSeparator);
            const erroString = errorLine.substring(lineNumberSeparator + 1);
            ErroLogger_1.ErrorLogger.logParser(lineNumber, erroString, positionDottedLine, expected, token);
        };
    }
    parse(text) {
        return this.parser.parse(text);
    }
}
exports.JisonParser = JisonParser;
