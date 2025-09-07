import express from 'express'
import { auth } from '../middleware/auth.middleware.js'
import { getAllUsers, getMessages, markMessageSeen, sendMessage } from '../controllers/message.controller.js'

const mesageRouter = express.Router()

mesageRouter.get('/users', auth, getAllUsers)
mesageRouter.get('/:id', auth, getMessages)
mesageRouter.put("/mark/:id", auth, markMessageSeen)
mesageRouter.post("/send/:id", auth, sendMessage)

export default mesageRouter;