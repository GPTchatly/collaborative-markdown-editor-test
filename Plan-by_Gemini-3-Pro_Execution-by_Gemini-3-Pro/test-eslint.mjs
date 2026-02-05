import { FlatCompat } from '@eslint/eslintrc'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

console.log('Testing FlatCompat in:', __dirname)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

try {
  console.log('Attempting to resolve next/core-web-vitals...')
  const config = compat.config({
    extends: ['next/core-web-vitals'],
  })
  console.log('Success:', Object.keys(config))
} catch (e) {
  console.error('Failed:', e)
}
