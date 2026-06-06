const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

const TOKEN = '8383642654:AAFC3MnUGqvSzfgHRkyLpbuw46epKvfMb10';
const CANALES_FUENTE = ['-1001537427825', '-1001624773544', '-1001006503122', '-1001967795413'];
const CANAL_DESTINO = '-1003982153049';
const MI_REFERIDO = 'https://t.me/Angel_Trader_Robot?start=ref2097658';

const bot = new TelegramBot(TOKEN, { polling: true });

function reemplazarLinks(texto) {
    return texto.replace(/(https?:\/\/t\.me\/[^\s]+)/g, MI_REFERIDO);
}

bot.on('message', async (msg) => {
    const chatId = String(msg.chat.id);
    if (CANALES_FUENTE.includes(chatId)) {
        try {
            // 1. Copiar mensaje original con emojis premium
            await bot.copyMessage(CANAL_DESTINO, chatId, msg.message_id);
            
            // 2. Si tiene links, publicar versión con referido
            const texto = msg.text || msg.caption || '';
            if (texto && texto.includes('t.me/')) {
                const nuevoTexto = reemplazarLinks(texto);
                if (nuevoTexto !== texto) {
                    await bot.sendMessage(CANAL_DESTINO, 
                        '🔗 *Enlace actualizado:*\n' + nuevoTexto,
                        { parse_mode: 'Markdown', disable_web_page_preview: false }
                    );
                }
            }
            
            // 3. Agregar análisis profesional
            const fecha = new Date().toLocaleDateString('es-ES', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            
            const analisis = '📊 *Telegram News - Análisis*\n' +
                '━'.repeat(30) + '\n\n' +
                '📝 Esta información refleja las últimas tendencias y novedades del ecosistema Telegram. ' +
                'Mantente atento a más actualizaciones, airdrops y noticias relevantes.\n\n' +
                '📅 ' + fecha + '\n' +
                '📡 Vía: Telegram News\n\n' +
                '#Telegram #Noticias #Actualización #Airdrops';
            
            await bot.sendMessage(CANAL_DESTINO, analisis, { parse_mode: 'Markdown' });
            console.log('📋 Clonado + referido + análisis de ' + chatId);
        } catch(e) {
            console.log('Error:', e.message);
        }
    }
});

console.log('🤖 BOT CLONADOR COMPLETO');
console.log('📡 Fuentes:', CANALES_FUENTE.length);
console.log('📢 Destino:', CANAL_DESTINO);
console.log('🔗 Referido:', MI_REFERIDO);

http.createServer((req, res) => { res.end('OK'); }).listen(process.env.PORT || 3000);
