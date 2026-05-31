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

const emojisFuente = {
    'CNN': '🔴', 'BBC': '🇬🇧', 'Reuters': '🔴', 'AP News': '📡', 'Fox News': '🟠',
    'NYT': '🗞️', 'Washington Post': '📰', 'The Guardian': '🛡️', 'Al Jazeera': '🌍',
    'CNBC': '💹', 'Bloomberg': '📊', 'TechCrunch': '💻', 'The Verge': '📱',
    'ESPN': '⚽', 'NBC': '🦚', 'ABC': '🔺', 'CBS': '👁️', 'Politico': '🏛️',
    'NPR': '🎙️', 'USA Today': '🗞️', 'Time': '⏰', 'Forbes': '💰',
    'Business Insider': '📈', 'Wired': '🔌', 'Ars Technica': '⚙️', 'Engadget': '🎮',
    'Gizmodo': '🤖', 'Mashable': '🌐', 'BuzzFeed': '🐝', 'Vice': '🔄',
    'Vox': '📢', 'Axios': '⚡', 'The Hill': '🏛️', 'Daily Mail': '📧',
    'Mirror': '🪞', 'The Sun': '☀️', 'Metro': '🚇', 'Sky News': '🌤️',
    'RT': '🇷🇺', 'Telesur': '🌎', 'Telegram': '💬', 'default': '📰'
};

function limpiar(texto) {
    return texto.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}

function extraerFuentes(descripcion) {
    const fuentes = descripcion.match(/>([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)<\/a>/g) || [];
    return [...new Set(fuentes.map(f => f.replace(/[<>\/a]/g, '').trim()))];
}

function publicarNoticia() {
    https.get('https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', async () => {
            const items = data.match(/<item>([\s\S]*?)<\/item>/g) || [];
            if (items.length === 0) return;
            
            for (let item of items) {
                const titulo = limpiar((item.match(/<title>(.*?)<\/title>/) || [])[1] || '');
                const link = (item.match(/<link>(.*?)<\/link>/) || [])[1] || '';
                let desc = limpiar((item.match(/<description>(.*?)<\/description>/) || [])[1] || '');
                
                if (publicadas.includes(link) || !titulo) continue;
                publicadas.push(link);
                if (publicadas.length > 500) publicadas = publicadas.slice(-500);
                guardar();
                
                // Limpiar descripción
                desc = desc.replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();
                
                // Extraer fuentes
                const fuentesRaw = extraerFuentes((item.match(/<description>(.*?)<\/description>/) || [])[1] || '');
                const fuentes = fuentesRaw.length > 0 ? fuentesRaw : [(item.match(/<source.*?>(.*?)<\/source>/) || [])[1] || 'Google News'];
                
                const fecha = new Date((item.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || Date.now()).toLocaleDateString('es-ES', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                
                // Construir mensaje
                let mensaje = '📡 *' + titulo + '*\n\n';
                mensaje += '📝 ' + desc.slice(0, 500) + '...\n\n';
                mensaje += '📅 ' + fecha + '\n\n';
                
                // Agregar fuentes con emojis
                const linksFuentes = [];
                const linksExtraidos = (item.match(/<li>.*?href="(https:\/\/[^"]+)".*?<\/li>/g) || []);
                
                fuentes.forEach((fuente, i) => {
                    const emoji = emojisFuente[fuente] || emojisFuente['default'];
                    let linkFuente = link;
                    if (linksExtraidos[i]) {
                        const match = linksExtraidos[i].match(/href="(https:\/\/[^"]+)"/);
                        if (match) linkFuente = match[1];
                    }
                    linksFuentes.push(emoji + ' [' + fuente + '](' + linkFuente + ')');
                });
                
                mensaje += linksFuentes.join(' | ') + '\n\n';
                mensaje += '#ÚltimaHora #Noticias';
                
                await bot.sendMessage(CANAL_NOTICIAS, mensaje, { parse_mode: 'Markdown', disable_web_page_preview: false });
                console.log('📰 ' + titulo.slice(0, 50));
                return;
            }
        });
    }).on('error', (e) => console.log('Error:', e.message));
}

console.log('📰 BOT NOTICIAS PROFESIONAL');
publicarNoticia();
setInterval(publicarNoticia, 15 * 60 * 1000);

http.createServer((req, res) => { res.end('OK'); }).listen(process.env.PORT || 3000);
