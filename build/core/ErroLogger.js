"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorLogger = void 0;
const chalk_1 = __importDefault(require("chalk"));
class ErrorLogger {
    static log(erroMessage) {
        const nodeName = this.currentNodeRef.node.goalData.text;
        const styledErrorTitle = chalk_1.default.bold.red(`Error on node -> "${nodeName}"`);
        const styledErrorMessage = chalk_1.default.bold.red(erroMessage);
        this.addErrorToList(nodeName, erroMessage);
        const logMessage = `${styledErrorTitle}\n${styledErrorMessage}\n`;
        console.error(logMessage);
    }
    static logParser(lineNumber, erroString, positionDottedLine, expected, token) {
        const nodeName = this.currentNodeRef.node.goalData.text;
        const printErrorRange = chalk_1.default `{red ${lineNumber} }{white.bold ${erroString}}\n{red ${positionDottedLine}}`;
        const styledErrorTitle = chalk_1.default.bold.red(`Error on node -> "${nodeName}"`);
        console.log(styledErrorTitle);
        console.log(printErrorRange);
        let expectedMsg = '';
        if (expected && token) {
            expectedMsg = `Expected : ${expected.join(' or ')} got ${token}`;
            console.log(chalk_1.default `{white.bold ${expectedMsg}}\n`);
        }
        const errorRangeMsg = `${lineNumber} ${erroString}}\n${positionDottedLine}\n${expectedMsg}`;
        this.addErrorToList(nodeName, errorRangeMsg);
    }
    static addErrorToList(nodeName, erroMessage) {
        const message = {
            nodeId: this.currentNodeRef.node.goalData.id,
            nodeName,
            message: erroMessage
        };
        this.errorList.push(message);
        this.errorCount++;
    }
}
exports.ErrorLogger = ErrorLogger;
ErrorLogger.currentNodeRef = {};
ErrorLogger.errorCount = 0;
ErrorLogger.errorList = [];
