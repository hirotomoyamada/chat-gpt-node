import dotenv from 'dotenv'
import { rl } from '../../libs/readline'
import { red } from 'chalk'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from 'langchain/prompts'
import { ConversationChain } from 'langchain/chains'
import { BufferWindowMemory, ChatMessageHistory } from 'langchain/memory'
import { CallbackManager } from 'langchain/callbacks'
import {
  AIChatMessage,
  HumanChatMessage,
  MessageType,
  SystemChatMessage,
  BaseChatMessage,
} from 'langchain/schema'
import { writeJson, existsJson, readJson } from '../../utils/json'
import { History } from '../../types/openai'

dotenv.config()

const history: History = existsJson('data', 'history') ? readJson('data', 'history') : []

const main = async () => {
  try {
    const messages: BaseChatMessage[] = []

    for (let message of history) {
      if (message.type === 'human') {
        messages.push(new HumanChatMessage(message.text))
      } else if (message.type === 'ai') {
        messages.push(new AIChatMessage(message.text))
      } else if (message.type === 'system') {
        messages.push(new SystemChatMessage(message.text))
      }
    }

    const chatHistory = new ChatMessageHistory(messages)

    const llm = new ChatOpenAI(
      {
        modelName: 'gpt-3.5-turbo',
        temperature: 0.7,
        topP: 0.9,
        presencePenalty: 1,
        frequencyPenalty: 1,
        streaming: true,
        callbackManager: CallbackManager.fromHandlers({
          handleLLMNewToken: async (token: string) => {
            process.stdout.write(token)
          },
        }),
      },
      { organization: process.env.OPENAI_ORGANIZATION, apiKey: process.env.OPENAI_API_KEY },
    )

    const prompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(
        'あなたの名前はジョンソンです。これから、あなたが発言する文章の語尾には「にゃん」とつけて発言すること。',
      ),
      new MessagesPlaceholder('history'),
      HumanMessagePromptTemplate.fromTemplate('{input}'),
    ])

    const memory = new BufferWindowMemory({
      returnMessages: true,
      memoryKey: 'history',
      chatHistory,
      k: 5,
    })

    const chain = new ConversationChain({ memory, prompt, llm })

    rl.setPrompt('> ')

    rl.prompt()

    rl.on('line', async (input) => {
      try {
        rl.pause()

        console.log('')

        const res = await chain.call({ input })

        const history: History = []

        for (let { _getType, text } of memory.chatHistory.messages) {
          history.push({
            type: _getType(),
            text: text,
          })
        }

        console.log('\n')

        rl.prompt()

        await writeJson('data', 'history')(history)
      } catch (e) {
        console.error(red(e))
      }
    })
  } catch (e) {
    console.log(red(e))
  }
}

main()
