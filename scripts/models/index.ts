import ora from 'ora'
import { openai } from '../../libs/openai'
import { red } from 'chalk'
import { computedCommnad, readJson } from '../../utils'

const fetchModels = async () => {
  const { remote } = computedCommnad(['remote'])

  const spinner = ora('Getting models for ChatGPT').start()

  try {
    let models: string[] = []

    if (remote) {
      const { data } = await openai.listModels()

      models = data.data.map(({ id }) => id)
    } else {
      models = Object.keys(readJson('models'))
    }

    spinner.succeed('Got models')

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
