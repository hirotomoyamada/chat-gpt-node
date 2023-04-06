import * as path from 'path'
import { writeFile, readFileSync, existsSync, mkdirSync } from 'fs'
import { promisify } from 'util'
import { prettier } from './prettier'

const writeFileAsync = promisify(writeFile)

export const JSON_DIR_PATH = path.join(process.cwd(), 'json')
export const JSON_FILE_PATH = (name: string) => path.join(process.cwd(), 'json', `${name}.json`)

export const existsJsonDir = () => existsSync(JSON_DIR_PATH)

export const writeJson = async (name: string, data: any): Promise<void> => {
  try {
    if (!existsJsonDir()) mkdirSync(JSON_DIR_PATH)

    const formattedData = await prettier(JSON.stringify(data))

    await writeFileAsync(JSON_FILE_PATH(name), formattedData, 'utf8')
  } catch (e) {
    throw new Error(e.message)
  }
}

export const readJson = (name: string): any => {
  try {
    return JSON.parse(readFileSync(JSON_FILE_PATH(name), 'utf8'))
  } catch (e) {
    throw new Error(e.message)
  }
}
export const existsJson = (name: string): boolean => existsSync(JSON_FILE_PATH(name))
