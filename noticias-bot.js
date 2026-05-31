const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

const TOKEN = '8383642654:AAFC3MnUGqvSzfgHRkyLpbuw46epKvfMb10';
const CANAL_NOTICIAS = '-1003778336135';

const bot = new TelegramBot(TOKEN);

const emojis = { 'BBC': '🇬🇧', 'CNN': '🔴', 'Reuters': '📡', 'AP News': '📰', 'NYT': '🗞️', 'Fox News': '🟠', 'Al Jazeera': '🌍', 'The Guardian': '🛡️', 'TechCrunch': '💻', 'The Verge': '📱' };

async function fetchNews() {
    return new Promise((resolve) => {
        http.get('http://news.google.com/rss?hl=en-US&gl=US&ceid=US:en', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', () => resolve(''));
    });
}

async function publicarNoticia() {
    try {
        const data = await fetchNews();
        if (!data || data.length < 100) return;
        
        const items = data.match(/<item>([\s\S]*?)<\/item>/g) || [];
        if (items.length === 0) return;
        
        const item = items[Math.floor(Math.random() * items.length)];
        const titulo = (item.match(/<title>(.*?)<\/title>/) || [])[1]?.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim() || '';
        const link = (item.match(/<link>(.*?)<\/link>/) || [])[1] || '';
        const fuente = (item.match(/<source.*?>(.*?)<\/source>/) || [])[1]?.replace(/<[^>]*>/g, '').trim() || 'Google News';
        if (!titulo) return;
        
        let descRaw = (item.match(/<description>(.*?)<\/description>/) || [])[1] || '';
        descRaw = descRaw.replace(/<ol>[\s\S]*?<\/ol>/g, '');
        const desc = descRaw.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
        
        const emoji = emojis[fuente] || '📰';
        const fecha = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        const msg = emoji + ' *' + titulo + '*\n\n📝 ' + desc.slice(0, 500) + '...\n\n📅 ' + fecha + '\n🔗 [' + fuente + '](' + link + ')';
        
        await bot.sendMessage(CANAL_NOTICIAS, msg, { parse_mode: 'Markdown', disable_web_page_preview: true });
        console.log('📰 ' + titulo.slice(0, 50));
    } catch(e) { console.log('Error:', e.message); }
}

const PORT = process.env.PORT || 3000;
http.createServer((req, res) => { res.end('OK'); }).listen(PORT, () => {
    console.log('📰 BOT NOTICIAS');
    publicarNoticia();
    setInterval(publicarNoticia, 15 * 60 * 1000);
});
