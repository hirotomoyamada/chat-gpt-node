import readline from 'readline'
import { red } from 'chalk'

export const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

export const questionSync = async (
  query: string,
  callback?: (value: string) => void | Promise<void>,
) =>
  new Promise((resolve) =>
    rl.question(query, async (value) => {
      try {
        await callback?.(value)

        resolve(value)
      } catch (e) {
        console.error('\n' + red(e.message) + '\n')

        rl.close()
      }
    }),
  )
