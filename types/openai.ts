import { ChatOpenAI } from 'langchain/chat_models/openai'
import { MessageType } from 'langchain/schema'

export type ModelParameters = {
  modelName: ChatOpenAI['modelName']
  temperature: ChatOpenAI['temperature']
  topP: ChatOpenAI['topP']
  presencePenalty: ChatOpenAI['presencePenalty']
  frequencyPenalty: ChatOpenAI['frequencyPenalty']
  maxTokens?: ChatOpenAI['maxTokens']
}

export type DefinedModel = {
  id: string
  parameters: ModelParameters
  isDefault: boolean
  k?: number
  promptTemplate?: string
}

export type InternalModel = {
  id: ChatOpenAI['modelName']
  maxTokens: ChatOpenAI['maxTokens']
}

export type HistoryMessage = { type: MessageType; text: string }
export type History = HistoryMessage[]
