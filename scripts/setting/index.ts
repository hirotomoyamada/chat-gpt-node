import { parametersReadline } from './parameters-readline'
import { messagesReadline } from './messages-readline'

const main = async () => {
  const command = process.argv[2]

  try {
    if (command === '-p') {
      parametersReadline()
    } else {
      messagesReadline()
    }
  } catch (e) {
    console.error(e.message)
  }
}

main()
