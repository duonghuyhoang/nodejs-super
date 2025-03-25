import { Router } from 'express'
import { createTweetController, getTweetController } from '~/controllers/tweet.controllers'
import { authenticateUser } from '~/middlewares/auth.middleware'
import { validateTweet } from '~/middlewares/tweet.middlewares'

const tweetRouter = Router()

// tweetRouter.post('/create', authenticateUser, validateTweet, createTweetController)
// tweetRouter.get('/:tweet_id', getTweetController)

export default tweetRouter
