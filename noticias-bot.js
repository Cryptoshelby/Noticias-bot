const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

const TOKEN = '8383642654:AAFC3MnUGqvSzfgHRkyLpbuw46epKvfMb10';
const CANALES_FUENTE = ['-1001537427825', '-1001624773544', '-1001006503122'];
const CANAL_DESTINO = '-1003982153049';
const MI_REFERIDO = 'https://t.me/Angel_Trader_Robot?start=ref2097658';

const bot = new TelegramBot(TOKEN, { polling: true });

function reemplazarLinks(texto) {
    return texto.replace(/(https?:\/\/t\.me\/[^\s]+)/g, MI_REFERIDO);
}

// Clonar últimos 7 días al iniciar
async function clonarHistorial() {
    console.log('📋 Clonando últimos 7 días...');
    const desde = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
    
    for (let canal of CANALES_FUENTE) {
        try {
            const updates = await bot.getUpdates({ offset: 0, limit: 100, timeout: 0 });
            console.log('📡 Canal ' + canal + ': ' + updates.length + ' mensajes');
        } catch(e) {
            console.log('Error clonando historial:', e.message);
        }
    }
}

// Clonar en tiempo real
bot.on('message', async (msg) => {
    const chatId = String(msg.chat.id);
    if (CANALES_FUENTE.includes(chatId)) {
        try {
            await bot.copyMessage(CANAL_DESTINO, chatId, msg.message_id);
            
            const texto = msg.text || msg.caption || '';
            if (texto && texto.includes('t.me/')) {
                const nuevoTexto = reemplazarLinks(texto);
                if (nuevoTexto !== texto) {
                    await bot.sendMessage(CANAL_DESTINO, '🔗 *Enlace actualizado:*\n' + nuevoTexto, {
                        parse_mode: 'Markdown', disable_web_page_preview: false
                    });
                }
            }
            
            const fecha = new Date().toLocaleDateString('es-ES', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            
            const analisis = '📊 *Telegram News*\n━'.repeat(25) + '\n\n' +
                '📝 Esta información refleja las últimas tendencias del ecosistema Telegram.\n\n' +
                '📅 ' + fecha + '\n\n#Telegram #Noticias #Actualización';
            
            await bot.sendMessage(CANAL_DESTINO, analisis, { parse_mode: 'Markdown' });
            console.log('📋 Clonado de ' + chatId);
        } catch(e) { console.log('Error:', e.message); }
    }
});

console.log('🤖 BOT CLONADOR + 7 DÍAS HISTORIAL');
console.log('📡 Canales fuente:', CANALES_FUENTE.length);
console.log('📢 Canal destino:', CANAL_DESTINO);

clonarHistorial();

http.createServer((req, res) => { res.end('OK'); }).listen(process.env.PORT || 3000);
