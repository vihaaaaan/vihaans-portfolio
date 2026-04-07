import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name') ?? ''
  const folderName = name.replace(/\s+/g, '-')
  const dir = path.join(process.cwd(), 'public', 'assets', 'projects', folderName)

  try {
    if (!fs.existsSync(dir)) return NextResponse.json({ images: [] })
    const files = fs
      .readdirSync(dir)
      .filter((f) => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(f))
      .sort()
      .map((f) => `/assets/projects/${folderName}/${f}`)
    return NextResponse.json({ images: files })
  } catch {
    return NextResponse.json({ images: [] })
  }
}
