import { ChatCompletionRequestMessage } from 'openai'
import { writeJson, readJson } from '../../libs/json'
import ora from 'ora'
import { rl } from '../../libs/readline'
import { red, yellowBright, bold, green } from 'chalk'

const main = async () => {
  const command = process.argv[2]

  try {
    if (command != null && command !== '-a') throw new Error('Not found command.\n')

    rl.question(
      bold(yellowBright('Are you sure you want to reset? (y/N) ')),
      async (yOrN: string) => {
        console.log('')

        try {
          if (yOrN !== 'y' && yOrN !== 'N') throw new Error('Input entered is other than y or N.\n')

          const spinner = ora('Starting JSON reset...').start()

          try {
            if (command === '-a') {
              await writeJson('messages', [])
            } else {
              let messages: ChatCompletionRequestMessage[] = readJson('messages')

              messages = messages.filter(({ role }) => role === 'system')

              await writeJson('messages', messages)
            }

            spinner.succeed(green(`Successfully reset JSON\n`))
          } catch (e) {
            spinner.fail(red(e.message ?? 'JSON reset failed\n'))
          } finally {
            spinner.stop()
          }
        } catch (e) {
          console.error(red(e.message ?? 'JSON reset failed\n'))
        }
      },
    )
  } catch (e) {
    console.error(red(e.message ?? 'JSON reset failed\n'))
  }
}

main()
