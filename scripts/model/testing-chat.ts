import { typingEffect } from '../../utils/animation'
import ora from 'ora'
import { conversationChain } from '../../libs/openai'
import { red, green, dim } from 'chalk'
import { DefinedModel } from '../../types/openai'

export const testingChat = async ({ parameters, promptTemplate }: DefinedModel) => {
  const input = '「成功」の言葉を入れて、なにか面白いことを言ってください。'

  await typingEffect('> ' + input + '\n\n')

  const spinner = ora(dim('...')).start()

  const chain = conversationChain({
    parameters,
    promptTemplate,
    callbackManager: () => {
      spinner.stop()
    },
  })

  try {
    const { response } = await chain.call({ input })

    if (response) {
      console.log('\n')

      spinner.succeed(green('Successfully test the model.\n'))
    }
  } catch (e) {
    spinner.fail(red('Failed to test chat.\n'))

    throw new Error(e.response.data.error.message ?? e.message)
  }
}
