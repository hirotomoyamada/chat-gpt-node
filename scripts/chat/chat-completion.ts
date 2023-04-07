import ora from 'ora'
import { openai } from '../../libs/openai'
import { CreateChatCompletionRequest, ChatCompletionRequestMessage } from 'openai'
import { writeJson, readJson, existsJson } from '../../libs/json'

let JSON_PARAMS: Omit<CreateChatCompletionRequest, 'messages' | 'model'> = {}

if (existsJson('parameters')) JSON_PARAMS = readJson('parameters')

delete JSON_PARAMS['messages']

const model = process.argv[2] ?? JSON_PARAMS['model']

export const chatCompletion = async (content: string) => {
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
