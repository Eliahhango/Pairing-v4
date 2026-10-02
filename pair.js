

const zlib = require('zlib');
const PastebinAPI = require('pastebin-js'),
pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require("@whiskeysockets/baileys");

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

function generateRandomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    async function BWM_XMD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            let Pair_Code_By_Ibrahim_Adams = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari"),
                syncFullHistory: false,
                generateHighQualityLinkPreview: true,
                shouldIgnoreJid: jid => !!jid?.endsWith('@g.us'),
                getMessage: async () => undefined,
                markOnlineOnConnect: true, // Added for better connection
                connectTimeoutMs: 30000, // Increased timeout
                keepAliveIntervalMs: 15000 // Added keepalive
            });

            if (!Pair_Code_By_Ibrahim_Adams.authState.creds.registered) {
                await delay(1000);
                num = num.replace(/[^0-9]/g, '');
                
                // Generate new random code each time
                const randomCode = generateRandomCode();
                const code = await Pair_Code_By_Ibrahim_Adams.requestPairingCode(num, randomCode);
                
                if (!res.headersSent) {
                    await res.send({ code: randomCode });
                }
            }

            Pair_Code_By_Ibrahim_Adams.ev.on('creds.update', saveCreds);
            Pair_Code_By_Ibrahim_Adams.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    await delay(50000); // Reduced delay
                    let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    
                    // Compress and encode session data
                    let compressedData = zlib.gzipSync(data);
                    let b64data = compressedData.toString('base64');

                    // Send session data
                    await Pair_Code_By_Ibrahim_Adams.sendMessage(Pair_Code_By_Ibrahim_Adams.user.id, {
                        text: 'DULLAH-MD;;;' + b64data
                    });

                    // Welcome message
                    let BWM_XMD_TEXT = `
*DULLAH MD CONNECTED*  
--------------------------

📱 *Join group for bot updates:*  
_https://chat.whatsapp.com/Eru4LIcqKztIhcg7OA91Cv?mode=ac_t

🎡 *Github repo*
_https://github.com/abdallahsalimjuma/DULLAH-XMD

😎 _Made by Dullah Tech_
`;

                    await Pair_Code_By_Ibrahim_Adams.sendMessage(Pair_Code_By_Ibrahim_Adams.user.id, {
                        image: { url: 'https://files.catbox.moe/ig9w4q.jpg' },
                        caption: BWM_XMD_TEXT,
                        contextInfo: {
                            mentionedJid: [Pair_Code_By_Ibrahim_Adams.user.id],
                            forwardingScore: 999,
                            isForwarded: true,
                            externalAdReply: {
                                title: "DULLAH-MD",
                                thumbnailUrl: "https://files.catbox.moe/ig9w4q.jpg",
                                sourceUrl: "https://business.dullah.online",
                                mediaType: 1
                            }
                        },
                    });

                    await delay(500);
                    await Pair_Code_By_Ibrahim_Adams.ws.close();
                    await removeFile('./temp/' + id);
                    
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    console.log("Reconnecting...");
                    await delay(5000);
                    BWM_XMD_PAIR_CODE();
                }
            });

            // Handle multiple connection attempts
            Pair_Code_By_Ibrahim_Adams.ev.on('connection.update', (update) => {
                if (update.qr) {
                    console.log("New QR generated for reconnection");
                }
                if (update.connection === "connecting") {
                    console.log("Attempting to connect...");
                }
            });

        } catch (err) {
            console.error("Error:", err.message);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "Service is Currently Unavailable" });
            }
            // Auto-restart
            await delay(3000);
            BWM_XMD_PAIR_CODE();
        }
    }

    return await BWM_XMD_PAIR_CODE();
});

module.exports = router;
