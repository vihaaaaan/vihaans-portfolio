import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'

const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'bucket-list.json')

function readData() {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'))
}

function writeData(data: any) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2))
}

async function checkAdmin() {
  const cookieStore = await cookies()
  return cookieStore.get('admin_session')?.value === 'true'
}

export async function GET() {
  return NextResponse.json(readData())
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const { name, location, date, description, link } = await request.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: 'name required' }, { status: 400 })
  }
  const data = readData()
  const newItem = {
    id: crypto.randomUUID(),
    name: name.trim(),
    location: location?.trim() || null,
    date: date || null,
    description: description?.trim() || null,
    link: link?.trim() || null,
    completed: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
  }
  data.items.push(newItem)
  writeData(data)
  return NextResponse.json(newItem)
}

export async function PATCH(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const body = await request.json()
  const data = readData()
  const item = data.items.find((i: any) => i.id === body.id)
  if (!item) return NextResponse.json({ error: 'not found' }, { status: 404 })

  // Toggle completed
  if ('completed' in body) {
    item.completed = body.completed
    item.completedAt = body.completed ? new Date().toISOString() : null
  }

  // Full edit
  if ('name' in body) {
    item.name = body.name.trim()
    item.location = body.location?.trim() || null
    item.date = body.date || null
    item.description = body.description?.trim() || null
    item.link = body.link?.trim() || null
  }

  writeData(data)
  return NextResponse.json(item)
}

export async function DELETE(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const data = readData()
  data.items = data.items.filter((i: any) => i.id !== id)
  writeData(data)
  return NextResponse.json({ ok: true })
}
