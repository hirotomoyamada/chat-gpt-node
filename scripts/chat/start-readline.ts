import { rl } from '../../libs/readline'
import { typingEffect } from '../../libs/utils'
import { chatCompletion } from './chat-completion'

export const startReadline = async () => {
  rl.setPrompt('> ')

  rl.on('line', async (req) => {
    rl.pause()

    const res = await chatCompletion(req)

    await typingEffect(res + '\n\n')

    rl.prompt()

    rl.resume()
  })
}
