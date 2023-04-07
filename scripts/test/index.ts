import ora from 'ora'
import { openai } from '../../libs/openai'
import { rl } from '../../libs/readline'
import dotenv from 'dotenv'
import { CreateChatCompletionRequest, ChatCompletionRequestMessage } from 'openai'
import { writeJson, readJson, existsJson } from '../../libs/json'
import { typingEffect } from '../../libs/utils'

dotenv.config()

const JSON_PARAMS: Omit<CreateChatCompletionRequest, 'messages' | 'model'> = existsJson(
  'parameters',
)
  ? readJson('parameters')
  : {}

delete JSON_PARAMS['messages']

const model = process.argv[2] ?? JSON_PARAMS['model']

const main = async () => {
  try {
    const messages: ChatCompletionRequestMessage[] = [
      { role: 'user', content: 'こんにちは' },
      { role: 'assistant', content: 'こんにちは' },
      { role: 'user', content: 'こんにちは' },
    ]

    const { data } = await openai.createChatCompletion({
      model,
      messages,
      temperature: 1,
      top_p: 1,
      presence_penalty: 0,
      frequency_penalty: 0,
      ...JSON_PARAMS,
    })
    // console.log(data)

    // const { data } = await openai.listModels()

    console.log(data.usage, data.choices[0])
  } catch (e) {
    console.log(e.message ?? e.response.data.error)
  }
}

main()
