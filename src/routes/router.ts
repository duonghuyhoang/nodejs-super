import { Router } from 'express'
import userRouter from './user.routes'
import mediaRouter from './media.routes'
import tweetRouter from './tweet.routes'

const apiRoute = Router()

apiRoute.use('/user', userRouter)
apiRoute.use('/media', mediaRouter)
apiRoute.use('/tweet', tweetRouter)

export default apiRoute
