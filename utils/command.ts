export const computedCommnad = (commands: string[]): Record<string, boolean> => {
  let args = process.argv.slice(2)

  args = args.reduce((prev, current) => {
    const [, value] = current.match(/^-([^\-]*)/) ?? []

    if (value) {
      if (1 < value.length) {
        const results = value
          .split('')
          .map((v) => findCommand(commands)(v))
          .filter(Boolean) as string[]

        prev = [...prev, ...results]
      } else {
        const result = findCommand(commands)(value)

        if (result) prev = [...prev, result]
      }
    } else {
      current = current.replace(/^--/, '')

      prev = [...prev, current]
    }

    return prev
  }, [] as string[])

  return commands.reduce((prev, current) => {
    prev[current] = false

    if (args.includes(current)) prev[current] = true

    return prev
  }, {} as Record<string, boolean>)
}

export const findCommand = (commands: string[]) => (value: string) =>
  commands.find((command) => command.startsWith(value))
