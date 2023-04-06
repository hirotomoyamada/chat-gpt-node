import { format, resolveConfig, BuiltInParserName } from 'prettier'

export const prettier = async (content: string, parser: BuiltInParserName = 'json') => {
  const prettierConfig = await resolveConfig(process.cwd())

  try {
    return format(content, {
      ...prettierConfig,
      parser,
    })
  } catch {
    return content
  }
}
