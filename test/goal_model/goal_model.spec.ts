import {main} from "../../core/index"

test('Room Cleaning', async () => {
    await main(
        "../../goal-model-examples/Room Cleaning Example/hddl/Room Cleaning.hddl",
        "../../goal-model-examples/Room Cleaning Example/gm/Room Cleaning.json",
        "../../goal-model-examples/Room Cleaning Example/configs/Room Cleaning Config.json"
    )
});