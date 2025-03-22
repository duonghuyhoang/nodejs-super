import { Request, Response } from 'express'
import { TweetRequestBody } from '~/models/tweet.model'
import { createTweet, getTweet } from './../services/tweet.service'

export const createTweetController = async (req: Request<any, any, TweetRequestBody>, res: Response) => {
  try {
    const { new_tweet }: { new_tweet: object } = await createTweet(req, res)

    return res.status(201).json({ data: { new_tweet } })
  } catch (error: any) {
    return res.status(error.status || 400).json({ message: error.message })
  }
}

export const getTweetController = async (req: Request, res: Response) => {
  try {
    const { tweet_id } = req.params
    const tweet = await getTweet(tweet_id)
    return res.json({ data: tweet })
  } catch (error: any) {
    return res.status(error.status || 400).json({ message: error.message })
  }
}
