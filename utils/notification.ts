import { supabase } from './supabaseClient';

export const notifyAdmin = async (action: string, details: string) => {
  try {
    const message = `🔔 <b>新通知：${action}</b>\n\n${details}`;
    
    // 1. Try direct Telegram (if configured in frontend env)
    const telegramBotToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const telegramChatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
    
    if (telegramBotToken && telegramChatId) {
      await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: message,
          parse_mode: 'HTML'
        }),
      }).catch(err => console.error('Direct Telegram error:', err));
    }

    // 2. Try direct Webhook (if configured in frontend env)
    const webhookUrl = import.meta.env.VITE_ADMIN_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message, message }),
      }).catch(err => console.error('Direct Webhook error:', err));
    }

    // 3. Always try Supabase Edge Function (for LINE Notify or backend-configured secrets)
    // This will fail silently if the function is not deployed or configured
    const { error } = await supabase.functions.invoke('notify-admin', {
      body: { message }
    });

    if (error) {
      console.debug('Edge function notify-admin not available or failed:', error.message);
    }
  } catch (err) {
    console.error('Failed to send admin notification:', err);
  }
};
