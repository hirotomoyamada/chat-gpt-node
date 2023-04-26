import dotenv from 'dotenv'
import { existsJson, readJson, writeJson } from '../utils/json'
import {
  ChatCompletionRequestMessage,
  Configuration,
  ConfigurationParameters,
  CreateChatCompletionRequest,
  CreateChatCompletionResponse,
  OpenAIApi,
} from 'openai'
import { IncomingMessage } from 'http'
import { ModelParameters } from '../types/openai'

dotenv.config()

export const configuration: ConfigurationParameters = {
  organization: process.env.OPENAI_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY,
}

export const openai = new OpenAIApi(new Configuration(configuration))

export const createChatCompletion = async ({
  content,
  parameters,
  messages,
  onStream,
  onCompleted,
}: {
  content: string
  parameters: ModelParameters
  messages: ChatCompletionRequestMessage[]
  onStream?: (token: string) => void
  onCompleted?: (messages: ChatCompletionRequestMessage[]) => void | Promise<void>
}) => {
  const userMessage: ChatCompletionRequestMessage = { role: 'user', content }

  messages.push(userMessage)

  try {
    const { data } = await recursivelyCreateChatCompletion(parameters, messages)

    const assistantMessage: ChatCompletionRequestMessage = { role: 'assistant', content: '' }

    for await (let chunk of data as unknown as IncomingMessage) {
      chunk = chunk.toString('utf8').split('\n')

      chunk = chunk.filter((line: string) => line.trim().startsWith('data: '))

      for (let data of chunk) {
        data = data.replace(/^data: /, '')

        if (data === '[DONE]') break

        const { choices } = JSON.parse(data)

        const token: string | undefined = choices[0].delta.content

        if (token) {
          assistantMessage.content += token

          onStream?.(token)
        }
      }
    }

    messages.push(assistantMessage)

    await onCompleted?.([userMessage, assistantMessage])
  } catch (e) {
    console.log(e.response)
  }
}

const recursivelyCreateChatCompletion = async (
  parameters: ModelParameters,
  messages: ChatCompletionRequestMessage[],
  k = 10,
): Promise<{ data: CreateChatCompletionResponse }> => {
  if (k < 0) k = 0

  let [systemMessages, otherMessages] = computedMessages(messages)

  otherMessages = otherMessages.slice(-1 * k)

  messages = [...systemMessages, ...otherMessages]

  try {
    const { data } = await openai.createChatCompletion(
      { ...parameters, messages, stream: true },
      { responseType: 'stream' },
    )

    return { data }
  } catch (e: any) {
    if (otherMessages.length) {
      return await recursivelyCreateChatCompletion(parameters, messages, k - 1)
    } else {
      throw new Error(e.message)
    }
  }
}

export const computedMessages = (messages: ChatCompletionRequestMessage[]) => {
  let systemMessages: ChatCompletionRequestMessage[] = []
  let otherMessages: ChatCompletionRequestMessage[] = []

  messages.forEach((message) => {
    if (message.role === 'system') {
      systemMessages = [...systemMessages, message]
    } else {
      otherMessages = [...otherMessages, message]
    }
  })

  return [systemMessages, otherMessages]
}

export const getMessages = (id: string, k?: number): ChatCompletionRequestMessage[] => {
  let messages: ChatCompletionRequestMessage[] = existsJson('data', 'history', id)
    ? readJson('data', 'history', id)
    : []

  if (typeof k === 'number') messages = messages.slice(-1 * k)

  return messages
}

export const putMessages = async (
  id: string,
  messages: ChatCompletionRequestMessage[],
): Promise<void> => {
  await writeJson('data', 'history', id)([...getMessages(id), ...messages])
}
