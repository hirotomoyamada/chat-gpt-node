import { ChatCompletionRequestMessage } from 'openai'
import { writeJson, existsJsonDir, readJson, existsJson } from '../../libs/json'
import { rl } from '../../libs/readline'
import { typingEffect } from '../../libs/utils'
import ora from 'ora'
import { red, yellowBright, bold, green } from 'chalk'

export let beforeMessages: ChatCompletionRequestMessage[] = []

if (existsJson('messages')) beforeMessages = readJson('messages')

export let beforeSystemMessages: ChatCompletionRequestMessage[] = []
export let beforeUserOrAssistantMessages: ChatCompletionRequestMessage[] = []

beforeMessages.forEach((message) => {
  if (message.role === 'system') {
    beforeSystemMessages = [...beforeSystemMessages, message]
  } else {
    beforeUserOrAssistantMessages = [...beforeUserOrAssistantMessages, message]
  }
})

export const messagesReadline = async () => {
  const callback = (yOrN?: string) => {
    try {
      if (yOrN && yOrN !== 'y' && yOrN !== 'N')
        throw new Error('\nInput entered is other than y or N.\n')

      console.log(
        (yOrN ? '\n' : '') +
          "Please enter the initial value to set in the model.\n\nTo save, please type 'exit'. To discard changes, please press ctrl + c.\n",
      )

      rl.setPrompt('> ')

      rl.prompt()

      let currentSystemMessages: ChatCompletionRequestMessage[] = []

      rl.on('line', async (content) => {
        try {
          rl.pause()

          if (content === 'exit') {
            rl.close()

            console.log('')

            const spinner = ora('Initializing the model...').start()

            try {
              const messages: ChatCompletionRequestMessage[] =
                yOrN === 'y'
                  ? [...currentSystemMessages, ...beforeUserOrAssistantMessages]
                  : [
                      ...beforeSystemMessages,
                      ...currentSystemMessages,
                      ...beforeUserOrAssistantMessages,
                    ]

              await writeJson('messages', messages)

              spinner.succeed(green(`Successfully configured the model.\n`))
            } catch (e) {
              spinner.fail(red(e.message ?? 'Failed to configure the model.\n'))
            } finally {
              spinner.stop()
            }
          } else {
            currentSystemMessages = [...currentSystemMessages, { role: 'system', content }]

            await typingEffect('\n' + 'Set a value in the model.' + '\n\n')

            rl.prompt()

            rl.resume()
          }
        } catch (e) {
          console.error(red(e.message))

          rl.close()
        }
      })
    } catch (e) {
      console.error(red(e.message))

      rl.close()
    }
  }

  if (existsJsonDir()) {
    rl.question(
      bold(yellowBright('Do you want to overwrite and set the initial value? (y/N) ')),
      callback,
    )

    rl.write('N')
  } else {
    callback()
  }
}
