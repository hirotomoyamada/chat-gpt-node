import { DefinedModel } from '../../types/openai'
import { red, dim } from 'chalk'
import { verifyModel } from './verify-model'
import { conversationChain, computedChatHistory, saveChatHistory } from '../../libs/openai'
import * as readline from 'readline'
import ora from 'ora'

export const createChat = async (model: DefinedModel) => {
  try {
    const isSuccessfully = await verifyModel(model)

    if (!isSuccessfully) return

    const spinner = ora(dim('...'))

    const { id, parameters, k, promptTemplate } = model

    const chatHistory = computedChatHistory(id)

    const chain = conversationChain({
      parameters,
      k,
      promptTemplate,
      chatHistory,
      callbackManager: () => {
        spinner.stop()
      },
    })

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    rl.setPrompt('> ')

    rl.prompt()

    rl.on('line', async (input) => {
      console.log('')

      spinner.start()

      try {
        rl.pause()

        await chain.call({ input })

        console.log('\n')

        rl.prompt()

        await saveChatHistory(id, chain)
      } catch (e) {
        spinner.stop()

        console.error(red(e))
      }
    })
  } catch (e) {
    console.log(red(e.message + '\n'))
  }
}
