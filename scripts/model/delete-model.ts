import { existsJson, readJson } from '../../utils/json'
import { DefinedModel } from '../../types/openai'
import { prompt } from '../../libs/inquirer'
import { writeModels } from './write-models'
import { red } from 'chalk'
import { pkgManagerName } from '../../utils/command'

let models: DefinedModel[] = existsJson('data', 'models') ? readJson('data', 'models') : []

const hasModels: boolean = !!models.length

export const deleteModel = async () => {
  try {
    if (!hasModels)
      throw new Error(
        `Model does not exist. Please run "${pkgManagerName} model --create" to create the model.`,
      )

    let targetIds = process.argv.slice(3)

    if (!targetIds.length) {
      const { selectedTargetIds } = await prompt({
        type: 'checkbox',
        name: 'selectedTargetIds',
        message: 'Please select the model to edit',
        suffix: ':',
        choices: models.map(({ id }) => id),
        validate: (input) => {
          if (!input.length) {
            return 'Please select'
          } else {
            return true
          }
        },
      })

      targetIds = selectedTargetIds
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
      const targetModel = models.find(({ id }) => id === targetId)

      if (!targetModel) throw new Error(`${targetId} does not exist.`)

      models = models.filter(({ id }) => id !== targetId)
    }

    await writeModels(models)
  } catch (e) {
    console.error(red(e.message + '\n'))
  }
}
