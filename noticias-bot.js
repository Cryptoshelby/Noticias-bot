const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const http = require('http');

const TOKEN = "8811728164:AAFUxZVijzxDzx9r1_IkrJKpPdEg4ipqd40";
const CANAL_NOTICIAS = '-1003778336135';
const NEWSAPI_KEY = '8c54f27258564b4aa1c4a1a991011ee8';

const bot = new TelegramBot(TOKEN, { polling: true });

let publicadas = [];
try { publicadas = JSON.parse(fs.readFileSync('publicadas.json', 'utf8')); } catch(e) { publicadas = []; }
function guardar() { fs.writeFileSync('publicadas.json', JSON.stringify(publicadas)); }

const dominiosGeo = 'cnn.com,foxnews.com,nytimes.com,bbc.com,reuters.com,apnews.com,aljazeera.com,theguardian.com,washingtonpost.com,wsj.com,abc.net.au,cbc.ca,france24.com,dw.com,spiegel.de,elpais.com,lemonde.fr,ansa.it,efe.com,ndtv.com,hindustantimes.com,japantimes.co.jp,koreatimes.co.kr,straitstimes.com,globo.com,eluniversal.com.mx,clarin.com,telesurtv.net,rt.com';
const dominiosCripto = 'coindesk.com,cointelegraph.com,decrypt.co,theblock.co,bitcoinmagazine.com,cryptoslate.com,beincrypto.com,newsbtc.com';

async function publicarNoticiaGeo() {
    const queries = ['war OR conflict OR military', 'geopolitics OR diplomacy OR tension', 'president OR government OR sanctions', 'nuclear OR peace OR security OR united nations'];
    const query = queries[Math.floor(Math.random() * queries.length)];
    
    try {
        const hoy = new Date().toISOString().split('T')[0];
        const res = await axios.get(
            `https://newsapi.org/v2/everything?q=${query}&domains=${dominiosGeo}&sortBy=publishedAt&from=${hoy}&pageSize=10&apiKey=${NEWSAPI_KEY}`,
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
                const fuente = articulo.source?.name || 'Fuente oficial';
                const fecha = new Date(articulo.publishedAt).toLocaleDateString('es-ES', { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                
                const mensaje = 
                    '⚡ *ÚLTIMA HORA - GEOPOLÍTICA* ⚡\n' +
                    '━'.repeat(35) + '\n\n' +
                    '📰 *' + titulo + '*\n\n' +
                    '📝 ' + contenido.slice(0, 900) + '\n\n' +
                    '━'.repeat(35) + '\n' +
                    '📅 ' + fecha + '\n' +
                    '📡 Fuente internacional' + '\n\n' +
                    '#ÚltimaHora #Geopolítica #Guerras';
                
                if (imagen) {
                    try { await bot.sendPhoto(CANAL_NOTICIAS, imagen, { caption: mensaje, parse_mode: 'Markdown' }); } 
                    catch(e) { await bot.sendMessage(CANAL_NOTICIAS, mensaje, { parse_mode: 'Markdown' }); }
                } else {
                    await bot.sendMessage(CANAL_NOTICIAS, mensaje, { parse_mode: 'Markdown' });
                }
                return;
            }
        }
    } catch(e) {}
}

async function publicarNoticiaCripto() {
    const queries = ['bitcoin OR ethereum OR cryptocurrency', 'blockchain OR defi OR nft', 'crypto market OR trading'];
    const query = queries[Math.floor(Math.random() * queries.length)];
    
    try {
        const hoy = new Date().toISOString().split('T')[0];
        const res = await axios.get(
            `https://newsapi.org/v2/everything?q=${query}&domains=${dominiosCripto}&sortBy=publishedAt&from=${hoy}&pageSize=10&apiKey=${NEWSAPI_KEY}`,
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
                const fuente = articulo.source?.name || 'Fuente cripto';
                const fecha = new Date(articulo.publishedAt).toLocaleDateString('es-ES', { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                
                const mensaje = 
                    '₿ *NOTICIAS CRYPTO* ₿\n' +
                    '━'.repeat(35) + '\n\n' +
                    '📰 *' + titulo + '*\n\n' +
                    '📝 ' + contenido.slice(0, 900) + '\n\n' +
                    '━'.repeat(35) + '\n' +
                    '📅 ' + fecha + '\n' +
                    '📡 Fuente internacional' + '\n\n' +
                    '#Cripto #Bitcoin #Blockchain';
                
                if (imagen) {
                    try { await bot.sendPhoto(CANAL_NOTICIAS, imagen, { caption: mensaje, parse_mode: 'Markdown' }); } 
                    catch(e) { await bot.sendMessage(CANAL_NOTICIAS, mensaje, { parse_mode: 'Markdown' }); }
                } else {
                    await bot.sendMessage(CANAL_NOTICIAS, mensaje, { parse_mode: 'Markdown' });
                }
                return;
            }
        }
    } catch(e) {}
}

async function publicarTelegram() {
    const queries = ['telegram OR pavel durov', 'telegram update OR feature'];
    const query = queries[Math.floor(Math.random() * queries.length)];
    
    try {
        const hoy = new Date().toISOString().split('T')[0];
        const res = await axios.get(
            `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&from=${hoy}&pageSize=10&apiKey=${NEWSAPI_KEY}`,
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
                const fuente = articulo.source?.name || 'Fuente';
                const fecha = new Date(articulo.publishedAt).toLocaleDateString('es-ES', { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                
                const mensaje = 
                    '💬 *TELEGRAM / PAVEL DUROV* 💬\n' +
                    '━'.repeat(35) + '\n\n' +
                    '📰 *' + titulo + '*\n\n' +
                    '📝 ' + contenido.slice(0, 900) + '\n\n' +
                    '━'.repeat(35) + '\n' +
                    '📅 ' + fecha + '\n' +
                    '📡 Fuente internacional' + '\n\n' +
                    '#Telegram #PavelDurov #Tech';
                
                if (imagen) {
                    try { await bot.sendPhoto(CANAL_NOTICIAS, imagen, { caption: mensaje, parse_mode: 'Markdown' }); } 
                    catch(e) { await bot.sendMessage(CANAL_NOTICIAS, mensaje, { parse_mode: 'Markdown' }); }
                } else {
                    await bot.sendMessage(CANAL_NOTICIAS, mensaje, { parse_mode: 'Markdown' });
                }
                return;
            }
        }
    } catch(e) {}
}

console.log('📰 BOT NOTICIAS - GEOPOLÍTICA | CRIPTO | TELEGRAM');
publicarNoticiaGeo();
publicarNoticiaCripto();
publicarTelegram();
setInterval(publicarNoticiaGeo, 15 * 60 * 1000);
setInterval(publicarNoticiaCripto, 30 * 60 * 1000);
setInterval(publicarTelegram, 40 * 60 * 1000);

const PORT = process.env.PORT || 3000;
http.createServer((req, res) => { res.end('OK'); }).listen(PORT);
