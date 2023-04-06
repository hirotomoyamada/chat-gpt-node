import { CreateChatCompletionRequest, ChatCompletionRequestMessage } from 'openai'
import { writeJson, readJson, existsJson, existsJsonDir } from '../libs/json'
import { rl } from '../libs/readline'
import { typingEffect } from '../libs/utils'
import ora from 'ora'
import { openai } from '../libs/openai'

const beforeMessages: ChatCompletionRequestMessage[] = existsJson('messages')
  ? readJson('messages')
  : []

let beforeSystemMessages: ChatCompletionRequestMessage[] = []
let beforeUserOrAssistantMessages: ChatCompletionRequestMessage[] = []

beforeMessages.forEach((message) => {
  if (message.role === 'system') {
    beforeSystemMessages = [...beforeSystemMessages, message]
  } else {
    beforeUserOrAssistantMessages = [...beforeUserOrAssistantMessages, message]
  }
})

const startMessagesReadline = async () => {
  const callback = (yOrN?: string) => {
    try {
      if (yOrN && yOrN !== 'y' && yOrN !== 'N')
        throw new Error('\nInput entered is other than y or N.')

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

              spinner.succeed(`Successfully configured the model.\n`)
            } catch (e) {
              spinner.fail(e.message ?? 'Failed to configure the model.')
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
          console.error(e.message)
        }
      })
    } catch (e) {
      console.error(e.message)
    }
  }

  if (existsJsonDir()) {
    rl.question('Do you want to overwrite and set the initial value? (y/N) ', callback)

    rl.write('N')
  } else {
    callback()
  }
}

const testingChat = async (parameters: Partial<CreateChatCompletionRequest>) => {
  const spinner = ora('Testing the chat...').start()

  try {
    const messages: ChatCompletionRequestMessage[] = [
      ...beforeSystemMessages,
      {
        role: 'user',
        content:
          'この言葉が届いたら、なにかおもしろいことを言って、最後に「成功した」みたいな言葉を発言すること',
      },
    ]

    parameters = {
      model: 'gpt-3.5-turbo',
      messages,
      ...parameters,
    }

    const { data } = await openai.createChatCompletion(parameters as CreateChatCompletionRequest)

    spinner.stop()

    const message = data.choices[0].message

    if (message) {
      await typingEffect(message.content.trim() + '\n\n')
    } else {
      await typingEffect('No response.' + '\n\n')
    }
  } catch (e) {
    spinner.fail(e.response.data.error.message ?? 'Failed to test chat.')
  }
}

const writeParameters = async (parameters: Partial<CreateChatCompletionRequest>) => {
  const spinner = ora('Initializing the model...\n').start()

  try {
    await writeJson('parameters', parameters)

    spinner.succeed(`Successfully configured the model.\n`)
  } catch (e) {
    spinner.fail(e.message ?? 'Failed to configure the model.\n')
  } finally {
    spinner.stop()
  }
}

const parametersReadline = async () => {
  let parameters: Partial<CreateChatCompletionRequest> = {}

  if (existsJson('parameters')) parameters = readJson('parameters')

  let max_tokens = parameters['max_tokens'] ?? 2048
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

  const max_tokens_query = `\n"max_tokens"${border}${max_tokens_desc}${border}current: ${max_tokens}${border}${setPrompt}`
  const temperature_query = `\n"temperature"${border}${temperature_desc}${border}current: ${temperature} (0 ~ 2)${border}${setPrompt}`
  const top_p_query = `\n"top_p"${border}${top_p_desc}${border}current: ${top_p} (0 ~ 1)${border}${setPrompt}`
  const presence_penalty_query = `\n"presence_penalty"${border}${presence_penalty_desc}${border}current: ${presence_penalty} (-2 ~ 2)${border}${setPrompt}`
  const frequency_penalty_query = `\n"frequency_penalty"${border}${frequency_penalty_desc}${border}current: ${frequency_penalty} (-2 ~ 2)${border}${setPrompt}`

  try {
    parameterQuestion(
      max_tokens_query,
      (n) => (max_tokens = parseInt(n ?? max_tokens)),
      () =>
        parameterQuestion(
          temperature_query,
          (n) => (temperature = parseInt(n ?? temperature)),
          () =>
            parameterQuestion(
              top_p_query,
              (n) => (top_p = parseInt(n ?? top_p)),
              () =>
                parameterQuestion(
                  presence_penalty_query,
                  (n) => (presence_penalty = parseInt(n ?? presence_penalty)),
                  () =>
                    parameterQuestion(
                      frequency_penalty_query,
                      (n) => (frequency_penalty = parseInt(n ?? frequency_penalty)),
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
    console.log(e.message)

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
      console.log(e.message)

      rl.close()
    }
  })
}

const main = async () => {
  const command = process.argv[2]

  try {
    if (command === '-p') {
      parametersReadline()
    } else {
      startMessagesReadline()
    }
  } catch (e) {
    console.error(e.message)
  }
}

main()
