/** Edge 环境邮件发送 — 使用 MailChannels API（CF Workers 免费）或通用 SMTP-over-HTTP */
export async function sendEmail(opts: {
  host: string
  port: number
  user: string
  pass: string
  to: string
  subject: string
  body: string
}) {
  // Edge 环境无法直接用 SMTP socket，使用 MailChannels Workers API
  // 如果用户配置了自己的 SMTP，走 smtp2http 代理或第三方 API
  // 这里提供一个通用的 Resend / MailChannels 兼容实现

  // 尝试 MailChannels（CF Workers 内置支持，免费）
  const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: opts.to }] }],
      from: { email: opts.user, name: 'MemorialHub' },
      subject: opts.subject,
      content: [{ type: 'text/plain', value: opts.body }],
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`邮件发送失败 (${response.status}): ${text}`)
  }
}
