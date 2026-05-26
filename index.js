const {
    default: makeWASocket,
    useMultiFileAuthState
} = require("@whiskeysockets/baileys")

const fs = require("fs")
const path = require("path")
const P = require("pino")
const express = require("express")
const qrcode = require("qrcode-terminal")

// ====== Express Server ======
const app = express()

app.get("/", (req, res) => {
    res.send("Bot is running")
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(Server running on port ${PORT})
})

// ====== Start Bot ======
async function startBot() {

    const { state, saveCreds } =
        await useMultiFileAuthState("session")

    const sock = makeWASocket({
        auth: state,
        logger: P({ level: "silent" }),

        // مهم
        printQRInTerminal: false,

        syncFullHistory: true,
        markOnlineOnConnect: true,
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    })

    // ====== Save Session ======
    sock.ev.on("creds.update", saveCreds)

    // ====== Connection ======
    sock.ev.on("connection.update", async (update) => {

    const { connection, lastDisconnect, qr } = update

    if (qr) {
        console.log("QR RECEIVED")
        qrcode.generate(qr, { small: true })
    }

    if (connection === "open") {
        console.log("WhatsApp Connected ✅")
    }

    if (connection === "close") {
        console.log("Connection Closed ❌")
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
