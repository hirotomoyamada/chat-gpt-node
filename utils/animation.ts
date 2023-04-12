import { wait } from './sync'

export const typingEffect = async (text: string) => {
  for (const char of text) {
    process.stdout.write(char)

    let n = Math.floor(Math.random() * 26) + 50

    await wait(n)
  }
}
