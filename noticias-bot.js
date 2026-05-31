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

async function publicarNoticia() {
    try {
        const hoy = new Date().toISOString().split('T')[0];
        const res = await axios.get(
            `https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey=${NEWSAPI_KEY}`,
            { timeout: 15000 }
        );
        
        if (res.data?.articles?.length > 0) {
            for (let articulo of res.data.articles) {
                const id = articulo.url || articulo.title;
                if (publicadas.includes(id)) continue;
                
                publicadas.push(id);
                guardar();
                
                const titulo = articulo.title;
                const contenido = articulo.description || articulo.content || titulo;
                const imagen = articulo.urlToImage;
                
                const mensaje = 
                    '⚡ *ULTIMA HORA* ⚡\n' +
                    '━'.repeat(35) + '\n\n' +
                    '📰 *' + titulo + '*\n\n' +
                    '📝 ' + contenido.slice(0, 900) + '\n\n' +
                    '━'.repeat(35) + '\n' +
                    '📡 ' + (articulo.source?.name || 'Fuente internacional') + '\n\n' +
                    '#UltimaHora';
                
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

console.log('📰 BOT NOTICIAS ACTIVO');
publicarNoticia();
setInterval(publicarNoticia, 30 * 60 * 1000);

http.createServer((req, res) => { res.end('OK'); }).listen(process.env.PORT || 3000);
