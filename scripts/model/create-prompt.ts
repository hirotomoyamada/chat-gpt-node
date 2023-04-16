import { green } from 'chalk'
import { prompt } from '../../libs/inquirer'
import * as readline from 'readline'

export const createPrompt = async (promptTemplate: string = ''): Promise<string> =>
  new Promise(async (resolve) => {
    let isOverwrite = false

    if (promptTemplate) {
      const result = await prompt({
        type: 'confirm',
        name: 'isOverwrite',
        message: 'Would you like to overwrite the existing prompt?',
        default: false,
      })

      console.log('')

      isOverwrite = result.isOverwrite
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    console.log(
      'Please enter the prompt to be set for the model.\n\nTo save, please type "exit".\n',
    )

    rl.setPrompt('> ')

    if (isOverwrite) {
      promptTemplate = ''
    } else {
      const lines = promptTemplate.split('\n')

      lines.forEach((line, i) => {
        const isLast = i + 1 === lines.length

        if (!isLast || line) console.log('> ' + line)
      })
    }

    rl.prompt()

    rl.on('line', async (input) => {
      rl.pause()

      if (input === 'exit') {
        console.log(green('\n✔ Prompt has been saved.\n'))

        rl.close()

        resolve(promptTemplate)
      } else {
        promptTemplate += input + '\n'

        rl.prompt()

        rl.resume()
      }
    })
  })
