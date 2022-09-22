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

describe('Cleaning Rooms integration tests', () => {
    test('Should generate a log containing all the syntax errors', async () => {
        const res = await runMain()
        expect(res).toBeTruthy()
    })
    
    test('Should pass with 2 default errors', async () => {
        const res = await runMain()
        expect(validLog).toEqual(res)
    })
})