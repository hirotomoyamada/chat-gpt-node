import { ChatOpenAI } from 'langchain/chat_models/openai'
import { MessageType } from 'langchain/schema'
import { CreateChatCompletionRequest } from 'openai'

export type ModelParameters = Omit<CreateChatCompletionRequest, 'messages'>

export type DefinedModel = {
  id: string
  parameters: ModelParameters
  isDefault: boolean
  promptTemplate?: string
}

export type InternalModel = {
  id: ChatOpenAI['modelName']
  maxTokens: ChatOpenAI['maxTokens']
}

export type HistoryMessage = { type: MessageType; text: string }
export type History = HistoryMessage[]
