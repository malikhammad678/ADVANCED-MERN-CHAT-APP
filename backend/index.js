import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import { connectDB } from './config/db.js'
import userRouter from './routes/user.route.js'
import mesageRouter from './routes/message.route.js'
import { Server } from 'socket.io'

const app = express()

export const io = new Server({
    cors: { origin: "*" }
})

// online users
export const userSocketMap = {};

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId
    console.log(`User Connected ${userId}`)

    if(userId) userSocketMap[userId] = socket.id

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    socket.on("disconnect", () => {
        console.log(`User Disconnecting ${userId}`)
        delete userSocketMap[userId]
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})


app.use(express.json({ limit:'4mb' }))
app.use(cors())

app.use('/api/auth', userRouter)
app.use('/api/message', mesageRouter)

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
    connectDB()
    console.log(`App is running on PORT No: ${PORT}`)
})