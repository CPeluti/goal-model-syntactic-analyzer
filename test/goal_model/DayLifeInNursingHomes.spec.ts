import type {error} from '../interfaces/error'
import { main } from "../../core/index"
import { readFileSync, unlinkSync } from 'fs'

const baseDir = '/home/caio/projetos/les/goal-model-syntactic-analyzer/test/examples/RoboMAX'
const example = 'Day Life In Nursing Homes'

const validLog = [
    {
        "nodeId": "1715257e-c991-45fe-9f76-b7f54477740a",
        "nodeName": "G3: Clean Rooms With UV Light",
        "message": "1: rooms_to_clean->forAll}\n^................^^^^^^^^\nExpected : \"PROPERTY\" got UNIVERSAL_CONDITION"
    },
    {
        "nodeId": "5e20cfe9-07d5-4777-916b-252c074d5c2b",
        "nodeName": "AT1: CleanRoomUV",
        "message": "Task Variable: current_room not present in parent Monitors property"
    }
]

const findMessage = (array: Array<error>, errMsg: string): boolean => {
    const error = array.find(({message}: {message: string}) => {
        return  message === errMsg
    })
    return error? true : false
}

const runMain = async (version: string = 'base', errCase: string = 'CleaningRooms') => {
    await main(
        `${baseDir}/${example}/base/hddl/DayLifeInNursingHomes.hddl`,
        `${baseDir}/${example}/${version}/gm/${errCase}.txt`,
        `${baseDir}/${example}/base/configuration/configurationCleaningRooms.json`
    )
    const result = JSON.parse(readFileSync('/home/caio/projetos/les/goal-model-syntactic-analyzer/goal-model-error-list.json', 'utf-8'))
    return result
}
describe('Cleaning Rooms', () => {
    //TODO: separar os testes de caracterizacao dos de integracao
    test('Should generate a log containing all the syntax errors', async () => {
        const res = await runMain()
        expect(res).toBeTruthy()
    })
    
    test('Should pass with 2 default errors', async () => {
        const res = await runMain()
        expect(validLog).toEqual(res)
    })
    // Testes de integracao

    //TODO: melhorar o descritor do erro para especificar o erro
    //TODO: criar lib para fazer o parser da string do erro.
    
    //TODO: criar gm especificos para cada falha (fazer aos poucos)
    test('Should catch an error at the select syntax', async () => {
        const res = await runMain('cases','selectSyntax')
        const error = findMessage(res,"1: world_db->select}\n^..................^\nExpected : \"(\" got \"end-of-input\"")
        expect(error).toBe(true)
    })

    test('Should catch an error at the node index', async () => {
        const res = await runMain('cases', 'nodeIndex')
        const error = findMessage(res,"Bad ID sequence\nID should be: G2")
        expect(error).toBe(true)
    })

    test('Should catch an error at the invalid QueriedProperty key', async () => {
        const res = await runMain('cases', 'invalidKey')
        const error = findMessage(res,"No QueriedProperty value defined")
        expect(error).toBe(true)
    })

    test('Should catch an error at Query type without a valid QueriedProperty key', async () => {
        const res = await runMain('cases', 'invalidKey')
        const error = findMessage(res,"Property: QueriedProperty is required on type: Query")
        expect(error).toBe(true)
    })

    test('Should catch an error at control syntax missing ":"', async () => {
        const res = await runMain('cases', 'controlSyntax')
        const error = findMessage(res,"1: rooms_to_clean Sequence(Room)}\n^................^^^^^^^^^^^^^^^\nExpected : \":\" got INVALID")
        expect(error).toBe(true)
    })
})