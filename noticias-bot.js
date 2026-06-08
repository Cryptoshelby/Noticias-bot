const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

const TOKEN = '8383642654:AAFC3MnUGqvSzfgHRkyLpbuw46epKvfMb10';
const CANALES_FUENTE = ['-1001537427825', '-1001624773544', '-1001006503122', '-1001967795413'];
const CANAL_DESTINO = '-1003982153049';

const bot = new TelegramBot(TOKEN, { polling: true });

bot.on('message', async (msg) => {
    const chatId = String(msg.chat.id);
    if (CANALES_FUENTE.includes(chatId)) {
        try {
            await bot.copyMessage(CANAL_DESTINO, chatId, msg.message_id);
            
            const fecha = new Date().toLocaleDateString('es-ES', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            
            const analisis = '📊 *Telegram News - Análisis*\n' +
                '━'.repeat(30) + '\n\n' +
                '📝 Esta información refleja las últimas tendencias del ecosistema Telegram.\n\n' +
                '📅 ' + fecha + '\n\n' +
                '#Telegram #Noticias';
            
            await bot.sendMessage(CANAL_DESTINO, analisis, { parse_mode: 'Markdown' });
            console.log('📋 Clonado de ' + chatId);
        } catch(e) { console.log('Error:', e.message); }
    }
});

console.log('🤖 BOT CLONADOR - POLLING');

http.createServer((req, res) => { res.end('OK'); }).listen(process.env.PORT || 3000);
