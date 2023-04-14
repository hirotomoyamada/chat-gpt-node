import { green } from 'chalk'
import { ChatCompletionRequestMessage } from 'openai'
import { prompt } from '../../libs/inquirer'
import * as readline from 'readline'

export const createPrompt = async (
  messages: ChatCompletionRequestMessage[] = [],
): Promise<ChatCompletionRequestMessage[]> =>
  new Promise(async (resolve) => {
    if (messages.length) {
      const { isOverwrite } = await prompt({
        type: 'confirm',
        name: 'isOverwrite',
        message: 'Would you like to overwrite the existing prompt?',
        default: false,
      })

      if (isOverwrite) messages = []

      console.log('')
    }

    console.log(
      'Please enter the prompt to be set for the model.\n\nTo save, please type "exit". To reset, please type "reset"\n',
    )

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    rl.setPrompt('> ')

    rl.prompt()

    let newMessages: ChatCompletionRequestMessage[] = []

    rl.on('line', async (content) => {
      rl.pause()

      if (content === 'exit') {
        console.log(green('\n✔ Prompt has been saved.\n'))

        rl.close()

        resolve([...messages, ...newMessages])
      } else if (content === 'reset') {
        newMessages = []

        console.log(green('\n✔ Prompt has been reset.\n'))

        rl.prompt()

        rl.resume()
      } else {
        newMessages = [...newMessages, { role: 'system', content }]

        console.log(green('\n✔ Prompt has been set.\n'))

        rl.prompt()

        rl.resume()
      }
    })
  })
