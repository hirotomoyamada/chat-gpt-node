import ora from 'ora'
import { openai } from '../../libs/openai'
import { red, green, dim } from 'chalk'
import { computedCommnad } from '../../utils/command'
import { existsJson, readJson } from '../../utils/json'
import { DefinedModel, InternalModel } from '../../types/model'

const defaultMessages = (models: string[]) =>
  `\n${models.map((model, i) => `${(i + 1).toString().padStart(2, '0')}. ${model}`).join('\n')}\n`

export const main = async () => {
  const command = computedCommnad(['internal', 'remote', 'parameters'])

  const spinner = ora(dim('Getting models for ChatGPT...')).start()

  try {
    let messages: string = ''

    if (command.internal) {
      const data: InternalModel[] = readJson('json', 'models')

      const models: string[] = data.map(({ id }) => id)

      messages = defaultMessages(models)
    } else if (command.remote) {
      const { data } = await openai.listModels()

      const models: string[] = data.data.map(({ id }) => id)

      messages = defaultMessages(models)
    } else {
      const data: DefinedModel[] = existsJson('data', 'models') ? readJson('data', 'models') : []

      if (data.length) {
        if (!command.parameters) {
          const models: string[] = data.map(({ id }) => id)

          messages = defaultMessages(models)
        } else {
        }
      } else {
        throw new Error(
          'Model does not exist. Please run "pnpm model --create" to create the model.',
        )
      }
    }

    spinner.succeed(green('Got models.'))

    console.log(messages)
  } catch (e) {
    spinner.fail(red('An error occurred.'))

    console.error('\n' + red(e.message) + '\n')
  } finally {
    spinner.stop()
  }
}

main()
