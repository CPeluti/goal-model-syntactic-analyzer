"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueriedPropertyGrammar = void 0;
const GrammarConstants_1 = require("./GrammarConstants");
exports.QueriedPropertyGrammar = {
    lex: {
        rules: [
            [`${GrammarConstants_1.variableTypeRegex}`, "return 'VARIABLE_TYPE'"],
            [`${GrammarConstants_1.variablePropertyIdentifierRegex}`, "return 'PROPERTY'"],
            [`${GrammarConstants_1.variableIdentifierRegex}`, "return 'VARIABLE'"],
            [`->select`, "return 'SELECT'"],
            [`${GrammarConstants_1.whiteSpace}:${GrammarConstants_1.whiteSpace}`, "return ':'"],
            [`${GrammarConstants_1.notRegex}`, "return 'NOT'"],
            [`[0-9.]+`, "return 'NUMBER'"],
            [`"[a-zA-Z]+"`, "return 'STRING'"],
            [`${GrammarConstants_1.whiteSpace}(=|<>)${GrammarConstants_1.whiteSpace}`, "return 'OCL_OPERATION_1'"],
            [`${GrammarConstants_1.whiteSpace}((>|<)=?)${GrammarConstants_1.whiteSpace}`, "return 'OCL_OPERATION_2'"],
            [`${GrammarConstants_1.whiteSpace}(&&|\\|\\||=|<>)${GrammarConstants_1.whiteSpace}`, "return 'OCL_OPERATION_3'"],
            [`${GrammarConstants_1.whiteSpace}(in)${GrammarConstants_1.whiteSpace}`, "return 'OCL_OPERATION_IN'"],
            [`\\(${GrammarConstants_1.whiteSpace}`, "return '('"],
            [`${GrammarConstants_1.whiteSpace}\\)`, "return ')'"],
            [`${GrammarConstants_1.whiteSpace}\\|`, "return '|'"],
            [`\\s`, "return 'WHITE_SPACE'"],
            [`$`, "return 'end-of-input'"],
            [`\.*`, "return 'INVALID'"],
        ]
    },
    bnf: {
        query_property: [
            ["VARIABLE SELECT ( VARIABLE : VARIABLE_TYPE | ocl ) end-of-input",
                `$$ = {
          queriedVariable: $1,
          queryVariable: { value: $4 , type: $6 },
          variablesInCondition: [...$8],
        }`
            ],
            ["VARIABLE PROPERTY SELECT ( VARIABLE : VARIABLE_TYPE | ocl ) end-of-input",
                `$$ = {
          queriedVariable: $1,
          queryVariable: { value: $5 , type: $7 },
          variablesInCondition: [...$9],
        }`
            ],
        ],
        ocl: [
            ["WHITE_SPACE ocl", "$$ = $2"],
            ["VARIABLE PROPERTY ocl_operation", "$$ = [$1, ...$3]"],
            ["NOT VARIABLE PROPERTY ocl_operation", "$$ = [$2, ...$4]"],
            ["VARIABLE PROPERTY", "$$ = [$1]"],
            ["NOT VARIABLE PROPERTY", "$$ = [$2]"],
            ["", "$$ = []"],
        ],
        ocl_operation: [
            ["OCL_OPERATION_1 STRING", "$$ = []"],
            ["OCL_OPERATION_1 NUMBER", "$$ = []"],
            ["OCL_OPERATION_2 NUMBER", "$$ = []"],
            ["OCL_OPERATION_3 VARIABLE PROPERTY", "$$ = [$2]"],
            ["OCL_OPERATION_IN VARIABLE PROPERTY", "$$ = [$2]"],
            ["OCL_OPERATION_IN VARIABLE", "$$ = [$2]"],
        ],
    }
};
