const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const http = require('http');

const TOKEN = '8383642654:AAFC3MnUGqvSzfgHRkyLpbuw46epKvfMb10';
const CANAL_NOTICIAS = '-1003778336135';
const NEWSAPI_KEY = '8c54f27258564b4aa1c4a1a991011ee8';

const bot = new TelegramBot(TOKEN);
bot.setWebHook('https://noticias-bot-ggco.onrender.com/bot' + TOKEN);

async function publicarNoticia() {
    try {
        const res = await axios.get(
            `https://newsapi.org/v2/top-headlines?language=en&pageSize=5&apiKey=${NEWSAPI_KEY}`,
            { timeout: 10000 }
        );
        
        if (res.data?.articles?.length > 0) {
            const a = res.data.articles[0];
            const msg = '⚡ *ULTIMA HORA* ⚡\n' + '━'.repeat(35) + '\n\n' +
                '📰 *' + a.title + '*\n\n' +
                '📝 ' + (a.description || '').slice(0, 900) + '\n\n' +
                '━'.repeat(35) + '\n#UltimaHora';
            
            await bot.sendMessage(CANAL_NOTICIAS, msg, { parse_mode: 'Markdown' });
            console.log('📰 Publicada: ' + a.title.slice(0, 50));
        }
    } catch(e) { console.log('Error:', e.message); }
}

console.log('📰 BOT NOTICIAS');
publicarNoticia();
setInterval(publicarNoticia, 20 * 60 * 1000);

http.createServer((req, res) => { res.end('OK'); }).listen(process.env.PORT || 3000);
