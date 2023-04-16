import ora from 'ora'
import { InternalModel } from '../../types/openai'
import { readJson } from '../../utils/json'
import { red, green, dim } from 'chalk'
import { openai } from '../../libs/openai'

export const fetchModels = async () => {
  const spinner = ora(dim('Getting models for ChatGPT...')).start()

  let internalModels: InternalModel[] = readJson('json', 'models')

  try {
    const { data } = await openai.listModels()

    const remoteModels: string[] = data.data.map(({ id }) => id)

    internalModels = internalModels.filter(({ id }) => remoteModels.includes(id))

    spinner.succeed(green('Got models.'))

    return internalModels
  } catch (e) {
    spinner.fail(red('An error occurred.'))

    throw new Error('\n' + (e.response.data.error.message ?? e.message))
  } finally {
    spinner.stop()
  }
}
