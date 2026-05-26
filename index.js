const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys")

const fs = require("fs")
const path = require("path")
const P = require("pino")

async function startBot() {

    const { state, saveCreds } = await useMultiFileAuthState("session")

    const sock = makeWASocket({
        auth: state,
        logger: P({ level: "silent" })
    })

    sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
        console.log("QR RECEIVED", qr)
    }

    console.log("Connection Update:", update)

    if (connection === "open") {
        console.log("WhatsApp Connected ✅")
    }

    if (connection === "close") {
        console.log("Connection Closed ❌")
    }
})

    sock.ev.on("messages.upsert", async ({ messages }) => {

    console.log("MESSAGE RECEIVED")

    const msg = messages[0]

if (!msg.message) return

const isGroup = msg.key.remoteJid.endsWith("@g.us")

console.log(isGroup ? "MESSAGE FROM GROUP" : "PRIVATE MESSAGE")

const text =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text

        if (text === ".صوت") {

            const folderPath = "./audio"

            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath)
            }

            const files = fs.readdirSync(folderPath)

            if (files.length === 0) {

                await sock.sendMessage(
                    msg.key.remoteJid,
                    {
                        text: "لا توجد صوتيات"
                    }
                )

                return
            }

            const randomAudio =
                files[Math.floor(Math.random() * files.length)]

            const audioPath =
                path.join(folderPath, randomAudio)

            await sock.sendMessage(
                msg.key.remoteJid,
                {
                    audio: fs.readFileSync(audioPath),
                    mimetype: "audio/mpeg",
                    ptt: false
                }
            )
        }
if (text === ".صوره") {

    const folderPath = "./images"

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath)
    }

    const files = fs.readdirSync(folderPath)

    if (files.length === 0) {

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: "لا توجد صور"
            }
        )

        return
    }

    const randomImage =
        files[Math.floor(Math.random() * files.length)]

    const imagePath =
        path.join(folderPath, randomImage)

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            image: fs.readFileSync(imagePath),
            caption: "صورة"
        }
    )
}
if (text === ".اصوات") {

    const folderPath = "./sounds"

    const files = fs.readdirSync(folderPath)

    if (files.length === 0) {

        await sock.sendMessage(msg.key.remoteJid, {
            text: "لا توجد صوتيات"
        })

        return
    }

    const randomAudio =
        files[Math.floor(Math.random() * files.length)]

    const audioPath =
        path.join(folderPath, randomAudio)

    await sock.sendMessage(msg.key.remoteJid, {
        audio: fs.readFileSync(audioPath),
        mimetype: "audio/mpeg",
        ptt: false
    });

}

    })

}
// ====== السيرفر الخاص بـ Render ======
const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.send('Bot is running')
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// ====== تشغيل البوت ======
startBot()
