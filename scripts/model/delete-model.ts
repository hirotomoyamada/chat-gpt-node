import { existsJson, readJson } from '../../utils/json'
import { DefinedModel } from '../../types/model'
import { prompt } from '../../libs/inquirer'
import { writeModels } from './write-models'
import { red } from 'chalk'

let definedModels: DefinedModel[] = existsJson('data', 'models') ? readJson('data', 'models') : []

const hasDefinedModels: boolean = !!definedModels.length

export const deleteModel = async () => {
  try {
    if (!hasDefinedModels)
      throw new Error('Model does not exist. Please run "pnpm model --create" to create the model.')

    let targetIds = process.argv.slice(3)

    if (!targetIds.length) {
      const { targetIds: answerTargetIds } = await prompt({
        type: 'checkbox',
        name: 'targetIds',
        message: 'Please select the model to edit',
        suffix: ':',
        choices: definedModels.map(({ id }) => id),
        validate: (input) => {
          if (!input.length) {
            return 'Please select'
          } else {
            return true
          }
        },
      })

      targetIds = answerTargetIds
    }

    const { isConfirm } = await prompt({
      type: 'confirm',
      name: 'isConfirm',
      message: 'Are you sure you want to delete?',
      default: false,
    })

    console.log('')

    if (!isConfirm) return

    for (const targetId of targetIds) {
      const targetModel = definedModels.find(({ id }) => id === targetId)

      if (!targetModel) throw new Error(`${targetId} does not exist.`)

      definedModels = definedModels.filter(({ id }) => id !== targetId)
    }

    await writeModels(definedModels)
  } catch (e) {
    console.error(red(e.message + '\n'))
  }
}
