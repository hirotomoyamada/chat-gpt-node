import { CreateChatCompletionRequest, Model } from 'openai'

export { Model } from 'openai'

export type DefinedModel = {
  id: string
  parameters: CreateChatCompletionRequest
  isDefault?: boolean
}

export type InternalModel = Pick<Model, 'id' | 'object'> & { max_tokens: number }
