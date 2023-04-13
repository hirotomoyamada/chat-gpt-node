import { computedCommnad } from '../../utils/command'
import { fetchModel } from './fetch-model'
import { deleteModel } from './delete-model'
import { createOrEditModel } from './create-or-edit-model'

const main = async () => {
  const command = computedCommnad(['create', 'delete', 'edit', 'prompt'])

  if (command.create || command.edit || command.prompt) {
    createOrEditModel(command.edit, command.prompt)
  } else if (command.delete) {
    deleteModel()
  } else {
    fetchModel()
  }
}

main()
