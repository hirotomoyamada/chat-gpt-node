import { DefinedModel } from '../../types/openai'
import { red, dim, cyan } from 'chalk'
import { verifyModel } from './verify-model'
import { computedMessages, createChatCompletion, getMessages, putMessages } from '../../libs/openai'
import * as readline from 'readline'
import ora from 'ora'

export const createChat = async (model: DefinedModel) => {
  try {
    const isSuccessfully = await verifyModel(model)

    if (!isSuccessfully) return

    const spinner = ora(dim('...'))

    const { id, parameters, promptTemplate } = model

    let messages = getMessages(id, 10)

    if (promptTemplate) messages = [{ role: 'system', content: promptTemplate }, ...messages]

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    rl.setPrompt('> ')

    rl.prompt()

    rl.on('line', async (content) => {
      if (content === 'c') {
        console.clear()

        rl.prompt()

        return
      }

      console.log('')

      spinner.start()

      try {
        rl.pause()

        await createChatCompletion({
          content,
          parameters,
          messages,
          onStream: (token) => {
            spinner.stop()

            process.stdout.write(cyan(token))
          },
          onCompleted: async (messages) => {
            const [, targetMessages] = computedMessages(messages)

            await putMessages(id, targetMessages)
          },
        })

        console.log('\n')

        rl.prompt()
      } catch (e: any) {
        spinner.stop()

        throw new Error(e.message)
      }
    })
  } catch (e) {
    console.log(red(e.message + '\n'))
  }
}
