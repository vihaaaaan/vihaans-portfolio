import fs from 'node:fs'
import path from 'node:path'

const PROJECT_FILE = /\.(png|jpe?g|gif|webp|svg|mp4|webm|mov)$/i

export function getProjectImages(name: string): string[] {
  const folderName = name.trim().replace(/\s+/g, '-')
  if (!folderName || folderName !== path.basename(folderName)) return []

  const directory = path.join(process.cwd(), 'public', 'assets', 'projects', folderName)

  try {
    return fs.readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && PROJECT_FILE.test(entry.name))
      .map((entry) => entry.name)
      .sort()
      .map((file) => `/assets/projects/${folderName}/${file}`)
  } catch {
    return []
  }
}
