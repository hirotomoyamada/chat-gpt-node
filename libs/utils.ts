export const typingEffect = async (text: string) => {
  for (const char of text) {
    process.stdout.write(char)

    let n = Math.floor(Math.random() * 26) + 50

    await wait(n)
  }
}

export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
