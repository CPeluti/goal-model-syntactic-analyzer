import {main} from "../../core/index"
import {readFileSync} from 'fs'

test('Room Cleaning', async () => {
    await main(
        "/home/caio/goal-model-syntactic-analyzer/goal-model-examples/Room Cleaning Example/hddl/Room Cleaning.hddl",
        "/home/caio/goal-model-syntactic-analyzer/goal-model-examples/Room Cleaning Example/gm/Room Cleaning.json",
        "/home/caio/goal-model-syntactic-analyzer/goal-model-examples/Room Cleaning Example/configs/Room Cleaning Config.json"
    )
    const result = JSON.parse(readFileSync('/home/caio/goal-model-syntactic-analyzer/goal-model-error-list.json', 'utf-8'))
    
    const test = [
        {
            "nodeId": "7f04d613-d3b0-4312-9ad8-43c7d2a0db3f",
            "nodeName": "G2: Fetch Dirty Rooms",
            "message": "1: world_db->seleact(r:Room | !r.is_clean)}\n^..........^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\nExpected : \"SELECT\" or \"PROPERTY\" got INVALID"
        },
        {
            "nodeId": "a07c4186-f533-4a0a-afbe-6efcb81222f6",
            "nodeName": "G3: Clean Rooms",
            "message": "1: rooms->forAll}\n^.......^^^^^^^^\nExpected : \"PROPERTY\" got UNIVERSAL_CONDITION"
        }
    ]
    expect(test).toEqual(result)
});