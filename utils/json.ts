import * as path from 'path'
import { writeFile, readFileSync, existsSync, mkdirSync, unlinkSync } from 'fs'
import { promisify } from 'util'
import { prettier } from '../libs/prettier'

const writeFileAsync = promisify(writeFile)

export const JSON_DIR_PATH = (...pathName: string[]) => path.join(process.cwd(), ...pathName)
export const JSON_FILE_PATH = (...pathName: string[]) =>
  path.join(process.cwd(), ...pathName.slice(0, -1), `${pathName[pathName.length - 1]}.json`)

export const existsJsonDir = (...pathName: string[]) => existsSync(JSON_DIR_PATH(...pathName))

export const writeJson =
  (...pathName: string[]) =>
  async (data: any): Promise<void> => {
    try {
      if (!existsJsonDir(...pathName.slice(0, -1)))
        mkdirSync(JSON_DIR_PATH(...pathName.slice(0, -1)))

      const formattedData = await prettier(JSON.stringify(data))

      await writeFileAsync(JSON_FILE_PATH(...pathName), formattedData, 'utf8')
    } catch (e) {
      throw new Error(e.message)
    }
  }

export const deleteJson = (...pathName: string[]) => {
  try {
    if (existsSync(JSON_FILE_PATH(...pathName))) {
      unlinkSync(JSON_FILE_PATH(...pathName))
    }
  } catch (e) {
    throw new Error(e.message)
  }
}

export const readJson = (...pathName: string[]): any => {
  try {
    return JSON.parse(readFileSync(JSON_FILE_PATH(...pathName), 'utf8'))
  } catch (e) {
    throw new Error(e.message)
  }
}

export const existsJson = (...pathName: string[]): boolean =>
  existsSync(JSON_FILE_PATH(...pathName))
