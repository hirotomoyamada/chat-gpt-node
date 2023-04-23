import dotenv from 'dotenv'
import { existsJson, readJson, writeJson } from '../utils/json'
import { BufferWindowMemory, ChatMessageHistory } from 'langchain/memory'
import {
  AIChatMessage,
  BaseChatMessage,
  HumanChatMessage,
  SystemChatMessage,
} from 'langchain/schema'
import { History, ModelParameters } from '../types/openai'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { CallbackManager } from 'langchain/callbacks'
import { ConversationChain } from 'langchain/chains'
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from 'langchain/prompts'
import { Configuration, ConfigurationParameters, OpenAIApi } from 'openai'

dotenv.config()

export const configuration: ConfigurationParameters = {
  organization: process.env.OPENAI_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY,
}

export const openai = new OpenAIApi(new Configuration(configuration))

export const conversationChain = ({
  parameters,
  k,
  promptTemplate,
  chatHistory,
  callbackManager,
}: {
  parameters?: ModelParameters
  promptTemplate?: string
  k?: number
  chatHistory?: ChatMessageHistory
  callbackManager?: (token: string) => void
}): ConversationChain => {
  const llm = new ChatOpenAI(
    {
      ...parameters,
      streaming: true,
      callbackManager: CallbackManager.fromHandlers({
        handleLLMNewToken: async (token: string) => {
          process.stdout.write(token)

          callbackManager?.(token)
        },
      }),
    },
    configuration,
  )

  const prompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(promptTemplate ?? ''),
    new MessagesPlaceholder('history'),
    HumanMessagePromptTemplate.fromTemplate('{input}'),
  ])

  const memory = new BufferWindowMemory({
    returnMessages: true,
    memoryKey: 'history',
    chatHistory,
    k,
  })

  return new ConversationChain({ memory, prompt, llm })
}

export const computedChatHistory = (id: string): ChatMessageHistory => {
  const history: History = existsJson('data', 'history', id) ? readJson('data', 'history', id) : []

  let chatMessages: BaseChatMessage[] = []

  for (const { type, text } of history) {
    if (type === 'human') {
      chatMessages = [...chatMessages, new HumanChatMessage(text)]
    } else if (type === 'ai') {
      chatMessages = [...chatMessages, new AIChatMessage(text)]
    } else if (type === 'system') {
      chatMessages = [...chatMessages, new SystemChatMessage(text)]
    }
  }

  return new ChatMessageHistory(chatMessages)
}

export const saveChatHistory = async (id: string, chain: ConversationChain): Promise<void> => {
  let history: History = []

  const { messages } = (chain.memory as BufferWindowMemory).chatHistory

  for (const { _getType, text } of messages) {
    history = [...history, { type: _getType(), text }]
  }

  await writeJson('data', 'history', id)(history)
}
