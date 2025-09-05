import express from 'express'
import { checkAuth, login, signup, updateProfile } from '../controllers/user.controller.js'
import { auth } from '../middleware/auth.middleware.js'

const userRouter = express.Router()

userRouter.post('/signup', signup)
userRouter.post('/login', login)
userRouter.get("/me", auth ,checkAuth)
userRouter.post("/update", auth, updateProfile)

export default userRouter;