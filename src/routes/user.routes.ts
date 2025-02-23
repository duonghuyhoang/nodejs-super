import { Router } from 'express'
import { loginController, registerController } from '~/controllers/user.controllers'
import { loginValidator, registerValidator } from '~/middlewares/user.middlewares'

const userRouter = Router()

userRouter.post('/register', registerValidator, registerController)

userRouter.post('/login', loginValidator, loginController)

export default userRouter
