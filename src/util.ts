import { readFileSync } from 'fs'
import { join } from 'path'

export const loadTemplate = (templatePath: string): string => {
  return readFileSync(join(__dirname, templatePath), 'utf-8')
}
