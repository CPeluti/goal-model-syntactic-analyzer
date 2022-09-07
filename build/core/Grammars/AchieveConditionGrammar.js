"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniversalAchieveConditionGrammar = exports.AchieveConditionGrammar = void 0;
const GrammarConstants_1 = require("./GrammarConstants");
exports.AchieveConditionGrammar = {
    lex: {
        rules: [
            [`${GrammarConstants_1.variablePropertyIdentifierRegex}`, "return 'PROPERTY'"],
            [`${GrammarConstants_1.variableIdentifierRegex}`, "return 'VARIABLE'"],
            [`[0-9.]+`, "return 'NUMBER'"],
            [`${GrammarConstants_1.whiteSpace}(=|<>)${GrammarConstants_1.whiteSpace}`, "return 'OCL_OPERATION_1'"],
            [`${GrammarConstants_1.whiteSpace}((>|<)=?)${GrammarConstants_1.whiteSpace}`, "return 'OCL_OPERATION_2'"],
            [`${GrammarConstants_1.whiteSpace}(&&|\\|\\||=|<>)${GrammarConstants_1.whiteSpace}`, "return 'OCL_OPERATION_3'"],
            [`$`, "return 'end-of-input'"],
            [`->forAll`, "return 'UNIVERSAL_CONDITION'"],
            [`\.*`, "return 'INVALID'"],
        ]
    },
    bnf: {
        achieveCondition: [
            ["VARIABLE PROPERTY ocl_operation end-of-input",
                `$$ = {
          type: 'Normal',
          variable: $1,
        }`
            ],
            ["VARIABLE PROPERTY end-of-input",
                `$$ = {
          type: 'Normal',
          variable: $1,
        }`
            ],
        ],
        ocl_operation: [
            ["OCL_OPERATION_1 NUMBER", "$$ = []"],
            ["OCL_OPERATION_2 NUMBER", "$$ = []"],
            ["OCL_OPERATION_3 VARIABLE PROPERTY", "$$ = [$2]"],
        ],
    }
};
exports.UniversalAchieveConditionGrammar = {
    lex: {
        rules: [
            [`${GrammarConstants_1.variableTypeRegex}`, "return 'VARIABLE_TYPE'"],
            [`${GrammarConstants_1.variablePropertyIdentifierRegex}`, "return 'PROPERTY'"],
            [`${GrammarConstants_1.variableIdentifierRegex}`, "return 'VARIABLE'"],
            [`->forAll`, "return 'FOR_ALL'"],
            [`${GrammarConstants_1.whiteSpace}:${GrammarConstants_1.whiteSpace}`, "return ':'"],
            [`${GrammarConstants_1.notRegex}`, "return 'NOT'"],
            [`[0-9.]+`, "return 'NUMBER'"],
            [`${GrammarConstants_1.whiteSpace}(=|<>)${GrammarConstants_1.whiteSpace}`, "return 'OCL_OPERATION_1'"],
            [`${GrammarConstants_1.whiteSpace}((>|<)=?)${GrammarConstants_1.whiteSpace}`, "return 'OCL_OPERATION_2'"],
            [`${GrammarConstants_1.whiteSpace}(&&|\\|\\|)${GrammarConstants_1.whiteSpace}`, "return 'OCL_OPERATION_3'"],
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
        universalAchieveCondition: [
            ["VARIABLE FOR_ALL ( VARIABLE : VARIABLE_TYPE | ocl ) end-of-input",
                `$$ = {
          type: 'Universal',
          iteratedVariable: $1,
          iterationVariable: {value: $5,type:$7},
          variablesInCondition: [...$9],
        }`
            ],
            ["VARIABLE FOR_ALL ( VARIABLE | ocl ) end-of-input",
                `$$ = {
          type: 'Universal',
          iteratedVariable: $1,
          iterationVariable: {value: $4},
          variablesInCondition: [...$6],
        }`
            ],
            ["VARIABLE PROPERTY FOR_ALL ( VARIABLE : VARIABLE_TYPE | ocl ) end-of-input",
                `$$ = {
          type: 'Universal',
          iteratedVariable: $1,
          iterationVariable: {value: $5,type:$7},
          variablesInCondition: [...$9],
        }`
            ],
            ["VARIABLE PROPERTY FOR_ALL ( VARIABLE | ocl ) end-of-input",
                `$$ = {
          type: 'Universal',
          iteratedVariable: $1,
          iterationVariable: {value: $4},
          variablesInCondition: [...$6],
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
            ["OCL_OPERATION_1 NUMBER", "$$ = []"],
            ["OCL_OPERATION_2 NUMBER", "$$ = []"],
            ["OCL_OPERATION_3 VARIABLE PROPERTY", "$$ = [$2]"],
            ["OCL_OPERATION_IN VARIABLE PROPERTY", "$$ = [$2]"],
            ["OCL_OPERATION_IN VARIABLE", "$$ = [$2]"],
        ],
    }
};
