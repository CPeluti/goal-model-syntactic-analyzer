"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionGrammar = exports.TriggerGrammar = exports.ContextGrammar = void 0;
const GrammarConstants_1 = require("./GrammarConstants");
exports.ContextGrammar = {
    lex: {
        rules: [
            [`Condition`, "return 'CONDITION'"],
            [`Trigger`, "return 'TRIGGER'"],
            [`$`, "return 'end-of-input'"],
            [`\.*`, "return 'INVALID'"],
        ]
    },
    bnf: {
        context: [
            ["TRIGGER end-of-input",
                `$$ = {
          contextType: 'Trigger',
        }`
            ],
            ["CONDITION end-of-input",
                `$$ = {
          contextType: 'Condition',
        }`
            ],
        ],
    }
};
exports.TriggerGrammar = {
    lex: {
        rules: [
            [`${GrammarConstants_1.assertionConditionEvent}`, "return 'EVENT'"],
            [`,`, "return ','"],
            [`$`, "return 'end-of-input'"],
            [`\.*`, "return 'INVALID'"],
        ]
    },
    bnf: {
        event_init: [
            ["event_list end-of-input",
                `$$ = {
          event_list: [...$1],
        }`
            ],
        ],
        event_list: [
            ["EVENT , event_list", "$$ = [$1, ...$3]"],
            ["EVENT", "$$ = [$1]"],
        ]
    }
};
exports.ConditionGrammar = {
    lex: {
        rules: [
            [`not\\s`, "return 'NOT'"],
            [`${GrammarConstants_1.variablePropertyIdentifierRegex}`, "return 'PROPERTY'"],
            [`${GrammarConstants_1.variableIdentifierRegex}`, "return 'VARIABLE'"],
            [`$`, "return 'end-of-input'"],
            [`\.*`, "return 'INVALID'"],
        ]
    },
    bnf: {
        init_condition: [
            ["condition end-of-input",
                `$$ = {
          condition: [...$1],
        }`
            ],
        ],
        condition: [
            [`NOT VARIABLE PROPERTY`, "$$ = [$1, $2]"],
            [`VARIABLE PROPERTY`, "$$ = [$1]"],
        ],
    }
};
