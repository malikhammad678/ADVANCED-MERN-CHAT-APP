import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import { connectDB } from './config/db.js'
import userRouter from './routes/user.route.js'
import mesageRouter from './routes/message.route.js'

const app = express()

app.use(express.json({ limit:'4mb' }))
app.use(cors())

app.use('/api/auth', userRouter)
app.use('/api/message', mesageRouter)

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
    connectDB()
    console.log(`App is running on PORT No: ${PORT}`)
})