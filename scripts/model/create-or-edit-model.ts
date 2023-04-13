import { existsJson, readJson } from '../../utils/json'
import { red, dim } from 'chalk'
import { DefinedModel } from '../../types/model'
import { fetchModels } from './fetch-models'
import { prompt } from '../../libs/inquirer'
import { testingChat } from './testing-chat'
import { writeModels } from './write-models'
import { DistinctQuestion } from 'inquirer'
import { createPrompt } from './create-prompt'

let definedModels: DefinedModel[] = existsJson('data', 'models') ? readJson('data', 'models') : []

const hasDefinedModels: boolean = !!definedModels.length

export const createOrEditModel = async (isEdit: boolean, isPrompt: boolean) => {
  try {
    let model: DefinedModel | undefined = undefined

    if (isEdit || isPrompt) {
      if (!hasDefinedModels)
        throw new Error(
          'Model does not exist. Please run "pnpm model --create" to create the model.',
        )

      let targetId = process.argv[3]

      if (!targetId) {
        const { targetId: answerTargetId } = await prompt({
          type: 'list',
          name: 'targetId',
          message: 'Please select the model to edit',
          suffix: ':',
          choices: definedModels.map(({ id }) => id),
        })

        targetId = answerTargetId

        console.log('')
      }

      const targetModel = definedModels.find(({ id }) => id === targetId)

      if (!targetModel)
        throw new Error(
          'Model does not exist. Please run "pnpm model --create" to create the model.',
        )

      model = targetModel
    }

    if (!isPrompt) {
      const internalModels = await fetchModels()

      const getMaxTokens = (selectedModelName: string) =>
        internalModels.find(({ id }) => id === selectedModelName)?.max_tokens ?? 0

      console.log('\nPlease enter the model name and parameters.\n')

      let questions: DistinctQuestion<any>[] = [
        {
          type: 'input',
          name: 'id',
          message: 'name',
          suffix: ':',
          default: model?.id,
          validate: (input) => {
            if (!input) {
              return red('name is required.')
            } else {
              if (input !== model?.id && definedModels.some(({ id }) => id === input)) {
                return red(`${input} is duplicated.`)
              } else {
                return true
              }
            }
          },
        },
        {
          type: 'list',
          name: 'parameters.model',
          message: 'model',
          suffix: ':',
          default: model?.parameters.model,
          choices: internalModels.map(({ id }) => id),
        },
        {
          type: 'input',
          name: 'parameters.max_tokens',
          message: ({ parameters }) =>
            `max_tokens ${dim(`(min: 1, max: ${getMaxTokens(parameters.model)})`)}`,
          suffix: ':',
          default: ({ parameters }) =>
            model?.parameters.max_tokens ?? getMaxTokens(parameters.model) / 4,
          validate: (input, { parameters }) => {
            input = parseFloat(input)

            if (isNaN(input)) {
              return 'Please input a number value.'
            } else {
              if (input < 1) return 'Please enter a value greater than or equal to 1.'

              const maxTokens = getMaxTokens(parameters.model)

              if (maxTokens < input) {
                return `The maximum value that can be entered is ${maxTokens}.`
              } else {
                return true
              }
            }
          },
        },
        {
          type: 'input',
          name: 'parameters.temperature',
          message: `temperature ${dim(`(min: 0, max: 2)`)}`,
          suffix: ':',
          default: model?.parameters.temperature ?? 1,
          validate: (input) => {
            input = parseFloat(input)

            if (isNaN(input)) {
              return 'Please input a number value.'
            } else {
              if (input < 0) return 'Please enter a value greater than or equal to 0.'

              if (2 < input) return 'Please enter a value that is 2 or less.'

              return true
            }
          },
        },
        {
          type: 'input',
          name: 'parameters.top_p',
          message: `top_p ${dim(`(min: 0, max: 1)`)}`,
          suffix: ':',
          default: model?.parameters.top_p ?? 1,
          validate: (input) => {
            input = parseFloat(input)

            if (isNaN(input)) {
              return 'Please input a number value.'
            } else {
              if (input < 0) return 'Please enter a value greater than or equal to 0.'

              if (1 < input) return 'Please enter a value that is 1 or less.'

              return true
            }
          },
        },
        {
          type: 'input',
          name: 'parameters.presence_penalty',
          message: `presence_penalty ${dim(`(min: -2, max: 2)`)}`,
          suffix: ':',
          default: model?.parameters.presence_penalty ?? 0,
          validate: (input) => {
            input = parseFloat(input)

            if (isNaN(input)) {
              return 'Please input a number value.'
            } else {
              if (input < -2) return 'Please enter a value greater than or equal to -2.'

              if (2 < input) return 'Please enter a value that is 2 or less.'

              return true
            }
          },
        },
        {
          type: 'input',
          name: 'parameters.frequency_penalty',
          message: `frequency_penalty ${dim(`(min: -2, max: 2)`)}`,
          suffix: ':',
          default: model?.parameters.frequency_penalty ?? 0,
          validate: (input) => {
            input = parseFloat(input)

            if (isNaN(input)) {
              return 'Please input a number value.'
            } else {
              if (input < -2) return 'Please enter a value greater than or equal to -2.'

              if (2 < input) return 'Please enter a value that is 2 or less.'

              return true
            }
          },
        },
      ]

      if (hasDefinedModels && !model?.isDefault) {
        questions = [
          ...questions,
          {
            type: 'confirm',
            name: 'isDefault',
            message: 'Would you like to set this model as the default?',
            default: false,
          },
        ]
      }

      let { id, parameters, isDefault } = await prompt(questions)

      console.log(dim('----------------------'))

      const { hasPrompt } = await prompt({
        type: 'confirm',
        name: 'hasPrompt',
        message: 'Would you like to add a prompt to this model?',
        default: true,
      })

      console.log(dim('----------------------'))

      if (hasPrompt) {
        const messages = await createPrompt(model?.parameters.messages)

        parameters = { ...parameters, messages }
      } else {
        parameters = { ...parameters, messages: [] }
      }

      await testingChat(parameters)

      if (isDefault) {
        definedModels = definedModels.map((rest) => ({ ...rest, isDefault: false }))
      } else {
        isDefault ??= !hasDefinedModels || model?.isDefault
      }

      model = { id, parameters, isDefault }
    } else {
      if (!model) return

      const messages = await createPrompt(model.parameters.messages)

      model.parameters = { ...model.parameters, messages }

      await testingChat(model.parameters)
    }

    if (!isEdit && !isPrompt) {
      definedModels = [...definedModels, model]
    } else {
      definedModels = definedModels.map((definedModel) =>
        definedModel.id === model?.id ? model : definedModel,
      )
    }

    await writeModels(definedModels)
  } catch (e) {
    console.error(red(e.message + '\n'))
  }
}
