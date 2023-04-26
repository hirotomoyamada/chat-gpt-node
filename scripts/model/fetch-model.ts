import { DefinedModel } from '../../types/openai'
import { pkgManagerName } from '../../utils/command'
import { existsJson, readJson } from '../../utils/json'
import { dim, cyan, red } from 'chalk'

let models: DefinedModel[] = existsJson('data', 'models') ? readJson('data', 'models') : []

const hasModels: boolean = !!models.length

export const fetchModel = () => {
  try {
    if (!hasModels)
      throw new Error(
        `Model does not exist. Please run "${pkgManagerName} model --create" to create the model.`,
      )

    const defaultModel = models.find(({ isDefault }) => isDefault)

    if (!defaultModel)
      throw new Error(
        `Default　Model does not exist. Please run "${pkgManagerName} model --select" to select the model.`,
      )

    const { id, parameters, promptTemplate = '' } = defaultModel

    console.log('Model that is currently set as the default.')

    console.log(dim('----------------------'))

    console.log(`name: ${cyan(id)}`)
    console.log(`model: ${cyan(parameters.model)}`)
    console.log(`max_tokens: ${cyan(parameters.max_tokens)}`)
    console.log(`temperature: ${cyan(parameters.temperature)}`)
    console.log(`top_p: ${cyan(parameters.top_p)}`)
    console.log(`presence_penalty: ${cyan(parameters.presence_penalty)}`)
    console.log(`frequency_penalty: ${cyan(parameters.frequency_penalty)}`)
    console.log(`prompt: ${promptTemplate ? '\n' + cyan(promptTemplate.trim()) : ''}`)

    console.log(dim('----------------------'))

    console.log('')
  } catch (e) {
    console.error(red(e.message + '\n'))
  }
}
