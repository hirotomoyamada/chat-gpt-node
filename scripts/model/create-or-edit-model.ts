import { existsJson, readJson } from '../../utils/json'
import { red, dim } from 'chalk'
import { DefinedModel } from '../../types/openai'
import { fetchModels } from './fetch-models'
import { prompt } from '../../libs/inquirer'
import { testingChat } from './testing-chat'
import { writeModels } from './write-models'
import { DistinctQuestion } from 'inquirer'
import { createPrompt } from './create-prompt'
import { pkgManagerName } from '../../utils/command'

let models: DefinedModel[] = existsJson('data', 'models') ? readJson('data', 'models') : []

const hasModels: boolean = !!models.length

export const createOrEditModel = async (isEdit: boolean, isPrompt: boolean) => {
  try {
    let model: DefinedModel | undefined = undefined

    if (isEdit || isPrompt) {
      if (!hasModels)
        throw new Error(
          `Model does not exist. Please run "${pkgManagerName} model --create" to create the model.`,
        )

      let targetId = process.argv[3]

      if (!targetId) {
        const { targetId: answerTargetId } = await prompt({
          type: 'list',
          name: 'targetId',
          message: 'Please select the model to edit',
          suffix: ':',
          choices: models.map(({ id }) => id),
        })

        targetId = answerTargetId

        console.log('')
      }

      const targetModel = models.find(({ id }) => id === targetId)

      if (!targetModel)
        throw new Error(
          `Model does not exist. Please run "${pkgManagerName} model --create" to create the model.`,
        )

      model = targetModel
    }

    if (!isPrompt) {
      const internalModels = await fetchModels()

      const getMaxTokens = (selectedId: string) =>
        internalModels.find(({ id }) => id === selectedId)?.maxTokens ?? 0

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
              if (input !== model?.id && models.some(({ id }) => id === input)) {
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

              const max_tokens = getMaxTokens(parameters.model)

              if (max_tokens < input) {
                return `The maximum value that can be entered is ${max_tokens}.`
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
          default: model?.parameters.temperature ?? 0.7,
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
          default: model?.parameters.top_p ?? 0.95,
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

      if (hasModels && !model?.isDefault) {
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
        default: !model || !!model.promptTemplate,
      })

      console.log(dim('----------------------'))

      if (isDefault) {
        models = models.map((rest) => ({ ...rest, isDefault: false }))
      } else {
        isDefault ??= !hasModels || model?.isDefault
      }

      if (hasPrompt) {
        const promptTemplate = await createPrompt(model?.promptTemplate)

        model = { id, parameters, isDefault, promptTemplate }
      } else {
        model = { id, parameters, isDefault }
      }

      await testingChat(model)
    } else {
      if (!model) return

      const promptTemplate = await createPrompt(model.promptTemplate)

      model.promptTemplate = promptTemplate

      await testingChat(model)
    }

    if (!isEdit && !isPrompt) {
      models = [...models, model]
    } else {
      models = models.map((existModel) => (existModel.id === model?.id ? model : existModel))
    }

    await writeModels(models)
  } catch (e) {
    console.error(red(e.message + '\n'))
  }
}
