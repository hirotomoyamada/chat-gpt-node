import ora from 'ora'
import { openai } from '../../libs/openai'
import { red } from 'chalk'

const fetchModels = async () => {
  const spinner = ora('Getting models for ChatGPT').start()

  try {
    let models: string[] = []

    const { data } = await openai.listModels()

    spinner.succeed('Got models')

    models = data.data.map(({ id }) => id)

    const result = `\n${models
      .map((model, i) => `${(i + 1).toString().padStart(2, '0')}. ${model}`)
      .join('\n')}\n`

    console.log(result)
  } catch (e) {
    spinner.fail(red('An error occurred'))

    console.error(red(e.message))
  } finally {
    spinner.stop()
  }
}

fetchModels()