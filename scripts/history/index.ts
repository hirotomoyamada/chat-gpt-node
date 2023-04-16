import { prompt } from '../../libs/inquirer'
import { DefinedModel } from '../../types/openai'
import { computedCommnad, pkgManagerName } from '../../utils/command'
import { deleteJson, existsJson, readJson } from '../../utils/json'
import { red } from 'chalk'

const models: DefinedModel[] = existsJson('data', 'models') ? readJson('data', 'models') : []

const hasModels: boolean = !!models.length

const main = async () => {
  try {
    const command = computedCommnad(['all'])

    if (!hasModels)
      throw new Error(
        `Model does not exist. Please run "${pkgManagerName} model --create" to create the model.`,
      )

    if (command.all) {
      const { isConfirm } = await prompt({
        type: 'confirm',
        name: 'isConfirm',
        message: 'Are you sure you want to delete?',
        default: false,
      })

      console.log('')

      if (!isConfirm) return

      for (const { id } of models) {
        deleteJson('data', 'history', id)
      }
    } else {
      const { ids } = await prompt({
        type: 'checkbox',
        name: 'ids',
        message: 'Please select a model for deleting history.',
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

      const { isConfirm } = await prompt({
        type: 'confirm',
        name: 'isConfirm',
        message: 'Are you sure you want to delete?',
        default: false,
      })

      console.log('')

      if (!isConfirm) return

      for (const id of ids) {
        deleteJson('data', 'history', id)
      }
    }
  } catch (e) {
    console.error(red(e.message + '\n'))
  }
}

main()
