// Free via @BotFather (create a bot, get a token) — no business account,
// no phone number verification, no per-message cost, unlike WhatsApp's
// Business Cloud API. See JOBS_FEATURE_SETUP.md for setup steps.

async function sendTelegramMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return { sent: false, reason: 'Telegram not configured' };

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { sent: false, reason: `Telegram API error (${res.status}): ${body.slice(0, 200)}` };
    }

    return { sent: true };
  } catch (err) {
    return { sent: false, reason: err.message };
  }
}

module.exports = { sendTelegramMessage };
