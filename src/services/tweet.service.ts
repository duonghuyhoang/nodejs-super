import Tweet, { ITweet, TweetRequestBody } from '~/models/tweet.model'
import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import Hashtag from '~/models/hashtag.model'

/**
 * Check and create hashtags if they don't exist
 * @param hashtags Array of hashtag strings
 * @returns Array of hashtag ObjectIds
 */
export const processHashtags = async (hashtags: string[] = []): Promise<ObjectId[]> => {
  try {
    if (!hashtags.length) return []

    const hashtagPromises = hashtags.map(async (hashtag) => {
      const foundHashtag = await Hashtag.findOne({ name: hashtag })
      if (foundHashtag) return foundHashtag._id

      const newHashtag = await Hashtag.create({ name: hashtag })
      return newHashtag._id
    })

    return Promise.all(hashtagPromises)
  } catch (error) {
    throw new Error(`Failed to process hashtags: ${error.message}`)
  }
}

/**
 * Create a new tweet
 * @param req Request containing tweet information
 * @param res Response
 * @returns Object containing the newly created tweet
 */
export const createTweet = async (req: Request<any, any, TweetRequestBody>, res: Response) => {
  // Check user authentication
  if (!req.user) {
    throw new Error('User authentication required')
  }

  try {
    const { audience, content, hashtags, mentions, medias, parent_id, type } = req.body

    if (!content && (!medias || medias.length === 0)) {
      throw new Error('Tweet must contain content or media')
    }

    const hashtagIds = await processHashtags(hashtags)

    const newTweet: ITweet = await Tweet.create({
      user_id: new ObjectId(req.user.id),
      audience,
      content,
      mentions: mentions || [],
      hashtags: hashtagIds,
      medias: medias || [],
      parent_id: parent_id || null,
      type
    })

    return { new_tweet: newTweet }
  } catch (error) {
    console.error('Error creating tweet:', error)
    throw error
  }
}

/**
 * Get a tweet by tweet ID
 * @param tweet_id Tweet ID
 * @returns Tweet object
 */
export const getTweet = async (tweet_id: string) => {
  try {
    const tweet = (await Tweet.findById(tweet_id)
      .populate('user_id', '-password -refreshToken -createdAt -updatedAt')
      .populate('hashtags')
      .populate('mentions')
      .populate('medias')
      .lean()) as ITweet

    return tweet
  } catch (error) {
    throw new Error('Get tweet error!')
  }
}
