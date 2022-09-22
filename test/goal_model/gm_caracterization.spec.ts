
import { parseTest, checkError } from "../util/logValidation" 
import { runMain } from "../util/runMain"

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


describe('Cleaning Rooms', () => {
    
    //TODO: criar gm especificos para cada falha (fazer aos poucos)
    test('Should catch an error at the select syntax', async () => {
        const expectedError = {
            expected: '"("',
            got: '"end-of-input"',
            error: null,
            at: {
              propertyNumber: '1',
              property: 'world_db->select'
            }
        }
        const res = await runMain('cases','selectSyntax')
        const logs = parseTest(res)
        const error = checkError(logs , expectedError)
        expect(error).toBe(true)
    })

    test('Should catch an error at the node index', async () => {
        const expectedError = {
            expected: 'ID should be: G2',
            got: null,
            at: null,
            error: 'Bad ID sequence'
          }
        const res = await runMain('cases', 'nodeIndex')
        const logs = parseTest(res)
        const error = checkError(logs , expectedError)
        expect(error).toBe(true)
    })

    test('Should catch an error at the invalid QueriedProperty key', async () => {
        const expectedError = {
            expected: 'Property: QueriedProperty is required on type: Query',
            got: null,
            at: null,
            error: null
        }
        const res = await runMain('cases', 'invalidKey')
        const logs = parseTest(res)
        const error = checkError(logs , expectedError)
        expect(error).toBe(true)
    })

    test('Should catch an error at Query type without a valid QueriedProperty key', async () => {
        const expectedError = {
            expected: 'No QueriedProperty value defined',
            got: null,
            at: null,
            error: null
        }

        const res = await runMain('cases', 'invalidKey')
        const logs = parseTest(res)
        const error = checkError(logs , expectedError)
        expect(error).toBe(true)
    })

    test('Should catch an error at control syntax missing ":"', async () => {
        const expectedError = {
            expected: '":"',
            got: 'INVALID',
            error: null,
            at: {
                propertyNumber: '1',
                property: 'rooms_to_clean Sequence(Room)'
            }
        }
        const res = await runMain('cases', 'controlSyntax')
        const logs = parseTest(res)
        const error = checkError(logs , expectedError)
        expect(error).toBe(true)
    })
})