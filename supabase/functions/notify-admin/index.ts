import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const telegramChatId = Deno.env.get('TELEGRAM_CHAT_ID')
    const lineNotifyToken = Deno.env.get('LINE_NOTIFY_TOKEN')
    const genericWebhookUrl = Deno.env.get('ADMIN_WEBHOOK_URL')

    const promises = []

    // 1. Telegram
    if (telegramBotToken && telegramChatId) {
      promises.push(
        fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: message,
            parse_mode: 'HTML'
          }),
        }).catch(err => console.error('Telegram error:', err))
      )
    }

    // 2. LINE Notify
    if (lineNotifyToken) {
      const params = new URLSearchParams()
      params.append('message', message)
      promises.push(
        fetch('https://notify-api.line.me/api/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${lineNotifyToken}`
          },
          body: params.toString()
        }).catch(err => console.error('LINE Notify error:', err))
      )
    }

    // 3. Generic Webhook (e.g. Make.com, Zapier, Discord)
    if (genericWebhookUrl) {
      promises.push(
        fetch(genericWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: message, message: message }), // content is for Discord
        }).catch(err => console.error('Generic webhook error:', err))
      )
    }

    await Promise.all(promises)

    return new Response(
      JSON.stringify({ success: true, message: 'Notifications sent' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
