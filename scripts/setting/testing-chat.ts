import { CreateChatCompletionRequest, ChatCompletionRequestMessage } from 'openai'
import { typingEffect } from '../../libs/utils'
import ora from 'ora'
import { openai } from '../../libs/openai'
import { beforeSystemMessages } from './messages-readline'
import { red } from 'chalk'

export const testingChat = async (parameters: Partial<CreateChatCompletionRequest>) => {
  const spinner = ora('Testing the chat...').start()

  try {
    const messages: ChatCompletionRequestMessage[] = [
      ...beforeSystemMessages,
      {
        role: 'user',
        content:
          'この言葉が届いたら、なにかおもしろいことを言って、最後に「成功した」みたいな言葉を発言すること',
      },
    ]

    parameters = {
      model: 'gpt-3.5-turbo',
      messages,
      ...parameters,
    }

    const { data } = await openai.createChatCompletion(parameters as CreateChatCompletionRequest)

    spinner.stop()

    const message = data.choices[0].message

    if (message) {
      await typingEffect(message.content.trim() + '\n\n')
    } else {
      await typingEffect('No response.' + '\n\n')
    }
  } catch (e) {
    spinner.fail(red(e.response.data.error.message ?? 'Failed to test chat.'))
  }
}
