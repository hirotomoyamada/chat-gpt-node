import { computedCommnad } from '../../utils/command'
import { fetchModel } from './fetch-model'
import { deleteModel } from './delete-model'
import { createOrEditModel } from './create-or-edit-model'
import { selectModel } from './select-model'

const main = async () => {
  const command = computedCommnad(['create', 'delete', 'edit', 'prompt', 'select'])

  if (command.create || command.edit || command.prompt) {
    createOrEditModel(command.edit, command.prompt)
  } else if (command.delete) {
    deleteModel()
  } else if (command.select) {
    selectModel()
  } else {
    fetchModel()
  }
}

main()
