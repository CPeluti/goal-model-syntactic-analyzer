import { ErrorLogger } from './ErroLogger';
import FastXmlParser from 'fast-xml-parser';
import { readFile, writeFile } from 'fs/promises';
import { ModelRulesValidatorTest } from '../test';
import { Config } from './definitions/config.types';
import { GoalModel } from './definitions/goal-model.types';
import { GoalTree } from './GoalTree';
import { ModelValidator } from './ModelValidator';
import { writeFileSync } from 'fs';
import { stdout } from 'process';

let isXmlConfigFile = false

export async function main(hddlPath = '', goalModelPath = '', configFilePath = '') {

  try {

    if(hddlPath === '' && goalModelPath === '' && configFilePath === ''){
      console.log("HERE!");
      [hddlPath, goalModelPath, configFilePath] = process.argv.slice(2)
    }

    console.log("AQUI!", hddlPath, goalModelPath, configFilePath);

    if (!hddlPath || !goalModelPath || !configFilePath) {
      throw Error('Error: failed to load files')
    }

    let configFile: Config;
    if (configFilePath.includes(".xml")) {
      isXmlConfigFile = true;
      const xmlFile = (await readFile(configFilePath)).toString();

      configFile = await parseXmlFile(xmlFile)
    } else {
      configFile = JSON.parse(await (await readFile(configFilePath)).toString())
    }

    const goalModel = JSON.parse(await (await readFile(goalModelPath)).toString())
    const hddl = await (await readFile(hddlPath)).toString()

    checkConfigFile(configFile)

    const typesMap: Map<string, string> = extractOclToHddlTypesMap(configFile)
    const tasksVarMap: Map<string, Map<string, string>> = extractTasksVarMap(configFile)

    const tree = goalTreeBuild(goalModel)
    // tree?.showTree()
    if (tree) {
      const modelValidator = new ModelValidator(tree, typesMap, tasksVarMap, hddl, configFile)
      modelValidator.resetValidator()


      modelValidator.validateModel()

      // TODO - Testes aqui
      // new ModelRulesValidatorTest(modelValidator).test()

      const errorList = JSON.stringify(ErrorLogger.errorList)
      writeFileSync('goal-model-error-list.json', errorList)
    }
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

function checkConfigFile(configFile: Config) {

  if (isXmlConfigFile) {
    configFile.type_mapping = fixXMLMapping(configFile.type_mapping, 'mapping')
    configFile.var_mapping = fixXMLMapping(configFile.var_mapping, 'mapping')
    configFile.location_types = fixXMLMapping(configFile.location_types, 'type')
  }

  if (!configFile.type_mapping || !configFile.var_mapping || !configFile.location_types) {
    throw Error('Error: type_mapping or var_mapping missing in the config file')
  };
}

function extractOclToHddlTypesMap(configFile: Config): Map<string, string> {
  const typesMap: Map<string, string> = new Map()

  configFile.type_mapping.forEach(mapping => {
    typesMap.set(mapping.ocl_type, mapping.hddl_type)
  });

  return typesMap;
}

function extractTasksVarMap(configFile: Config): Map<string, Map<string, string>> {
  const tasksVarMap: Map<string, Map<string, string>> = new Map()

  configFile.var_mapping.forEach(taskElement => {
    tasksVarMap.set(taskElement.task_id, new Map())
    const taskIdVarMap = tasksVarMap.get(taskElement.task_id)
    taskElement.map.forEach(variables => taskIdVarMap?.set(variables.gm_var, variables.hddl_var))
  });

  return tasksVarMap;
}

const goalTreeBuild = function (goalModel: GoalModel): GoalTree | undefined {
  if (!goalModel) return

  const tree = new GoalTree()
  if (goalModel.actors) {
    const actor = goalModel.actors.pop()
    const nodes = actor?.nodes
    const links = goalModel.links

    if (nodes && links) {
      tree.buildTree(nodes, links)
    }

    return tree;
  }
}

async function parseXmlFile(xmlFile: string) {

  const parserOptions = {
    attributeNamePrefix: "",
    ignoreAttributes: false,
    parseAttributeValue: true,
    arrayMode: false,
  }

  let configFile = FastXmlParser.parse(xmlFile, parserOptions)

  return configFile.configuration
}

function fixXMLMapping(obj: any, property: string) {

  if (Array.isArray(obj)) {
    obj.forEach((element, index) => {
      if (element[property] !== undefined) {
        obj[index] = Array.isArray(element[property]) ? [...element[property]] : element[property]
      }
    })
  }
  else if (obj[property] !== undefined) {
    obj = Array.isArray(obj[property]) ? [...obj[property]] : obj[property]
  }

  return (Array.isArray(obj)) ? obj : [obj]
}