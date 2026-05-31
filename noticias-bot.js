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

const emojis = {
    'BBC': '🇬🇧', 'CNN': '🔴', 'Reuters': '📡', 'AP News': '📰', 'NYT': '🗞️',
    'Fox News': '🟠', 'Al Jazeera': '🌍', 'The Guardian': '🛡️', 'CNBC': '💹',
    'Bloomberg': '📊', 'TechCrunch': '💻', 'The Verge': '📱', 'ESPN': '⚽',
    'NBC': '🦚', 'ABC': '🔺', 'CBS': '👁️', 'Politico': '🏛️', 'NPR': '🎙️',
    'USA Today': '🗞️', 'Time': '⏰', 'Forbes': '💰', 'Wired': '🔌',
    'Ars Technica': '⚙️', 'Engadget': '🎮', 'Gizmodo': '🤖', 'Mashable': '🌐',
    'BuzzFeed': '🐝', 'Vice': '🔄', 'Vox': '📢', 'Axios': '⚡',
    'The Hill': '🏛️', 'Daily Mail': '📧', 'Mirror': '🪞', 'The Sun': '☀️',
    'Metro': '🚇', 'Sky News': '🌤️', 'RT': '🇷🇺', 'Telesur': '🌎',
    'Facebook': '🟦', 'Twitter': '🐦', 'Instagram': '📸', 'YouTube': '▶️',
    'LinkedIn': '💼', 'TikTok': '🎵', 'Reddit': '🤖', 'Telegram': '💬'
};

function publicarNoticia() {
    https.get('https://news.google.com/rss?hl=en-UShl=en-US&gl=US&ceid=US:engl=UShl=en-US&gl=US&ceid=US:enceid=US:enhl=en-US&gl=US&ceid=US:en', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', async () => {
            const items = data.match(/<item>([\s\S]*?)<\/item>/g) || [];
            for (let item of items) {
                const titulo = (item.match(/<title>(.*?)<\/title>/) || [])[1]?.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim() || '';
                const link = (item.match(/<link>(.*?)<\/link>/) || [])[1] || '';
                const fuente = (item.match(/<source.*?>(.*?)<\/source>/) || [])[1]?.replace(/<[^>]*>/g, '').trim() || 'Google News';
                
                if (publicadas.includes(link) || !titulo) continue;
                publicadas.push(link);
                guardar();
                
                let descRaw = (item.match(/<description>(.*?)<\/description>/) || [])[1] || '';
                descRaw = descRaw.replace(/<ol>[\s\S]*?<\/ol>/g, '');
                let desc = descRaw.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
                
                const liMatches = item.match(/<li>.*?<a href="(https:\/\/[^"]+)".*?>([^<]+)<\/a>.*?<font[^>]*>([^<]+)<\/font>/g) || [];
                let fuentesTexto = '';
                liMatches.slice(0, 5).forEach(li => {
                    const url = (li.match(/href="(https:\/\/[^"]+)"/) || [])[1];
                    const nombre = (li.match(/<font[^>]*>([^<]+)<\/font>/) || [])[1];
                    if (url && nombre) {
                        const emoji = emojis[nombre] || '📡';
                        fuentesTexto += emoji + ' [' + nombre + '](' + url + ') | ';
                    }
                });
                if (!fuentesTexto) {
                    const emoji = emojis[fuente] || '📰';
                    fuentesTexto = emoji + ' [' + fuente + '](' + link + ')';
                } else {
                    fuentesTexto = fuentesTexto.slice(0, -3);
                }
                
                const fecha = new Date().toLocaleDateString('es-ES', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                
                const msg = '📰 *' + titulo + '*\n\n📝 ' + desc.slice(0, 500) + '...\n\n📅 ' + fecha + '\n\n🔗 ' + fuentesTexto;
                
                await bot.sendMessage(CANAL_NOTICIAS, msg, { parse_mode: 'Markdown', disable_web_page_preview: true });
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
