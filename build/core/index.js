"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const ErroLogger_1 = require("./ErroLogger");
const fast_xml_parser_1 = __importDefault(require("fast-xml-parser"));
const promises_1 = require("fs/promises");
const GoalTree_1 = require("./GoalTree");
const ModelValidator_1 = require("./ModelValidator");
const fs_1 = require("fs");
let isXmlConfigFile = false;
main();
async function main(hddlPath = '', goalModelPath = '', configFilePath = '') {
    try {
        if (hddlPath == '' && goalModelPath == '' && configFilePath == '') {
            [hddlPath, goalModelPath, configFilePath] = process.argv.slice(2);
        }
        if (!hddlPath || !goalModelPath || !configFilePath) {
            throw Error('Error: failed to load files');
        }
        let configFile;
        if (configFilePath.includes(".xml")) {
            isXmlConfigFile = true;
            const xmlFile = (await promises_1.readFile(configFilePath)).toString();
            configFile = await parseXmlFile(xmlFile);
        }
        else {
            configFile = JSON.parse(await (await promises_1.readFile(configFilePath)).toString());
        }
        const goalModel = JSON.parse(await (await promises_1.readFile(goalModelPath)).toString());
        const hddl = await (await promises_1.readFile(hddlPath)).toString();
        checkConfigFile(configFile);
        const typesMap = extractOclToHddlTypesMap(configFile);
        const tasksVarMap = extractTasksVarMap(configFile);
        const tree = goalTreeBuild(goalModel);
        // tree?.showTree()
        if (tree) {
            const modelValidator = new ModelValidator_1.ModelValidator(tree, typesMap, tasksVarMap, hddl, configFile);
            modelValidator.resetValidator();
            modelValidator.validateModel();
            // TODO - Testes aqui
            // new ModelRulesValidatorTest(modelValidator).test()
            const errorList = JSON.stringify(ErroLogger_1.ErrorLogger.errorList);
            fs_1.writeFileSync('goal-model-error-list.json', errorList);
        }
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
}
exports.main = main;
function checkConfigFile(configFile) {
    if (isXmlConfigFile) {
        configFile.type_mapping = fixXMLMapping(configFile.type_mapping, 'mapping');
        configFile.var_mapping = fixXMLMapping(configFile.var_mapping, 'mapping');
        configFile.location_types = fixXMLMapping(configFile.location_types, 'type');
    }
    if (!configFile.type_mapping || !configFile.var_mapping || !configFile.location_types) {
        throw Error('Error: type_mapping or var_mapping missing in the config file');
    }
    ;
}
function extractOclToHddlTypesMap(configFile) {
    const typesMap = new Map();
    configFile.type_mapping.forEach(mapping => {
        typesMap.set(mapping.ocl_type, mapping.hddl_type);
    });
    return typesMap;
}
function extractTasksVarMap(configFile) {
    const tasksVarMap = new Map();
    configFile.var_mapping.forEach(taskElement => {
        tasksVarMap.set(taskElement.task_id, new Map());
        const taskIdVarMap = tasksVarMap.get(taskElement.task_id);
        taskElement.map.forEach(variables => taskIdVarMap?.set(variables.gm_var, variables.hddl_var));
    });
    return tasksVarMap;
}
const goalTreeBuild = function (goalModel) {
    if (!goalModel)
        return;
    const tree = new GoalTree_1.GoalTree();
    if (goalModel.actors) {
        const actor = goalModel.actors.pop();
        const nodes = actor?.nodes;
        const links = goalModel.links;
        if (nodes && links) {
            tree.buildTree(nodes, links);
        }
        return tree;
    }
};
async function parseXmlFile(xmlFile) {
    const parserOptions = {
        attributeNamePrefix: "",
        ignoreAttributes: false,
        parseAttributeValue: true,
        arrayMode: false,
    };
    let configFile = fast_xml_parser_1.default.parse(xmlFile, parserOptions);
    return configFile.configuration;
}
function fixXMLMapping(obj, property) {
    if (Array.isArray(obj)) {
        obj.forEach((element, index) => {
            if (element[property] !== undefined) {
                obj[index] = Array.isArray(element[property]) ? [...element[property]] : element[property];
            }
        });
    }
    else if (obj[property] !== undefined) {
        obj = Array.isArray(obj[property]) ? [...obj[property]] : obj[property];
    }
    return (Array.isArray(obj)) ? obj : [obj];
}
