import { Router } from 'express'
import userRouter from './user.routes'
import mediaRouter from './media.routes'
import tweetRouter from './tweet.routes'
import searchRouter from './search.routes'

const apiRoute = Router()

apiRoute.use('/user', userRouter)
apiRoute.use('/media', mediaRouter)
apiRoute.use('/tweet', tweetRouter)
apiRoute.use('/search', searchRouter)

export default apiRoute
