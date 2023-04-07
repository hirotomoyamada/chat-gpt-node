import { rl } from '../../libs/readline'
import { CreateChatCompletionRequest } from 'openai'
import { writeJson, readJson, existsJson } from '../../libs/json'
import { startReadline } from './start-readline'
import { fetchModel } from './fetch-model'

const JSON_PARAMS: Omit<CreateChatCompletionRequest, 'messages' | 'model'> = existsJson(
  'parameters',
)
  ? readJson('parameters')
  : {}

delete JSON_PARAMS['messages']

const model = process.argv[2] ?? JSON_PARAMS['model']

const main = async () => {
  const isSuccessfully = await fetchModel()

  if (isSuccessfully) {
    if (!existsJson('messages')) writeJson('messages', [])

    startReadline()
  } else {
    rl.setPrompt('')
    rl.write(null, { ctrl: true, name: 'u' })
    rl.close()
  }
}

main()
