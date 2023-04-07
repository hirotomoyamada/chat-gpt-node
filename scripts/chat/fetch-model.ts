import ora from 'ora'
import { openai } from '../../libs/openai'
import { rl } from '../../libs/readline'
import { readJson, existsJson } from '../../libs/json'
import { CreateChatCompletionRequest } from 'openai'
import { red, green } from 'chalk'

let JSON_PARAMS: Omit<CreateChatCompletionRequest, 'messages' | 'model'> = {}

if (existsJson('parameters')) JSON_PARAMS = readJson('parameters')

const model = process.argv[2] ?? JSON_PARAMS['model']

export const fetchModel = async () => {
  rl.pause()

  const spinner = ora('Setting model for ChatGPT...').start()

  try {
    if (!model) throw new Error('Model is not specified.\n')

    await openai.retrieveModel(model)

    spinner.succeed(green(`Successfully configured the model.`) + `\n\nmodel: ${model}\n`)

    return true
  } catch (e) {
    spinner.fail(red(e.response?.data.error.message ?? 'Model does not exist.\n'))

    return false
  } finally {
    spinner.stop()

    rl.resume()
    rl.prompt()
  }
}
