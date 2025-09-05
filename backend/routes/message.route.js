import express from 'express'
import { auth } from '../middleware/auth.middleware.js'
import { getAllUsers, getMessages, markMessageSeen } from '../controllers/message.controller.js'

const mesageRouter = express.Router()

mesageRouter.get('/users', auth, getAllUsers)
mesageRouter.get('/:id', auth, getMessages)
mesageRouter.put("/mark/:id", auth, markMessageSeen)

export default mesageRouter;