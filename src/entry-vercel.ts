import { handle } from 'hono/vercel'
import { createApp } from './app'
import { wrapTurso } from './db/adapter'
import { handleScheduled } from './scheduled'

function getTursoClient() {
  const { createClient } = require('@libsql/client')
  return createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
}

function getDb() {
  const client = getTursoClient()
  return wrapTurso(client)
}

const app = createApp(() => getDb())

export default handle(app)

export const GET = async (request: Request) => {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  await handleScheduled(getDb())
  return new Response('OK')
}
