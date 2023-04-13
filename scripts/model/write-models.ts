import ora from 'ora'
import { DefinedModel } from '../../types/model'
import { writeJson } from '../../utils/json'
import { red, green, dim } from 'chalk'

export const writeModels = async (data: DefinedModel[]) => {
  const spinner = ora(dim('Initializing the model...\n')).start()

  try {
    await writeJson('data', 'models', data)

    spinner.succeed(green(`Successfully configured the model.\n`))
  } catch (e) {
    spinner.fail(red('Failed to configure the model.'))

    throw new Error(e.message)
  } finally {
    spinner.stop()
  }
}
