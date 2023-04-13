import * as path from 'path'
import { writeFile, readFileSync, existsSync, mkdirSync } from 'fs'
import { promisify } from 'util'
import { prettier } from '../libs/prettier'

const writeFileAsync = promisify(writeFile)

export const JSON_DIR_PATH = (dirName: string) => path.join(process.cwd(), dirName)
export const JSON_FILE_PATH = (dirName: string, fileName: string) =>
  path.join(process.cwd(), dirName, `${fileName}.json`)

export const existsJsonDir = (dirName: string) => existsSync(JSON_DIR_PATH(dirName))

export const writeJson = async (dirName: string, fileName: string, data: any): Promise<void> => {
  try {
    if (!existsJsonDir(dirName)) mkdirSync(JSON_DIR_PATH(dirName))

    const formattedData = await prettier(JSON.stringify(data))

    await writeFileAsync(JSON_FILE_PATH(dirName, fileName), formattedData, 'utf8')
  } catch (e) {
    throw new Error(e.message)
  }
}

export const readJson = (dirName: string, fileName: string): any => {
  try {
    return JSON.parse(readFileSync(JSON_FILE_PATH(dirName, fileName), 'utf8'))
  } catch (e) {
    throw new Error(e.message)
  }
}

export const existsJson = (dirName: string, fileName: string): boolean =>
  existsSync(JSON_FILE_PATH(dirName, fileName))
