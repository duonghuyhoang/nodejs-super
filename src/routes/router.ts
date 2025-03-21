import { Router } from 'express'
import userRouter from './user.routes'
import mediaRouter from './media.routes'

const apiRoute = Router()

apiRoute.use('/user', userRouter)
apiRoute.use('/media', mediaRouter)

export default apiRoute
