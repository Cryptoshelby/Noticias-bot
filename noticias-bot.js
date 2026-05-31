const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const http = require('http');

const TOKEN = '8383642654:AAFC3MnUGqvSzfgHRkyLpbuw46epKvfMb10';
const CANAL_NOTICIAS = '-1003778336135';
const NEWSAPI_KEY = '8c54f27258564b4aa1c4a1a991011ee8';

const bot = new TelegramBot(TOKEN);
bot.setWebHook('https://noticias-bot-ggco.onrender.com/bot' + TOKEN);

let publicadas = [];
try { publicadas = JSON.parse(fs.readFileSync('publicadas.json', 'utf8')); } catch(e) { publicadas = []; }
function guardar() { fs.writeFileSync('publicadas.json', JSON.stringify(publicadas)); }

const emojis = ['🌍', '⚡', '🔥', '📰', '🗞️', '📡', '⚠️', '🔴', '🟠', '🟡', '💥', '🚨', '📢', '🔊', '👁️'];

async function publicarNoticia() {
    try {
        const hoy = new Date().toISOString().split('T')[0];
        const res = await axios.get(
            `https://newsapi.org/v2/everything?domains=cnn.com,foxnews.com,nytimes.com,bbc.com,reuters.com,apnews.com,aljazeera.com,theguardian.com,washingtonpost.com,wsj.com,telesurtv.net,rt.com&sortBy=publishedAt&from=${hoy}&pageSize=10&apiKey=${NEWSAPI_KEY}`,
            { timeout: 15000 }
        );
        
        if (res.data?.articles?.length > 0) {
            for (let articulo of res.data.articles) {
                const id = articulo.url || articulo.title;
                if (publicadas.includes(id)) continue;
                if (!articulo.title || !articulo.description) continue;
                
                publicadas.push(id);
                guardar();
                
                const titulo = articulo.title;
                const contenido = articulo.content || articulo.description;
                const imagen = articulo.urlToImage;
                const e = emojis[Math.floor(Math.random() * emojis.length)];
                
                const mensaje = 
                    e + ' *ÚLTIMA HORA* ' + e + '\n' +
                    '━'.repeat(35) + '\n\n' +
                    '📰 *' + titulo + '*\n\n' +
                    '📝 ' + contenido.slice(0, 900) + '\n\n' +
                    '━'.repeat(35) + '\n' +
                    '📅 ' + new Date(articulo.publishedAt).toLocaleDateString('es-ES', { 
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    }) + '\n\n' +
                    '#ÚltimaHora #Geopolítica ' + e;
                
                if (imagen) {
                    try { await bot.sendPhoto(CANAL_NOTICIAS, imagen, { caption: mensaje, parse_mode: 'Markdown' }); } 
                    catch(e) { await bot.sendMessage(CANAL_NOTICIAS, mensaje, { parse_mode: 'Markdown' }); }
                } else {
                    await bot.sendMessage(CANAL_NOTICIAS, mensaje, { parse_mode: 'Markdown' });
                }
                
                console.log('📰 Publicada: ' + titulo.slice(0, 50));
                return;
            }
        }
        console.log('⚠️ Sin noticias nuevas.');
    } catch(e) { console.log('⚠️ Error:', e.message); }
}

console.log('📰 BOT NOTICIAS - 24 FUENTES OFICIALES');
publicarNoticia();
setInterval(publicarNoticia, 25 * 60 * 1000);

http.createServer((req, res) => { res.end('OK'); }).listen(process.env.PORT || 3000);
