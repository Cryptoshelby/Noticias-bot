const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const http = require('http');

const TOKEN = '8811728164:AAFUxZVijzxDzx9r1_IkrJKpPdEg4ipqd40';
const CANAL_NOTICIAS = '-1003778336135';

const bot = new TelegramBot(TOKEN, { polling: true });

let publicadas = [];
try { publicadas = JSON.parse(fs.readFileSync('publicadas.json', 'utf8')); } catch(e) { publicadas = []; }
function guardar() { fs.writeFileSync('publicadas.json', JSON.stringify(publicadas)); }

async function publicarNoticiaGeo() {
    const subs = ['worldnews', 'geopolitics', 'news', 'worldpolitics'];
    const sub = subs[Math.floor(Math.random() * subs.length)];
    
    try {
        const res = await axios.get(`https://www.reddit.com/r/${sub}/hot.json?limit=10`, {
            headers: { 'User-Agent': 'NoticiasBot/1.0' },
            timeout: 10000
        });
        
        const posts = res.data?.data?.children || [];
        for (let post of posts) {
            const data = post.data;
            const id = data.id;
            if (publicadas.includes(id)) continue;
            if (data.stickied) continue;
            
            publicadas.push(id);
            if (publicadas.length > 500) publicadas = publicadas.slice(-500);
            guardar();
            
            const titulo = data.title;
            const contenido = data.selftext?.slice(0, 900) || data.title;
            const imagen = data.url_overridden_by_dest || data.url;
            const fuente = 'Reddit r/' + data.subreddit;
            const fecha = new Date(data.created_utc * 1000).toLocaleDateString('es-ES', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            
            const mensaje = 
                '⚡ *ÚLTIMA HORA - GEOPOLÍTICA* ⚡\n' +
                '━'.repeat(35) + '\n\n' +
                '📰 *' + titulo + '*\n\n' +
                '📝 ' + contenido + '\n\n' +
                '━'.repeat(35) + '\n' +
                '📅 ' + fecha + '\n' +
                '📡 ' + fuente + '\n\n' +
                '#ÚltimaHora #Geopolítica';
            
            const esImagen = imagen && (imagen.endsWith('.jpg') || imagen.endsWith('.png') || imagen.endsWith('.jpeg') || imagen.includes('imgur'));
            
            if (esImagen) {
                try { await bot.sendPhoto(CANAL_NOTICIAS, imagen, { caption: mensaje, parse_mode: 'Markdown' }); } 
                catch(e) { await bot.sendMessage(CANAL_NOTICIAS, mensaje, { parse_mode: 'Markdown' }); }
            } else {
                await bot.sendMessage(CANAL_NOTICIAS, mensaje, { parse_mode: 'Markdown' });
            }
            
            console.log('🌍 Geo: ' + titulo.slice(0, 50));
            return;
        }
    } catch(e) { console.log('⚠️ Reddit:', e.message); }
}

console.log('📰 BOT NOTICIAS - REDDIT SIN LÍMITES');
publicarNoticiaGeo();
setInterval(publicarNoticiaGeo, 15 * 60 * 1000);

const PORT = process.env.PORT || 3000;
http.createServer((req, res) => { res.end('OK'); }).listen(PORT);
