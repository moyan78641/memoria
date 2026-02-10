# MemorialHub Edge

个人 / 家庭纪念日管理工具，支持农历、节气、传统节日，到期自动提醒。

前后端一体，零成本部署到 Cloudflare Workers 或 Vercel。

## 一键部署

### Cloudflare Workers（推荐）

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/moyan78641/memorial-hub)

点击按钮后，Cloudflare 会自动创建 D1 数据库并部署。首次访问进入初始化页面，设置密码即可使用。

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/moyan78641/memorial-hub)

## 功能特性

- 📅 农历 / 公历纪念日管理
- 🌙 二十四节气 & 传统节日自动生成
- 🔔 邮件 / Telegram 到期提醒
- 📊 数据统计与日历视图
- 🔒 单用户密码认证，无需注册
- ⚡ 边缘部署，全球加速

## 手动部署（Cloudflare Workers）

```bash
# 安装依赖
pnpm install

# 创建 D1 数据库
pnpm db:create
# 将输出的 database_id 填入 wrangler.toml

# 初始化表结构
pnpm db:migrate

# 构建前端
pnpm build:web

# 部署
pnpm deploy
```

## 本地开发

```bash
pnpm install
pnpm db:migrate:local
pnpm build:web
pnpm dev
```

访问 http://localhost:8787

## 项目结构

```
├── src/                  # 后端 API（Hono + CF Workers）
│   ├── app.ts            # 路由 + 鉴权中间件
│   ├── entry-cf.ts       # Workers 入口
│   ├── entry-vercel.ts   # Vercel 入口
│   ├── routes/           # API 路由
│   ├── db/               # D1 适配层 + SQL 查询
│   ├── notify/           # 邮件 / Telegram 推送
│   └── scheduled.ts      # 定时推送任务
├── web/                  # 前端（React + Vite）
├── migrations/           # D1 表结构
└── wrangler.toml         # Cloudflare 配置
```

## License

MIT
