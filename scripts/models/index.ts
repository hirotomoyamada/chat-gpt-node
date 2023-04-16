import ora from 'ora'
import { openai } from '../../libs/openai'
import { red, green, dim, cyan, yellow } from 'chalk'
import { computedCommnad, pkgManagerName } from '../../utils/command'
import { existsJson, readJson } from '../../utils/json'
import { DefinedModel, InternalModel } from '../../types/openai'

const defaultResult = (models: string[]) =>
  `\n${models.map((model, i) => `${(i + 1).toString().padStart(2, '0')}. ${model}`).join('\n')}\n`

export const main = async () => {
  const command = computedCommnad(['internal', 'remote', 'parameters'])

  console.log('')

  const spinner = ora(dim('Getting models for ChatGPT...')).start()

  try {
    let result: string = ''

    if (command.internal) {
      const data: InternalModel[] = readJson('json', 'models')

      const models: string[] = data.map(({ id }) => id)

      result = defaultResult(models)
    } else if (command.remote) {
      const { data } = await openai.listModels()

      const models: string[] = data.data.map(({ id }) => id)

      result = defaultResult(models)
    } else {
      const data: DefinedModel[] = existsJson('data', 'models') ? readJson('data', 'models') : []

      if (data.length) {
        if (!command.parameters) {
          const models: string[] = data.map(
            ({ id, isDefault }) => id + (isDefault ? yellow(' (default)') : ''),
          )

          result = defaultResult(models)
        } else {
          const models = data.map(({ id, parameters, promptTemplate, k, isDefault }, i) => {
            let result = `\n${(i + 1).toString().padStart(2, '0')}. ${id} ${
              isDefault ? yellow('(default)') : ''
            }\n`

            result += `model: ${cyan(parameters.modelName)}\n`
            result += `max_tokens: ${cyan(parameters.maxTokens)}\n`
            result += `temperature: ${cyan(parameters.temperature)}\n`
            result += `top_p: ${cyan(parameters.topP)}\n`
            result += `presence_penalty: ${cyan(parameters.presencePenalty)}\n`
            result += `frequency_penalty: ${cyan(parameters.frequencyPenalty)}\n`
            result += `history_limit: ${cyan(k ?? '')}\n`
            result += `prompt: ${promptTemplate ? '\n' + cyan(promptTemplate.trim()) : ''}\n`

            return result
          })

          result = models.join('')
        }
      } else {
        throw new Error(
          `Model does not exist. Please run "${pkgManagerName} model --create" to create the model.`,
        )
      }
    }

    spinner.succeed(green('Got models.'))

    console.log(result)
  } catch (e) {
    spinner.fail(red('An error occurred.'))

    console.error('\n' + red(e.message) + '\n')
  } finally {
    spinner.stop()
  }
}

main()
