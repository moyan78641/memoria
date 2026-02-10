import { createApp } from './app'
import { wrapD1 } from './db/adapter'
import { handleScheduled } from './scheduled'

type CfEnv = {
  DB: D1Database
  ASSETS: Fetcher
}

export default {
  async fetch(request: Request, env: CfEnv, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    // API 请求走 Hono
    if (url.pathname.startsWith('/api')) {
      const db = wrapD1(env.DB)
      const app = createApp(() => db)
      return app.fetch(request, env, ctx)
    }

    // 非 API 请求交给 ASSETS binding 处理
    // not_found_handling = "single-page-application" 会自动 fallback 到 index.html
    return env.ASSETS.fetch(request)
  },

  async scheduled(event: ScheduledEvent, env: CfEnv, ctx: ExecutionContext) {
    const db = wrapD1(env.DB)
    ctx.waitUntil(handleScheduled(db))
  },
}
