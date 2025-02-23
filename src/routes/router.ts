import { Router } from 'express'
import userRouter from './user.routes'

const apiRoute = Router()

apiRoute.use('/user', userRouter)

export default apiRoute
