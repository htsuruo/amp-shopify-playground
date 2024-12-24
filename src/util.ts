import { readFileSync } from 'fs'
import { join } from 'path'

export const loadTemplate = (templatePath: string): string => {
  return readFileSync(join(__dirname, templatePath), 'utf-8')
}

/**
 * 数値を千円単位でカンマ区切りにフォーマットする
 * @param price フォーマットする数値
 * @returns カンマ区切りの文字列（例: 1,000）
 */
export const formatPrice = (price: number): string => {
  return price.toLocaleString('ja-JP')
}
