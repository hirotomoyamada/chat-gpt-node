import { prompt } from '../../libs/inquirer'
import { DefinedModel } from '../../types/openai'
import { pkgManagerName } from '../../utils/command'
import { existsJson, readJson } from '../../utils/json'
import { red } from 'chalk'
import { writeModels } from './write-models'

let definedModels: DefinedModel[] = existsJson('data', 'models') ? readJson('data', 'models') : []

const hasDefinedModels: boolean = !!definedModels.length

const defaultModel = definedModels.find(({ isDefault }) => isDefault)

export const selectModel = async () => {
  try {
    if (!hasDefinedModels)
      throw new Error(
        `Model does not exist. Please run "${pkgManagerName} model --create" to create the model.`,
      )

    let targetId = process.argv[3]

    if (!targetId) {
      const { selectedTargetId } = await prompt({
        type: 'list',
        name: 'selectedTargetId',
        message: 'Please select a default model to set.',
        suffix: ':',
        default: defaultModel?.id,
        choices: definedModels.map(({ id }) => id),
      })

      targetId = selectedTargetId
    }

    console.log('')

    definedModels = definedModels.map((rest) => ({ ...rest, isDefault: rest.id === targetId }))

    await writeModels(definedModels)
  } catch (e) {
    console.error(red(e.message + '\n'))
  }
}
