const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const http = require('http');

const TOKEN = '8383642654:AAFC3MnUGqvSzfgHRkyLpbuw46epKvfMb10';
const CANAL_NOTICIAS = '-1003778336135';
const NEWSAPI_KEY = '8c54f27258564b4aa1c4a1a991011ee8';

const bot = new TelegramBot(TOKEN);
bot.setWebHook('https://noticias-bot-ggco.onrender.com/bot' + TOKEN);

let publicadas = [];

const emojis = {
    'BBC News': '🇬🇧', 'CNN': '🔴', 'Reuters': '📡', 'Associated Press': '📰',
    'Fox News': '🟠', 'Al Jazeera': '🌍', 'The Guardian': '🛡️', 'CNBC': '💹',
    'Bloomberg': '📊', 'ESPN': '⚽', 'NBC News': '🦚', 'ABC News': '🔺',
    'CBS News': '👁️', 'The Washington Post': '📰', 'The New York Times': '🗞️',
    'USA Today': '🗞️', 'Time': '⏰', 'Forbes': '💰', 'TechCrunch': '💻',
    'The Verge': '📱', 'Wired': '🔌', 'Ars Technica': '⚙️'
};

async function publicarNoticia() {
    try {
        const res = await axios.get(
            `https://newsapi.org/v2/top-headlines?language=en&pageSize=15&apiKey=${NEWSAPI_KEY}`,
            { timeout: 10000 }
        );
        
        if (res.data?.articles?.length > 0) {
            for (let a of res.data.articles) {
                const id = a.url || a.title;
                if (publicadas.includes(id)) continue;
                if (!a.title || !a.description) continue;
                
                publicadas.push(id);
                if (publicadas.length > 300) publicadas = publicadas.slice(-300);
                
                const fuente = a.source?.name || '';
                const emoji = emojis[fuente] || '📰';
                const contenido = (a.content || a.description).slice(0, 900);
                const fecha = new Date(a.publishedAt).toLocaleDateString('es-ES', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                
                let msg = emoji + ' *' + a.title + '*\n\n';
                msg += '📝 ' + contenido + '\n\n';
                msg += '━'.repeat(30) + '\n';
                msg += '📅 ' + fecha + '\n';
                msg += '📡 ' + fuente + '\n\n';
                msg += '#Noticias #ÚltimaHora ' + emoji;
                
                if (a.urlToImage) {
                    try {
                        await bot.sendPhoto(CANAL_NOTICIAS, a.urlToImage, {
                            caption: msg,
                            parse_mode: 'Markdown'
                        });
                    } catch(e) {
                        await bot.sendMessage(CANAL_NOTICIAS, msg, { parse_mode: 'Markdown' });
                    }
                } else {
                    await bot.sendMessage(CANAL_NOTICIAS, msg, { parse_mode: 'Markdown' });
                }
                
                console.log('📰 ' + a.title.slice(0, 50));
                return;
            }
        }
    } catch(e) { console.log('Error:', e.message); }
}

console.log('📰 BOT NOTICIAS PROFESIONAL');
publicarNoticia();
setInterval(publicarNoticia, 25 * 60 * 1000);

http.createServer((req, res) => { res.end('OK'); }).listen(process.env.PORT || 3000);
