import { main } from "../../core/index"
import { readFileSync, unlinkSync } from 'fs'
import path from 'path'
const root = path.resolve(__dirname, '../../')

export const runMain = async (version: string = 'base', errCase: string = 'CleaningRooms') => {
    await main(
        `${root}/test/examples/base/hddl/DayLifeInNursingHomes.hddl`,
        `${root}/test/examples/${version}/gm/${errCase}.txt`,
        `${root}/test/examples/base/configuration/configurationCleaningRooms.json`
    )
    const result = JSON.parse(readFileSync(`${root}/goal-model-error-list.json`, 'utf-8'))
    return result
}