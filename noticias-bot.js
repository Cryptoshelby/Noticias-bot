const TelegramBot = require('node-telegram-bot-api');
const https = require('https');
const http = require('http');

const TOKEN = '8383642654:AAFC3MnUGqvSzfgHRkyLpbuw46epKvfMb10';
const CANAL_NOTICIAS = '-1003778336135';

const bot = new TelegramBot(TOKEN);
bot.setWebHook('https://noticias-bot-ggco.onrender.com/bot' + TOKEN);

const emojis = ['🌍', '⚡', '🔥', '📰', '🗞️', '📡', '⚠️', '🔴', '🟠', '🟡', '💥', '🚨', '📢', '🔊', '👁️', '🌐', '📊', '💡', '🎯', '🏆'];

function publicarNoticia() {
    const url = 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en';
    
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', async () => {
            const items = data.match(/<item>([\s\S]*?)<\/item>/g) || [];
            if (items.length > 0) {
                const item = items[0];
                const titulo = (item.match(/<title>(.*?)<\/title>/) || [])[1] || '';
                const desc = (item.match(/<description>(.*?)<\/description>/) || [])[1] || '';
                const fuente = (item.match(/<source.*?>(.*?)<\/source>/) || [])[1] || 'Google News';
                const e1 = emojis[Math.floor(Math.random() * emojis.length)];
                const e2 = emojis[Math.floor(Math.random() * emojis.length)];
                
                const msg = e1 + ' *ÚLTIMA HORA* ' + e2 + '\n' +
                    '━'.repeat(35) + '\n\n' +
                    '📰 *' + titulo + '*\n\n' +
                    '📝 ' + desc.replace(/<[^>]*>/g, '').slice(0, 900) + '\n\n' +
                    '━'.repeat(35) + '\n' +
                    '📡 ' + fuente + ' 📅 ' + new Date().toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' }) + '\n\n' +
                    '#ÚltimaHora ' + e1 + ' ' + e2;
                
                await bot.sendMessage(CANAL_NOTICIAS, msg, { parse_mode: 'Markdown' });
                console.log('📰 Publicada: ' + titulo.slice(0, 50));
            }
        });
    }).on('error', (e) => console.log('Error:', e.message));
}

console.log('📰 BOT NOTICIAS - GOOGLE DISCOVER');
publicarNoticia();
setInterval(publicarNoticia, 15 * 60 * 1000);

http.createServer((req, res) => { res.end('OK'); }).listen(process.env.PORT || 3000);
