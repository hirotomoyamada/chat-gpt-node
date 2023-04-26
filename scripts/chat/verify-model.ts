import ora from 'ora'
import { DefinedModel } from '../../types/openai'
import { openai } from '../../libs/openai'
import { red, green, dim } from 'chalk'

export const verifyModel = async ({ parameters }: DefinedModel) => {
  const spinner = ora('Setting model for ChatGPT...').start()

  const { model } = parameters

  try {
    await openai.retrieveModel(model)

    spinner.succeed(green(`Successfully configured the model.`) + dim(`\n\nmodel: ${model}\n`))

    return true
  } catch (e) {
    spinner.fail(red((e.response?.data.error.message ?? 'Model does not exist') + '\n'))

    return false
  } finally {
    spinner.stop()
  }
}
