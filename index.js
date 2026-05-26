const {
    default: makeWASocket,
    useMultiFileAuthState
} = require("@whiskeysockets/baileys")

const fs = require("fs")
const path = require("path")
const P = require("pino")
const express = require("express")
const QRCode = require("qrcode")
// ====== Express Server ======

const app = express()

app.use(express.static(__dirname))

app.get("/", (req, res) => {
    res.send("Bot is running")
})

const PORT = process.env.PORT || 3000

let qr = ""

app.get("/qr", async (req, res) => {

    if (!qr) {
        return res.send("QR not ready yet")
    }

    const qrImage = await QRCode.toDataURL(qr)

    res.send(`
        <html>
            <body style="display:flex;justify-content:center;align-items:center;height:100vh">
                <img src="${qrImage}" />
            </body>
        </html>
    `)
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
// ====== Start Bot ======
async function startBot() {

    const { state, saveCreds } =
        await useMultiFileAuthState("auth_info")

    const sock = makeWASocket({
    auth: state,

    logger: P({ level: "silent" }),

    printQRInTerminal: false,

    browser: ["Chrome", "Windows", "10"],

    syncFullHistory: false,

    markOnlineOnConnect: false,

    connectTimeoutMs: 60000,

    defaultQueryTimeoutMs: 0,

    keepAliveIntervalMs: 10000
})

    // ====== Save Session ======
    sock.ev.on("connection.update", async (update) => {

    const { connection, lastDisconnect, qr: newQr } = update

if (newQr) {
    qr = newQr
    console.log(newQr)
    console.log("QR RECEIVED")
}
        

    if (connection === "open") {
        console.log("WhatsApp Connected")
    }

    if (connection === "close") {
   console.log("Connection Closed")
   startBot()
}

})

    // ====== Messages ======
    sock.ev.on("messages.upsert", async ({ messages }) => {

        try {

            console.log("MESSAGE RECEIVED")

            const msg = messages[0]

            if (!msg.message) return

            // منع الرد على رسائل البوت
            if (msg.key.fromMe) return

            const sender = msg.key.remoteJid

            const isGroup =
                sender.endsWith("@g.us")

            console.log(
                isGroup
                    ? "MESSAGE FROM GROUP"
                    : "PRIVATE MESSAGE"
            )

            const text =
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text ||
                msg.message.imageMessage?.caption ||
                msg.message.videoMessage?.caption ||
                ""

            console.log("TEXT:", text)

            // ====== تجربة ======
            if (text === ".تجربة") {

                await sock.sendMessage(sender, {
                    text: "البوت يعمل ✅"
                })
            }

            // ====== صوت ======
            if (text === ".صوت") {

                const folderPath = "./audio"

                if (!fs.existsSync(folderPath)) {
                    fs.mkdirSync(folderPath)
                }

                const files =
                    fs.readdirSync(folderPath)

                if (files.length === 0) {

                    await sock.sendMessage(sender, {
                        text: "لا توجد صوتيات"
                    })

                    return
                }

                const randomAudio =
                    files[
                        Math.floor(
                            Math.random() * files.length
                        )
                    ]

                const audioPath =
                    path.join(folderPath, randomAudio)

                await sock.sendMessage(sender, {
                    audio: fs.readFileSync(audioPath),
                    mimetype: "audio/mpeg",
                    ptt: false
                })
            }

            // ====== اصوات ======
            if (text === ".اصوات") {

                const folderPath = "./sounds"

                if (!fs.existsSync(folderPath)) {
                    fs.mkdirSync(folderPath)
                }

                const files =
                    fs.readdirSync(folderPath)

                if (files.length === 0) {

                    await sock.sendMessage(sender, {
                        text: "لا توجد صوتيات"
                    })

                    return
                }

                const randomAudio =
                    files[
                        Math.floor(
                            Math.random() * files.length
                        )
                    ]

                const audioPath =
                    path.join(folderPath, randomAudio)

                await sock.sendMessage(sender, {
                    audio: fs.readFileSync(audioPath),
                    mimetype: "audio/mpeg",
                    ptt: false
                })
            }

            // ====== صورة ======
            if (text === ".صوره") {

                const folderPath = "./images"

                if (!fs.existsSync(folderPath)) {
                    fs.mkdirSync(folderPath)
                }

                const files =
                    fs.readdirSync(folderPath)

                if (files.length === 0) {

                    await sock.sendMessage(sender, {
                        text: "لا توجد صور"
                    })

                    return
                }

                const randomImage =
                    files[
                        Math.floor(
                            Math.random() * files.length
                        )
                    ]

                const imagePath =
                    path.join(folderPath, randomImage)

                await sock.sendMessage(sender, {
                    image: fs.readFileSync(imagePath),
                    caption: ""
                })
            }

        } catch (err) {

            console.log("ERROR:")
console.log(err)

}
})

}

// ====== Run Bot ======
startBot()
