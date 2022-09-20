import { arrayBuffer } from "stream/consumers"
import type { log } from "../interfaces/log"
export function parseTest(logJson: [log]): log[] {
    const logArray = []
    for(const log of logJson) {
        const message = log.message.split("\n")
        // Se mensagem de log não tiver mais de uma parte
        if(message.length <= 1){
            log.message = {expect: message[0]}
        } else {
            // faz parse da mensagem para um log de error
            const expGot = message[2].replace(/.*: /g , '').split(' got ')
            const got = expGot[0]
            const expected = expGot[1]
            let at = message[0].split(': ')
            at = {propertyNumber: at[0], property: at[1].replace(/[{}]/g , '')}
            log.message = {expected, got, at}
        }
        logArray.push(log)
    }
    return logArray
}