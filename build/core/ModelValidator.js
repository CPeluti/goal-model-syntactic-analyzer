"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelValidator = void 0;
const ErroLogger_1 = require("./ErroLogger");
const ModelRulesValidator_1 = require("./ModelRulesValidator");
const constants_1 = require("./utils/constants");
const utils_1 = require("./utils/utils");
const chalk_1 = __importDefault(require("chalk"));
class ModelValidator extends ModelRulesValidator_1.ModelRulesValidator {
    constructor(tree, typesMap, tasksVarMap, hddl, configFile) {
        super(tree, typesMap, tasksVarMap, hddl, configFile);
        this.GOAL_ID = 'G';
        this.TASK_ID = 'AT';
        this.idChecker = (_ID) => {
            let count = 0;
            const ID = _ID;
            return () => {
                count++;
                return `${ID}${count}`;
            };
        };
        this.goalIdChecker = this.idChecker(this.GOAL_ID);
        this.taskIdChecker = this.idChecker(this.TASK_ID);
    }
    resetValidator() {
        this.goalIdChecker = this.idChecker(this.GOAL_ID);
        this.taskIdChecker = this.idChecker(this.TASK_ID);
        this.currentNodeRef.node = { ...this.tree.root };
        ErroLogger_1.ErrorLogger.errorCount = 0;
    }
    validateModel() {
        console.log(chalk_1.default.greenBright('Validating Goal Model'));
        let visited = [];
        let current = this.tree.root;
        const context = {};
        const variablesList = {};
        let validate = (node, context, variablesList) => {
            visited.push(node.goalData?.text);
            this.manageContext(context, node);
            this.manageVariablesList(variablesList, node);
            this.validateNode(node, context, variablesList);
            node.children.forEach(_node => validate(_node, context, variablesList));
        };
        validate(current, context, variablesList);
        const totalOfErros = ErroLogger_1.ErrorLogger.errorCount;
        const consoleFormatter = (totalOfErros > 0) ? chalk_1.default.redBright.bold : chalk_1.default.greenBright.bold;
        console.log(consoleFormatter(`Total of Errors: ${totalOfErros}`));
        console.log(chalk_1.default.greenBright('Validation finished\n'));
        return visited;
    }
    validateNode(node, context, variablesList) {
        this.currentNodeRef.node = { ...node };
        const goalData = node.goalData;
        switch (goalData?.type) {
            case constants_1.GOAL_NODE_TYPE_GOAL:
                this.validateGoal(node, context, variablesList);
                break;
            case constants_1.GOAL_NODE_TYPE_TASK:
                this.validateTask(node, context, variablesList);
                break;
            default:
                throw new Error('Type not specified');
                break;
        }
    }
    manageVariablesList(variablesList, node) {
        const { Controls } = node.goalData.customProperties;
        if (Controls) {
            this.validateControlsProperty(Controls);
            utils_1.getControlsVariablesList(Controls).forEach(variable => {
                const { identifier, type } = variable;
                if (variablesList[identifier] !== undefined) {
                    ErroLogger_1.ErrorLogger.log(`Redeclaration of variable: ${identifier}`);
                }
                variablesList[identifier] = type;
            });
        }
    }
    manageContext(context, node) {
    }
    validateGoal(node, context, variablesList) {
        this.validateGoalTextProperty(node.goalData.text);
        this.validateId(node.goalData.text, this.goalIdChecker());
        this.validateGoalType(node.goalData.customProperties.GoalType);
        this.validateContextProperty(node.goalData.customProperties);
        const validateQueryGoal = () => {
            this.validateQueryGoalProperties(node.goalData.customProperties);
            this.validateQueryGoalQueriedProperty(node.goalData.customProperties, variablesList);
            this.validateNodeIsALeaf(node.children);
        };
        const validateAchieveGoal = () => {
            this.validateAchieveGoalProperties(node.goalData.customProperties);
            this.validateMonitorsProperty(node.goalData.customProperties.Monitors, variablesList);
            this.validateAchieveGoalAchieveConditionAndUniversalAchieveCondition(node.goalData.customProperties, variablesList);
            this.validateNodeIsNotALeaf(node.children);
        };
        const { GoalType } = node.goalData.customProperties;
        if (GoalType) {
            switch (GoalType) {
                case constants_1.GOAL_TYPE_QUERY:
                    validateQueryGoal();
                    break;
                case constants_1.GOAL_TYPE_ACHIEVE:
                    validateAchieveGoal();
                    break;
                case constants_1.GOAL_TYPE_PERFORM:
                    break;
            }
        }
    }
    validateTask(node, context, variablesList) {
        this.validateId(node.goalData.text, this.taskIdChecker());
        this.validateTaskTextProperty(node.goalData.text);
        this.validateTaskProperties(node.goalData.customProperties);
        this.validateIfTaskParentHasMonitors(node.parent?.goalData.customProperties, node.goalData.customProperties);
        const taskParanteProperties = node.parent?.goalData.customProperties;
        let parentGoalIsGroupFalse = false;
        if (taskParanteProperties) {
            this.validateTaskPropertiesVariablesWithParentMonitors(taskParanteProperties, node.goalData.customProperties, variablesList);
            parentGoalIsGroupFalse = this.parentGoalIsGroupFalse(taskParanteProperties);
        }
        this.validateTaskNameHddlMap(node.goalData.text, this.hddl);
        this.validateTaskVariablesMapOnHddl(node.goalData.customProperties, node.goalData.text, variablesList, parentGoalIsGroupFalse);
    }
}
exports.ModelValidator = ModelValidator;
