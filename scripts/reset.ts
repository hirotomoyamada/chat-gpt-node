import { ChatCompletionRequestMessage } from 'openai'
import { writeJson, readJson } from '../libs/json'
import ora from 'ora'

const main = async () => {
  const spinner = ora('Starting JSON reset...').start()

  const command = process.argv[2]

  try {
    if (command != null && command !== '-a') throw new Error('Not found command.\n')

    if (command === '-a') {
      await writeJson('messages', [])
    } else {
      let messages: ChatCompletionRequestMessage[] = readJson('messages')

      messages = messages.filter(({ role }) => role === 'system')

      await writeJson('messages', messages)
    }

    spinner.succeed(`Successfully reset JSON\n`)
  } catch (e) {
    spinner.fail(e.message ?? 'JSON reset failed\n')
  } finally {
    spinner.stop()
  }
}

main()
