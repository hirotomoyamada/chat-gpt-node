import { CreateChatCompletionRequest, ChatCompletionRequestMessage } from 'openai'
import { typingEffect } from '../../utils/animation'
import ora from 'ora'
import { openai } from '../../libs/openai'
import { red, green, dim } from 'chalk'

export const testingChat = async (parameters: CreateChatCompletionRequest) => {
  const content = '> 「成功」の言葉を入れて、なにか面白いことを言ってください。'

  await typingEffect(content + '\n\n')

  const spinner = ora(dim('...')).start()

  try {
    const messages: ChatCompletionRequestMessage[] = [
      ...parameters.messages,
      { role: 'user', content },
    ]

    parameters = {
      ...parameters,
      messages,
    }

    const { data } = await openai.createChatCompletion(parameters)

    spinner.stop()

    const message = data.choices[0].message

    if (message) {
      await typingEffect(message.content.trim() + '\n\n')

      spinner.succeed(green('Successfully test the model.\n'))
    } else {
      throw new Error('No response.')
    }
  } catch (e) {
    spinner.fail(red('Failed to test chat.\n'))

    throw new Error(e.response.data.error.message ?? e.message)
  }
}
