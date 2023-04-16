import { computedCommnad, pkgManagerName } from '../../utils/command'
import { existsJson, readJson } from '../../utils/json'
import { DefinedModel } from '../../types/openai'
import { red } from 'chalk'
import { prompt } from '../../libs/inquirer'
import { createChat } from './create-chat'

const models: DefinedModel[] = existsJson('data', 'models') ? readJson('data', 'models') : []

const hasModels: boolean = !!models.length

let model = models.find(({ isDefault }) => isDefault)

const selectModel = async () => {
  const { targetId } = await prompt({
    type: 'list',
    name: 'targetId',
    message: 'Please select the model',
    suffix: ':',
    choices: models.map(({ id }) => id),
  })

  console.log('')

  return models.find(({ id }) => id === targetId)
}

const main = async () => {
  try {
    console.log('')

    const { select } = computedCommnad(['select'])

    const targetId = process.argv[2]

    if (hasModels) {
      if (select) {
        model = await selectModel()

        createChat(model)
      } else {
        if (targetId) {
          model = models.find(({ id }) => id === targetId)

          if (!model)
            throw new Error(
              `Model does not exist. Please run "${pkgManagerName} model --create" to create the model.`,
            )

          createChat(model)
        } else if (model) {
          createChat(model)
        } else {
          model = await selectModel()

          createChat(model)
        }
      }
    } else {
      throw new Error(
        `Model does not exist. Please run "${pkgManagerName} model --create" to create the model.`,
      )
    }
  } catch (e) {
    console.log(red(e.message + '\n'))
  }
}

main()
