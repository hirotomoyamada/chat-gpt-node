import ora from 'ora'
import { openai } from '../libs/openai'
import { rl } from '../libs/readline'
import dotenv from 'dotenv'
import { CreateChatCompletionRequest, ChatCompletionRequestMessage } from 'openai'
import { writeJson, readJson, existsJson } from '../libs/json'
import { typingEffect } from '../libs/utils'

dotenv.config()

const JSON_PARAMS: Omit<CreateChatCompletionRequest, 'messages' | 'model'> = existsJson(
  'parameters',
)
  ? readJson('parameters')
  : {}

delete JSON_PARAMS['messages']

const model = process.argv[2] ?? JSON_PARAMS['model']

const startReadline = async () => {
  rl.setPrompt('> ')

  rl.on('line', async (req) => {
    rl.pause()

    const res = await chatCompletion(req)

    await typingEffect(res + '\n\n')

    rl.prompt()

    rl.resume()
  })
}

const chatCompletion = async (content: string) => {
  console.log('')

  const spinner = ora('...').start()

  let messages: ChatCompletionRequestMessage[] = readJson('messages')

  try {
    messages = [...messages, { role: 'user', content }]

    const parameters: CreateChatCompletionRequest = {
      model,
      messages,
      temperature: 1,
      top_p: 1,
      presence_penalty: 0,
      frequency_penalty: 0,
      ...JSON_PARAMS,
    }

    const { data } = await openai.createChatCompletion(parameters)

    const message = data.choices[0].message

    spinner.stop()

    if (message) {
      messages = [...messages, message]

      return message.content.trim()
    } else {
      return 'No response.'
    }
  } catch (e) {
    spinner.stop()

    return e.response.data.error.message
  } finally {
    await writeJson('messages', messages)
  }
}

const fetchModel = async () => {
  rl.pause()

  const spinner = ora('Setting model for ChatGPT...').start()

  try {
    if (!model) throw new Error('Model is not specified.\n')

    await openai.retrieveModel(model)

    spinner.succeed(`Successfully configured the model.\n\nmodel: ${model}\n`)

    return true
  } catch (e) {
    spinner.fail(e.response?.data.error.message ?? 'Model does not exist.\n')

    return false
  } finally {
    spinner.stop()

    rl.resume()
    rl.prompt()
  }
}

const main = async () => {
  const isSuccessfully = await fetchModel()

  if (isSuccessfully) {
    if (!existsJson('messages')) writeJson('messages', [])

    startReadline()
  } else {
    rl.setPrompt('')
    rl.write(null, { ctrl: true, name: 'u' })
    rl.close()
  }
}

main()
