/** 通过 Telegram Bot API 发送消息 */
export async function sendTelegram(token: string, chatId: string, text: string) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Telegram 发送失败 (${response.status}): ${body}`)
  }
}
