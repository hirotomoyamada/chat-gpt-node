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

    const { id, parameters, promptTemplate = '', k } = defaultModel

    console.log('Model that is currently set as the default.')

    console.log(dim('----------------------'))

    console.log(`name: ${cyan(id)}`)
    console.log(`model: ${cyan(parameters.modelName)}`)
    console.log(`max_tokens: ${cyan(parameters.maxTokens)}`)
    console.log(`temperature: ${cyan(parameters.temperature)}`)
    console.log(`top_p: ${cyan(parameters.topP)}`)
    console.log(`presence_penalty: ${cyan(parameters.presencePenalty)}`)
    console.log(`frequency_penalty: ${cyan(parameters.frequencyPenalty)}`)
    console.log(`history_limit: ${cyan(k ?? '')}`)
    console.log(`prompt: ${promptTemplate ? '\n' + cyan(promptTemplate.trim()) : ''}`)

    console.log(dim('----------------------'))

    console.log('')
  } catch (e) {
    console.error(red(e.message + '\n'))
  }
}
