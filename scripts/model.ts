import ora from 'ora'
import { openai } from '../libs/openai'

const fetch = async () => {
  const spinner = ora('Getting model for ChatGPT').start()

  try {
    const { data } = await openai.listModels()

    spinner.succeed('Got model')

    const models = data.data.map(({ id }) => id)
    const result = `\n${models
      .map((model, i) => `${(i + 1).toString().padStart(2, '0')}. ${model}`)
      .join('\n')}\n`

    console.log(result)
  } catch (e) {
    spinner.fail('An error occurred')

    console.error(e.message)
  } finally {
    spinner.stop()
  }
}

fetch()
