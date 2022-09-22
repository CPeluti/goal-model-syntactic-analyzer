import type { log } from "../interfaces/log"
export function parseTest(logJson: [log]): log[] {
    const logArray = []
    for(const log of logJson) {
        let got = null
        let expected = null
        let error = null
        let at = null
        const message = log.message.split("\n")
        // Se mensagem de log não tiver mais de uma parte
        // TODO: substituir esse switch por um regex
        switch(message.length){
            case 1:
                expected = message[0]
                break
            case 2:
                expected = message[1]
                error = message[0]
                break
            default:
                const expGot = message[2].replace(/.*: /g , '').split(' got ')
                expected = expGot[0]
                got = expGot[1]
                at = message[0].split(': ')
                at = {propertyNumber: at[0], property: at[1].replace(/[{}]/g , '')}
                break
        }
        log.message = {expected, got, at, error}
        logArray.push(log)
    }
    return logArray
}