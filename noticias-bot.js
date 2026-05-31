const TelegramBot = require('node-telegram-bot-api');
const https = require('https');
const http = require('http');
const fs = require('fs');

const TOKEN = '8383642654:AAFC3MnUGqvSzfgHRkyLpbuw46epKvfMb10';
const CANAL_NOTICIAS = '-1003778336135';

const bot = new TelegramBot(TOKEN);
bot.setWebHook('https://noticias-bot-ggco.onrender.com/bot' + TOKEN);

let publicadas = [];
try { publicadas = JSON.parse(fs.readFileSync('publicadas.json', 'utf8')); } catch(e) { publicadas = []; }
function guardar() { fs.writeFileSync('publicadas.json', JSON.stringify(publicadas)); }

function limpiar(t) {
    return t.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}

function publicarNoticia() {
    https.get('https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', async () => {
            const items = data.match(/<item>([\s\S]*?)<\/item>/g) || [];
            for (let item of items) {
                const titulo = limpiar((item.match(/<title>(.*?)<\/title>/) || [])[1] || '');
                const link = (item.match(/<link>(.*?)<\/link>/) || [])[1] || '';
                const fuente = limpiar((item.match(/<source.*?>(.*?)<\/source>/) || [])[1] || 'Google News');
                
                if (publicadas.includes(link) || !titulo) continue;
                publicadas.push(link);
                guardar();
                
                // Extraer descripción SIN HTML
                let desc = (item.match(/<description>(.*?)<\/description>/) || [])[1] || '';
                desc = limpiar(desc).replace(/https?:\/\/\S+/g, '').trim();
                
                // Extraer fuentes con links reales
                const liMatches = item.match(/<li>.*?<a href="(https:\/\/[^"]+)".*?>([^<]+)<\/a>.*?<font[^>]*>([^<]+)<\/font>/g) || [];
                const botones = [];
                liMatches.forEach(li => {
                    const url = (li.match(/href="(https:\/\/[^"]+)"/) || [])[1];
                    const nombre = (li.match(/<font[^>]*>([^<]+)<\/font>/) || [])[1];
                    if (url && nombre) botones.push({ text: nombre, url: url });
                });
                if (botones.length === 0) botones.push({ text: fuente, url: link });
                
                const fecha = new Date().toLocaleDateString('es-ES', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                
                const msg = '📡 *' + titulo + '*\n\n📝 ' + desc.slice(0, 500) + '...\n\n📅 ' + fecha;
                
                await bot.sendMessage(CANAL_NOTICIAS, msg, {
                    parse_mode: 'Markdown',
                    reply_markup: { inline_keyboard: [botones.slice(0, 4)] }
                });
                
                console.log('📰 ' + titulo.slice(0, 50));
                return;
            }
        });
    }).on('error', (e) => console.log('Error:', e.message));
}

console.log('📰 BOT NOTICIAS');
publicarNoticia();
setInterval(publicarNoticia, 15 * 60 * 1000);

http.createServer((req, res) => { res.end('OK'); }).listen(process.env.PORT || 3000);
