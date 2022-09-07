"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelRulesValidator = void 0;
const ErroLogger_1 = require("./ErroLogger");
const AchieveConditionGrammar_1 = require("./Grammars/AchieveConditionGrammar");
const ContextGrammar_1 = require("./Grammars/ContextGrammar");
const GoalTextPropertyGrammar_1 = require("./Grammars/GoalTextPropertyGrammar");
const TaskTextPropertyGrammar_1 = require("./Grammars/TaskTextPropertyGrammar");
const MonitorsAndControlsGrammar_1 = require("./Grammars/MonitorsAndControlsGrammar");
const QueriedPropertyGrammar_1 = require("./Grammars/QueriedPropertyGrammar");
const TaskGrammar_1 = require("./Grammars/TaskGrammar");
const JisonParser_1 = require("./JisonParser");
const constants_1 = require("./utils/constants");
const utils_1 = require("./utils/utils");
const queriedPropertyJisonParser = new JisonParser_1.JisonParser(QueriedPropertyGrammar_1.QueriedPropertyGrammar);
const goalTextPropertyJisonParser = new JisonParser_1.JisonParser(GoalTextPropertyGrammar_1.GoalTextPropertyGrammar);
const achieveConditionJisonParser = new JisonParser_1.JisonParser(AchieveConditionGrammar_1.AchieveConditionGrammar);
const universalAchieveConditionJisonParser = new JisonParser_1.JisonParser(AchieveConditionGrammar_1.UniversalAchieveConditionGrammar);
const monitorsJisonParser = new JisonParser_1.JisonParser(MonitorsAndControlsGrammar_1.MonitorsGrammar);
const controlsJisonParser = new JisonParser_1.JisonParser(MonitorsAndControlsGrammar_1.ControlsGrammar);
const contextJisonParser = new JisonParser_1.JisonParser(ContextGrammar_1.ContextGrammar);
const triggerJisonParser = new JisonParser_1.JisonParser(ContextGrammar_1.TriggerGrammar);
const conditionJisonParser = new JisonParser_1.JisonParser(ContextGrammar_1.ConditionGrammar);
const taskTextPropertyJisonParser = new JisonParser_1.JisonParser(TaskTextPropertyGrammar_1.TaskTextPropertyGrammar);
const taskLocationJisonParser = new JisonParser_1.JisonParser(TaskGrammar_1.LocationGrammar);
const taskParamsJisonParser = new JisonParser_1.JisonParser(TaskGrammar_1.ParamsGrammar);
const taskRobotNumberJisonParser = new JisonParser_1.JisonParser(TaskGrammar_1.RobotNumberGrammar);
class ModelRulesValidator {
    constructor(tree, typesMap, tasksVarMap, hddl, configFile) {
        this.tree = tree;
        this.tasksVarMap = tasksVarMap;
        this.typesMap = typesMap;
        this.hddl = hddl;
        this.configFile = configFile;
        this.currentNodeRef = {
            node: { ...tree.root }
        };
        ErroLogger_1.ErrorLogger.currentNodeRef = this.currentNodeRef;
    }
    validateGoalTextProperty(nodeText) {
        if (!nodeText) {
            ErroLogger_1.ErrorLogger.log('Goal Name is required');
            return;
        }
        const goalTextPropertyObj = goalTextPropertyJisonParser.parse(nodeText);
        if (!goalTextPropertyObj)
            return;
    }
    validateTaskTextProperty(taskText) {
        if (!taskText) {
            ErroLogger_1.ErrorLogger.log('Task Name is required');
            return;
        }
        taskTextPropertyJisonParser.parse(taskText);
    }
    validateId(nodeText, validId) {
        if (!nodeText.includes(`${validId}:`)) {
            ErroLogger_1.ErrorLogger.log(`Bad ID sequence\nID should be: ${validId}`);
        }
    }
    validateGoalType(goalType) {
        const goalTypeList = [constants_1.GOAL_TYPE_QUERY, constants_1.GOAL_TYPE_ACHIEVE, constants_1.GOAL_TYPE_PERFORM];
        if (goalType && !goalTypeList.includes(goalType)) {
            ErroLogger_1.ErrorLogger.log("Invalid GoalType");
        }
    }
    validateNodeIsALeaf(children) {
        if (children.length != 0) {
            ErroLogger_1.ErrorLogger.log('Node must be a leaf, but node has children');
        }
    }
    validateNodeIsNotALeaf(children) {
        if (children.length == 0) {
            ErroLogger_1.ErrorLogger.log('Node cannot be a leaf, but node has no children');
        }
    }
    validateQueryGoalProperties(_properties) {
        const requeridProperties = [constants_1.QUERIED_PROPERTY, constants_1.CONTROLS];
        const cannotContains = [constants_1.ACHIEVED_CONDITION, constants_1.UNIVERSAL_ACHIEVED_CONDITION];
        this.validateProperties(_properties, constants_1.GOAL_TYPE_QUERY, requeridProperties, cannotContains);
    }
    validateQueryGoalQueriedProperty(properties, variablesList) {
        const queriedPropertyValue = properties.QueriedProperty;
        if (!queriedPropertyValue) {
            ErroLogger_1.ErrorLogger.log('No QueriedProperty value defined');
            return;
        }
        const queriedPropertyObj = queriedPropertyJisonParser.parse(queriedPropertyValue);
        if (!queriedPropertyObj)
            return;
        let { queriedVariable, queryVariable, variablesInCondition } = queriedPropertyObj;
        if (variablesInCondition.length) {
            const oclQueryVariable = variablesInCondition.filter((variable) => variable == queryVariable.value);
            if (!oclQueryVariable.length) {
                ErroLogger_1.ErrorLogger.log(`Query variable: ${queryVariable.value} not used in the OCL instruction`);
            }
            else if (oclQueryVariable.length == 1) {
                const variableToCheck = variablesInCondition.find((variable) => variable !== queryVariable.value);
                if (variableToCheck && variablesList[variableToCheck] == undefined) {
                    ErroLogger_1.ErrorLogger.log(`Undeclared variable: ${variableToCheck} used in QueriedProperty OCL instruction`);
                }
            }
        }
        if (queriedVariable !== constants_1.WORLD_DB) {
            const variableType = variablesList[queriedVariable];
            if (variableType == undefined) {
                ErroLogger_1.ErrorLogger.log(`Undeclared variable: ${queriedVariable} used in QueriedProperty`);
            }
            else {
                if (!queriedVariable.includes('.') && !utils_1.isVariableTypeSequence(variableType)) {
                    ErroLogger_1.ErrorLogger.log('Query variable type is not a Sequence');
                }
            }
        }
        const controlsValue = properties.Controls;
        if (controlsValue && utils_1.getControlsVariablesList(controlsValue).length == 0) {
            ErroLogger_1.ErrorLogger.log('Must be a variable in Controls to receive a QueriedProperty value');
        }
    }
    validateAchieveGoalProperties(_properties) {
        const requeridProperties = [constants_1.CONTROLS, constants_1.MONITORS];
        const cannotContains = [constants_1.QUERIED_PROPERTY];
        this.validateProperties(_properties, constants_1.GOAL_TYPE_ACHIEVE, requeridProperties, cannotContains);
    }
    validateAchieveGoalAchieveConditionAndUniversalAchieveCondition(properties, variablesList) {
        const achieveConditionValue = properties.AchieveCondition;
        const universalAchieveConditionValue = properties.UniversalAchieveCondition;
        const valid = this.validateDoubleRequiredProperties(properties, constants_1.GOAL_TYPE_ACHIEVE, constants_1.ACHIEVED_CONDITION, constants_1.UNIVERSAL_ACHIEVED_CONDITION);
        if (!valid) {
            ErroLogger_1.ErrorLogger.log('Validation of double properties skipped');
            return;
        }
        let achieveConditionObj;
        if (achieveConditionValue) {
            achieveConditionObj = achieveConditionJisonParser.parse(achieveConditionValue);
        }
        if (universalAchieveConditionValue) {
            achieveConditionObj = universalAchieveConditionJisonParser.parse(universalAchieveConditionValue);
        }
        else if (properties.hasOwnProperty(constants_1.UNIVERSAL_ACHIEVED_CONDITION)) {
            ErroLogger_1.ErrorLogger.log('UniversalAchieveCondition must have a value');
        }
        if (!achieveConditionObj)
            return;
        if (achieveConditionObj.type == 'Normal') {
            checkControls(achieveConditionObj.variable.split('.')[0]);
            return;
        }
        const { iteratedVariable, iterationVariable, variablesInCondition } = achieveConditionObj;
        if (variablesInCondition.length) {
            const oclIterationVariable = variablesInCondition.filter((variable) => variable == iterationVariable.value);
            if (!oclIterationVariable.length) {
                ErroLogger_1.ErrorLogger.log(`Iteration variable: ${iterationVariable.value} not used in the OCL instruction`);
            }
            else if (oclIterationVariable.length == 1) {
                const variableToCheck = variablesInCondition.find((variable) => variable !== iterationVariable.value);
                if (variableToCheck && variablesList[variableToCheck] == undefined) {
                    ErroLogger_1.ErrorLogger.log(`Undeclared variable: ${variableToCheck} used in UniversalAchieveCondition OCL instruction`);
                }
            }
        }
        if (variablesList[iteratedVariable] == undefined) {
            ErroLogger_1.ErrorLogger.log(`Iterated variable: ${iteratedVariable} was not previous instantiated`);
        }
        const variableType = variablesList[iteratedVariable];
        if (!iteratedVariable.includes('.') && variableType && !utils_1.isVariableTypeSequence(variableType)) {
            ErroLogger_1.ErrorLogger.log('Iterated variable type is not a Sequence');
        }
        const monitorsValue = properties.Monitors;
        if (monitorsValue && !utils_1.getMonitorsVariablesList(monitorsValue).find(variable => variable.identifier == iteratedVariable)) {
            ErroLogger_1.ErrorLogger.log(`Iterated variable: ${iteratedVariable} not present in monitored variables list`);
        }
        checkControls(iterationVariable.value);
        function checkControls(iterationVariable) {
            const controlsValue = properties.Controls;
            if (controlsValue && !utils_1.getControlsVariablesList(controlsValue).find(variable => variable.identifier == iterationVariable)) {
                ErroLogger_1.ErrorLogger.log(`Iteration variable: ${iterationVariable} not present in control variables list`);
            }
        }
    }
    validateTaskProperties(_properties) {
        const requeridProperties = [];
        const cannotContains = [constants_1.QUERIED_PROPERTY, constants_1.ACHIEVED_CONDITION, constants_1.UNIVERSAL_ACHIEVED_CONDITION, constants_1.CONTEXT];
        this.validateProperties(_properties, constants_1.TASK_TYPE, requeridProperties, cannotContains);
    }
    validateTaskNameHddlMap(taskText, hddl) {
        const taskName = utils_1.getTaskName(taskText);
        if (taskName) {
            const taskHddlDefinition = `(:task ${taskName}`;
            if (!hddl.includes(taskHddlDefinition)) {
                ErroLogger_1.ErrorLogger.log(`Task: ${taskName} not mapped on .hddl file`);
            }
        }
    }
    validateTaskVariablesMapOnHddl(properties, taskText, variablesList, parentGoalIsGroupFalse) {
        const taskName = utils_1.getTaskName(taskText);
        const taskVariables = utils_1.getTaskVariablesList(properties);
        const hddlTaskRegex = `\\(:task ${taskName}\.*\\)`;
        const match = this.hddl.toString().match(new RegExp(hddlTaskRegex, 'g'));
        if (match != null && match[0]) {
            const hddlParametersString = match[0].split(':parameters')[1].trim().toString();
            taskVariables.forEach(variable => {
                const type = variablesList[variable];
                const taskId = utils_1.getTaskId(taskText);
                if (type && taskId) {
                    const hddlVariableIdentifier = this.tasksVarMap.get(taskId)?.get(variable);
                    const hddlType = this.typesMap.get(type);
                    const hddlVariable = `${hddlVariableIdentifier} - ${hddlType}`;
                    if (!hddlVariableIdentifier || !hddlType) {
                        ErroLogger_1.ErrorLogger.log(`Task variable: ${variable}: ${type} not mapped on task ${taskName} in the HDDL file`);
                    }
                    else if (!hddlParametersString.includes(hddlVariable)) {
                        ErroLogger_1.ErrorLogger.log(`Task variable: ${variable}: ${type} not mapped as ${hddlVariable} in the HDDL file`);
                    }
                }
            });
            this.validateTaskRobotsOnHddl(properties, hddlParametersString, parentGoalIsGroupFalse);
        }
    }
    validateTaskRobotsOnHddl(taskProperties, hddlParametersString, parentGoalIsGroupFalse) {
        const robotRegex = /(robot)(\s|\))/g;
        const robotTeamRegex = /(robotteam)(\s|\))/g;
        const hasRobotTeam = (hddlParametersString.match(new RegExp(robotTeamRegex)) != null);
        const hddlRobotCountMatch = hddlParametersString.match(new RegExp(robotRegex));
        if (taskProperties.RobotNumber) {
            const robotNumberObj = taskRobotNumberJisonParser.parse(taskProperties.RobotNumber);
            if (robotNumberObj) {
                if (parentGoalIsGroupFalse) {
                    try {
                        if (robotNumberObj.type === 'RANGE') {
                            const minRobotNumber = robotNumberObj.value[0];
                            if (minRobotNumber != constants_1.ONE_ROBOT)
                                throw `Range: [${robotNumberObj.value.join(",")}] must start with ${constants_1.ONE_ROBOT}`;
                        }
                        else {
                            if (!hddlRobotCountMatch)
                                throw 'None "robot" variable defined in the Task HDDL definition';
                            const hddlRobotCount = hddlRobotCountMatch.length;
                            if (hddlRobotCount != parseInt(constants_1.ONE_ROBOT))
                                throw `Just one "robot" variable must be defined in HDDL definition, got ${hddlRobotCount}`;
                        }
                    }
                    catch (errorMessage) {
                        ErroLogger_1.ErrorLogger.log(`Task with a Non Group Parent must have 1 "robot" variable in its declaration or a RobotNumber attribute with 1 present in the range\n ->${errorMessage ? errorMessage : ''}`);
                    }
                }
                if (robotNumberObj.type && !hasRobotTeam) {
                    if (robotNumberObj.type === 'RANGE') {
                        robotNumberObj.value = robotNumberObj.value[1];
                    }
                    try {
                        if (!hddlRobotCountMatch)
                            throw new Error;
                        const hddlRobotCount = hddlRobotCountMatch.length;
                        if (parseInt(robotNumberObj.value) != hddlRobotCount) {
                            throw new Error;
                        }
                    }
                    catch (e) {
                        const errorMessageType = (robotNumberObj.type === 'RANGE') ? 'a max range of' : 'value';
                        ErroLogger_1.ErrorLogger.log(`RobotNumber with ${errorMessageType}: ${robotNumberObj.value} must map ${robotNumberObj.value} "robots" or a "robotteam" variable in the HDDL definition`);
                    }
                }
            }
        }
        else if (!taskProperties.RobotNumber && hasRobotTeam) {
            ErroLogger_1.ErrorLogger.log(`Tasks without a RobotNumber attribute cannot have a "robotteam" variable in the HDDL definition`);
        }
    }
    validateIfTaskParentHasMonitors(parentProperties, taskProperties) {
        const taskHasVariables = taskProperties.Params || taskProperties.Location;
        if (!parentProperties) {
            ErroLogger_1.ErrorLogger.log('Task must have a Parent');
        }
        else if (taskHasVariables && !('Monitors' in parentProperties)) {
            ErroLogger_1.ErrorLogger.log('Task parent must have a Monitors property');
        }
    }
    validateTaskPropertiesVariablesWithParentMonitors(parentProperties, taskProperties, instantiatedVariablesList) {
        const variablesList = [];
        if (taskProperties.Location) {
            const locationVariable = taskLocationJisonParser.parse(taskProperties.Location);
            if (locationVariable) {
                variablesList.push(locationVariable);
                const locationVariableType = instantiatedVariablesList[locationVariable];
                if (!locationVariableType) {
                    ErroLogger_1.ErrorLogger.log(`Location variable: ${locationVariable} does not have a Type`);
                }
                else if (!this.configFile.location_types.includes(locationVariableType)) {
                    ErroLogger_1.ErrorLogger.log(`Location variable type: ${locationVariableType} is not declared in location_types on the config file`);
                }
            }
        }
        if (taskProperties.Params) {
            const paramsVariables = taskParamsJisonParser.parse(taskProperties.Params);
            if (paramsVariables)
                variablesList.push(...paramsVariables);
        }
        if (taskProperties.RobotNumber) {
            const robotNumberObj = taskRobotNumberJisonParser.parse(taskProperties.RobotNumber);
            if (robotNumberObj && robotNumberObj.type === 'RANGE') {
                const [minRobot, maxRobot] = robotNumberObj.value;
                if ((minRobot && maxRobot) && (parseInt(minRobot) > parseInt(maxRobot))) {
                    ErroLogger_1.ErrorLogger.log(`RobotNumber Range: minimum robot number is grater than the maximum number`);
                }
            }
        }
        if (variablesList && parentProperties.Monitors) {
            const monitorsVariablesList = utils_1.getPlainMonitorsVariablesList(parentProperties.Monitors);
            variablesList.forEach((variable) => {
                if (!monitorsVariablesList.includes(variable)) {
                    ErroLogger_1.ErrorLogger.log(`Task Variable: ${variable} not present in parent Monitors property`);
                }
                if (!instantiatedVariablesList[variable]) {
                    ErroLogger_1.ErrorLogger.log(`Task Variable: ${variable} was not previous instantiated`);
                }
            });
        }
    }
    validateMonitorsProperty(monitorsValue, variablesList) {
        if (!monitorsValue) {
            ErroLogger_1.ErrorLogger.log('No Monitors value defined');
            return;
        }
        const monitorsObj = monitorsJisonParser.parse(monitorsValue);
        if (!monitorsObj)
            return;
        const monitorsVariablesList = utils_1.getMonitorsVariablesList(monitorsValue);
        monitorsVariablesList.forEach(variable => {
            if (!variablesList[variable.identifier]) {
                ErroLogger_1.ErrorLogger.log(`Variable: ${variable.identifier} used on Monitors was not previous instantiated`);
            }
        });
    }
    validateControlsProperty(controlsValue) {
        if (!controlsValue) {
            ErroLogger_1.ErrorLogger.log('No Controls value defined');
            return;
        }
        const controlsObj = controlsJisonParser.parse(controlsValue);
        utils_1.getControlsVariablesList(controlsValue).forEach(variable => {
            const { identifier, type } = variable;
            if (!(identifier)) {
                ErroLogger_1.ErrorLogger.log('Variable identifier in Controls property has an error');
            }
            if (!(type)) {
                ErroLogger_1.ErrorLogger.log('Variable type in Controls property is required');
            }
        });
    }
    validateContextProperty(properties) {
        const { Context } = properties;
        if (!Context) {
            return;
        }
        const { contextType } = contextJisonParser.parse(Context);
        if (!contextType)
            return;
        if (contextType == constants_1.TRIGGER) {
            this.validateProperties(properties, constants_1.CONTEXT, [constants_1.TRIGGER], []);
            const valid = this.validateDoubleRequiredProperties(properties, constants_1.CONTEXT, constants_1.TRIGGER, constants_1.CONDITION);
            if (!valid)
                ErroLogger_1.ErrorLogger.log(`Node type: ${constants_1.CONTEXT} with the value ${constants_1.TRIGGER} must have a ${constants_1.TRIGGER} property`);
            const { Trigger } = properties;
            if (Trigger) {
                const triggerObj = triggerJisonParser.parse(Trigger);
            }
        }
        else if (contextType == constants_1.CONDITION) {
            this.validateProperties(properties, constants_1.CONTEXT, [constants_1.CONDITION], []);
            const valid = this.validateDoubleRequiredProperties(properties, constants_1.CONTEXT, constants_1.TRIGGER, constants_1.CONDITION);
            if (!valid)
                ErroLogger_1.ErrorLogger.log(`Node type: ${constants_1.CONTEXT} with the value ${constants_1.CONDITION} must have a ${constants_1.CONDITION} property`);
            const { Condition } = properties;
            if (Condition) {
                const conditionObj = conditionJisonParser.parse(Condition);
            }
        }
    }
    // ============ aux methods  ================= //
    parentGoalIsGroupFalse(parentProperties) {
        return (parentProperties.Group && parentProperties.Group === constants_1.GROUP_FALSE) ? true : false;
    }
    validateProperties(_properties, nodeType, requeridProperties, cannotContains) {
        requeridProperties.forEach(requeridProperty => {
            if (!_properties.hasOwnProperty(requeridProperty)) {
                ErroLogger_1.ErrorLogger.log(`Property: ${requeridProperty} is required on type: ${nodeType}`);
            }
        });
        cannotContains.forEach(cannotContainProperty => {
            if (_properties.hasOwnProperty(cannotContainProperty)) {
                ErroLogger_1.ErrorLogger.log(`Node type: ${nodeType} cannot contain the property: ${cannotContainProperty}`);
            }
        });
    }
    validateDoubleRequiredProperties(_properties, nodeType, firstProperty, secondProperty) {
        const hasFirstProperty = _properties.hasOwnProperty(firstProperty);
        const hasSecondProperty = _properties.hasOwnProperty(secondProperty);
        if (hasFirstProperty && hasSecondProperty) {
            ErroLogger_1.ErrorLogger.log(`Node type: ${nodeType} cannot contain the property: ${firstProperty} and ${secondProperty} at the same time`);
            return false;
        }
        return true;
    }
}
exports.ModelRulesValidator = ModelRulesValidator;
