const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

const TOKEN = '8383642654:AAHxw7wBzRzzNwT7lAgqhJ9P7JYPQXdYrzI';
const CANALES_FUENTE = ['-1001233043722', '-1001537427825', '-1001967795413', '-1001006503122'];
const CANAL_DESTINO = '-1003982153049';

const bot = new TelegramBot(TOKEN);
let publicados = new Set();

async function buscarYClonar() {
    try {
        const updates = await bot.getUpdates(0, 100, 30);
        const hace5Dias = Math.floor(Date.now() / 1000) - 432000;
        
        for (let update of updates) {
            const msg = update.message || update.channel_post;
            if (!msg) continue;
            
            const chatId = String(msg.chat.id);
            if (CANALES_FUENTE.includes(chatId) && msg.date > hace5Dias && !publicados.has(msg.message_id)) {
                publicados.add(msg.message_id);
                
                await bot.copyMessage(CANAL_DESTINO, chatId, msg.message_id);
                
                const fecha = new Date(msg.date * 1000).toLocaleDateString('es-ES', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                
                const analisis = '📊 *Telegram News*\n' +
                    '━'.repeat(30) + '\n\n' +
                    '📝 Información del ecosistema Telegram.\n\n' +
                    '📅 ' + fecha + '\n\n' +
                    '#Telegram #Noticias';
                
                await bot.sendMessage(CANAL_DESTINO, analisis, { parse_mode: 'Markdown' });
                console.log('📋 Clonado de ' + chatId);
            }
        }
    } catch(e) { console.log('Error:', e.message); }
}

console.log('🤖 CLONADOR - Buscando historial 5 días...');
buscarYClonar();
setInterval(buscarYClonar, 15000);

http.createServer((req, res) => { res.end('OK'); }).listen(process.env.PORT || 3000);
