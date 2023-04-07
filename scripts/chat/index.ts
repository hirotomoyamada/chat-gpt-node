import { rl } from '../../libs/readline'
import { writeJson, existsJson } from '../../libs/json'
import { startReadline } from './start-readline'
import { fetchModel } from './fetch-model'

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
