import { CreateChatCompletionRequest } from 'openai'
import { writeJson, readJson, existsJson } from '../../libs/json'
import { rl } from '../../libs/readline'
import ora from 'ora'
import { testingChat } from './testing-chat'
import { red, yellowBright, bold, green, bgWhite } from 'chalk'

export const parametersReadline = async () => {
  let parameters: Partial<CreateChatCompletionRequest> = {}

  if (existsJson('parameters')) parameters = readJson('parameters')

  let max_tokens = parameters['max_tokens']
  let temperature = parameters['temperature'] ?? 1
  let top_p = parameters['top_p'] ?? 1
  let presence_penalty = parameters['presence_penalty'] ?? 0
  let frequency_penalty = parameters['frequency_penalty'] ?? 0

  console.log('Please enter the parameters.')

  const border = '\n-----------\n'
  const setPrompt = '> '

  const max_tokens_desc = `The maximum number of tokens to generate in the chat completion.\n\nThe total length of input tokens and generated tokens is limited by the model's context length.`
  const temperature_desc = `What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.\n\nWe generally recommend altering this or 'top_p' but not both.`
  const top_p_desc = `An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered.\n\nWe generally recommend altering this or 'temperature' but not both.`
  const presence_penalty_desc = `Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.`
  const frequency_penalty_desc = `Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.`

  const max_tokens_query = `\n${bold(
    'max_tokens',
  )}${border}${max_tokens_desc}${border}current: ${bold(
    yellowBright(max_tokens),
  )}${border}${setPrompt}`
  const temperature_query = `\n${bold(
    'temperature',
  )}${border}${temperature_desc}${border}current: ${bold(
    yellowBright(temperature),
  )} (0 ~ 2)${border}${setPrompt}`
  const top_p_query = `\n${bold('top_p')}${border}${top_p_desc}${border}current: ${bold(
    yellowBright(top_p),
  )} (0 ~ 1)${border}${setPrompt}`
  const presence_penalty_query = `\n${bold(
    'presence_penalty',
  )}${border}${presence_penalty_desc}${border}current: ${bold(
    yellowBright(presence_penalty),
  )} (-2 ~ 2)${border}${setPrompt}`
  const frequency_penalty_query = `\n${bold(
    'frequency_penalty',
  )}${border}${frequency_penalty_desc}${border}current: ${bold(
    yellowBright(frequency_penalty),
  )} (-2 ~ 2)${border}${setPrompt}`

  try {
    parameterQuestion(
      max_tokens_query,
      (n) => (max_tokens = n !== '-1' ? parseFloat(n ?? max_tokens) : undefined),
      () =>
        parameterQuestion(
          temperature_query,
          (n) => (temperature = parseFloat(n ?? temperature)),
          () =>
            parameterQuestion(
              top_p_query,
              (n) => (top_p = parseFloat(n ?? top_p)),
              () =>
                parameterQuestion(
                  presence_penalty_query,
                  (n) => (presence_penalty = parseFloat(n ?? presence_penalty)),
                  () =>
                    parameterQuestion(
                      frequency_penalty_query,
                      (n) => (frequency_penalty = parseFloat(n ?? frequency_penalty)),
                      async () => {
                        rl.close()

                        console.log('')

                        parameters = {
                          ...parameters,
                          max_tokens,
                          temperature,
                          top_p,
                          presence_penalty,
                          frequency_penalty,
                        }

                        await writeParameters(parameters)

                        await testingChat(parameters)
                      },
                    ),
                ),
            ),
        ),
    )
  } catch (e) {
    console.error(red(e.message))

    rl.close()
  }
}

const parameterQuestion = (query: string, insert?: (n: any) => void, callback?: Function) => {
  rl.question(query, (n: any) => {
    try {
      if (n == '' || !isNaN(n)) {
        insert?.(n || undefined)
      } else {
        throw new Error('\nPlease input a number value.\n')
      }

      callback?.()
    } catch (e) {
      console.error(red(e.message))

      rl.close()
    }
  })
}

const writeParameters = async (parameters: Partial<CreateChatCompletionRequest>) => {
  const spinner = ora('Initializing the model...\n').start()

  try {
    await writeJson('parameters', parameters)

    spinner.succeed(green(`Successfully configured the model.\n`))
  } catch (e) {
    spinner.fail(red(e.message ?? 'Failed to configure the model.\n'))
  } finally {
    spinner.stop()
  }
}
