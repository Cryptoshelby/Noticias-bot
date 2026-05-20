const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const http = require('http');

const TOKEN = '8383642654:AAFC3MnUGqvSzfgHRkyLpbuw46epKvfMb10';
const CANAL_NOTICIAS = '-1003778336135';
const NEWSAPI_KEY = '8c54f27258564b4aa1c4a1a991011ee8';

const bot = new TelegramBot(TOKEN, { polling: true });

let publicadas = [];
let datosUsados = [];

try { publicadas = JSON.parse(fs.readFileSync('publicadas.json', 'utf8')); } catch(e) { publicadas = []; }
try { datosUsados = JSON.parse(fs.readFileSync('datos.json', 'utf8')); } catch(e) { datosUsados = []; }

function guardar() {
    fs.writeFileSync('publicadas.json', JSON.stringify(publicadas));
    fs.writeFileSync('datos.json', JSON.stringify(datosUsados));
}

const todosLosDatos = [
    '🧠 *DATO:* El 90% de transacciones de Bitcoin son realizadas por bots automatizados.',
    '🧠 *DATO:* Pavel Durov nunca ha vendido acciones de Telegram a inversores externos.',
    '🧠 *DATO:* Elon Musk posee Bitcoin, Ethereum y Dogecoin en su cartera personal.',
    '🧠 *DATO:* El primer tweet sobre Bitcoin fue en 2009, hoy mueve billones de dólares.',
    '🧠 *DATO:* Telegram procesa más de 500 mil millones de mensajes diarios.',
    '🧠 *DATO:* Las ballenas cripto mueven el 80% del volumen del mercado.',
    '🧠 *DATO:* Satoshi Nakamoto, creador de Bitcoin, es un misterio sin resolver.',
    '🧠 *DATO:* La capitalización total de criptomonedas supera los 3 billones de dólares.',
    '🧠 *DATO:* Telegram tiene más de 900 millones de usuarios activos mensuales.',
    '🧠 *DATO:* Donald Trump lanzó su propia criptomoneda durante su campaña política.',
    '🧠 *DATO:* El Salvador fue el primer país en adoptar Bitcoin como moneda oficial.',
    '🧠 *DATO:* Jeff Bezos invirtió millones en startups de blockchain y Web3.',
    '🧠 *DATO:* La guerra comercial entre potencias afecta directamente al mercado cripto.',
    '🧠 *DATO:* Mark Zuckerberg planea integrar criptopagos en todas las apps de Meta.',
    '🧠 *DATO:* Los gobiernos de 130 países están desarrollando sus propias CBDC.'
];

async function publicarNoticia() {
    const fuentes = [
        'bitcoin cryptocurrency market today',
        'geopolitics world news today',
        'telegram pavel durov latest',
        'elon musk crypto news today',
        'world economy inflation 2026',
        'central bank digital currency news',
        'blockchain technology latest'
    ];
    
    const query = fuentes[Math.floor(Math.random() * fuentes.length)];
    
    try {
        const hoy = new Date().toISOString().split('T')[0];
        const res = await axios.get(
            `https://newsapi.org/v2/everything?q=${query}&language=es&sortBy=publishedAt&from=${hoy}&pageSize=5&apiKey=${NEWSAPI_KEY}`,
            { timeout: 15000 }
        );
        
        if (res.data?.articles?.length > 0) {
            for (let articulo of res.data.articles) {
                const id = articulo.url || articulo.title;
                if (publicadas.includes(id)) continue;
                
                publicadas.push(id);
                guardar();
                
                const titulo = articulo.title || 'Noticia de Alto Impacto';
                const descripcion = articulo.description || '';
                const contenido = articulo.content || descripcion;
                const imagen = articulo.urlToImage;
                const fuente = articulo.source?.name || 'Fuente internacional';
                const fecha = new Date(articulo.publishedAt).toLocaleDateString('es-ES', { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                });
                
                const mensaje = 
                    '⚡ *NOTICIAS DE ALTO IMPACTO* ⚡\n' +
                    '━'.repeat(35) + '\n\n' +
                    '📰 *' + titulo + '*\n\n' +
                    '📝 ' + (contenido || descripcion).slice(0, 800) + '\n\n' +
                    '━'.repeat(35) + '\n' +
                    '📊 *ANÁLISIS DE IMPACTO:*\n\n' +
                    '🔹 *Criptomonedas:* Posible volatilidad en BTC y ETH.\n' +
                    '🔹 *Mercados:* Movimiento esperado en pares principales.\n' +
                    '🔹 *Recomendación:* Mantener stop loss ajustado.\n\n' +
                    '━'.repeat(35) + '\n' +
                    '📅 ' + fecha + '\n' +
                    '📡 ' + fuente + '\n' +
                    '🤖 @Angel_Trader_Robot\n\n' +
                    '#NoticiasDeAltoImpacto #Geopolítica #Cripto';
                
                if (imagen) {
                    try {
                        await bot.sendPhoto(CANAL_NOTICIAS, imagen, { caption: mensaje, parse_mode: 'Markdown' });
                    } catch(e) {
                        await bot.sendMessage(CANAL_NOTICIAS, mensaje, { parse_mode: 'Markdown' });
                    }
                } else {
                    await bot.sendMessage(CANAL_NOTICIAS, mensaje, { parse_mode: 'Markdown' });
                }
                
                console.log('📰 Publicada: ' + titulo.slice(0, 60));
                break;
            }
        }
    } catch(e) {
        console.log('⚠️ Reintentando...');
    }
}

async function publicarDatoCurioso() {
    const disponibles = todosLosDatos.filter((d, i) => !datosUsados.includes(i));
    
    if (disponibles.length === 0) {
        datosUsados = [];
        guardar();
    }
    
    const idx = Math.floor(Math.random() * todosLosDatos.length);
    if (datosUsados.includes(idx)) return;
    
    datosUsados.push(idx);
    guardar();
    
    await bot.sendMessage(CANAL_NOTICIAS, 
        '🔍 *DATOS DE ALTO IMPACTO* 🔍\n' +
        '━'.repeat(35) + '\n\n' +
        todosLosDatos[idx] + '\n\n' +
        '━'.repeat(35) + '\n' +
        '🤖 @Angel_Trader_Robot\n' +
        '#DatosCuriosos #Cripto',
        { parse_mode: 'Markdown' }
    );
}

console.log('📰 BOT DE NOTICIAS DE ALTO IMPACTO INICIADO');
publicarNoticia();
setInterval(publicarNoticia, 25 * 60 * 1000);
setInterval(publicarDatoCurioso, 45 * 60 * 1000);

const PORT = process.env.PORT || 3000;
http.createServer((req, res) => { res.end('OK'); }).listen(PORT);
