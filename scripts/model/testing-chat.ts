import { typingEffect } from '../../utils/animation'
import ora from 'ora'
import { createChatCompletion } from '../../libs/openai'
import { red, green, dim, cyan } from 'chalk'
import { DefinedModel } from '../../types/openai'
import { ChatCompletionRequestMessage } from 'openai'

export const testingChat = async ({ parameters, promptTemplate }: DefinedModel) => {
  const content = '「成功」の言葉を入れて、なにか面白いことを言ってください。'

  await typingEffect('> ' + content + '\n\n')

  let messages: ChatCompletionRequestMessage[] = []

  if (promptTemplate) messages = [{ role: 'system', content: promptTemplate }, ...messages]

  const spinner = ora(dim('...')).start()

  try {
    await createChatCompletion({
      content,
      parameters,
      messages,
      onStream: (token) => {
        spinner.stop()

        process.stdout.write(cyan(token))
      },
      onCompleted: () => {
        console.log('\n')

        spinner.succeed(green('Successfully test the model.\n'))
      },
    })
  } catch (e) {
    spinner.fail(red('Failed to test chat.\n'))

    throw new Error(e.response.data.error.message ?? e.message)
  }
}
