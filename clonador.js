const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

const TOKEN = '8383642654:AAHxw7wBzRzzNwT7lAgqhJ9P7JYPQXdYrzI';
const CANALES_FUENTE = ['-1001537427825', '-1001624773544', '-1001006503122', '-1001967795413'];
const CANAL_DESTINO = '-1003982153049';

const bot = new TelegramBot(TOKEN);

let lastUpdateId = 0;
let historialPublicado = new Set();

async function buscarYClonar() {
    try {
        const updates = await bot.getUpdates(lastUpdateId + 1, 100, 30);
        for (let update of updates) {
            lastUpdateId = update.update_id;
            const msg = update.message || update.channel_post;
            if (!msg) continue;
            
            const chatId = String(msg.chat.id);
            if (CANALES_FUENTE.includes(chatId) && !historialPublicado.has(msg.message_id)) {
                historialPublicado.add(msg.message_id);
                
                // Copiar SOLO al canal destino
                await bot.copyMessage(CANAL_DESTINO, chatId, msg.message_id);
                
                const fecha = new Date(msg.date * 1000).toLocaleDateString('es-ES', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                
                const analisis = '📊 *Telegram News*\n' +
                    '━'.repeat(30) + '\n\n' +
                    '📝 Última información del ecosistema Telegram.\n\n' +
                    '📅 ' + fecha + '\n\n' +
                    '#Telegram #Noticias';
                
                await bot.sendMessage(CANAL_DESTINO, analisis, { parse_mode: 'Markdown' });
                console.log('📋 Clonado de ' + chatId);
            }
        }
    } catch(e) { console.log('Error:', e.message); }
}

console.log('🤖 CLONADOR - Buscando últimos 2 días...');

// Buscar historial de los últimos 2 días (172800 segundos)
async function buscarHistorial() {
    try {
        const hace2Dias = Math.floor(Date.now() / 1000) - 172800;
        const updates = await bot.getUpdates(0, 100, 30);
        
        for (let update of updates) {
            const msg = update.message || update.channel_post;
            if (!msg) continue;
            
            const chatId = String(msg.chat.id);
            if (CANALES_FUENTE.includes(chatId) && msg.date > hace2Dias && !historialPublicado.has(msg.message_id)) {
                historialPublicado.add(msg.message_id);
                await bot.copyMessage(CANAL_DESTINO, chatId, msg.message_id);
                console.log('📋 Historial: ' + chatId);
            }
        }
        console.log('✅ Historial procesado');
    } catch(e) { console.log('Error historial:', e.message); }
}

buscarHistorial();
setInterval(buscarYClonar, 10000);

http.createServer((req, res) => { res.end('OK'); }).listen(process.env.PORT || 3000);
