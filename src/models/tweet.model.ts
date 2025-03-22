import mongoose, { Document, Schema } from 'mongoose'
import { ObjectId } from 'mongodb'

interface Media {
  url: string
  type: MediaType
}

export interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string
  hashtags: string[]
  mentions: string[]
  medias: Media[]
}

enum MediaType {
  Image = 'Image',
  Video = 'Video'
}

enum TweetAudience {
  Everyone = 'Everyone',
  TwitterCircle = 'TwitterCircle'
}

enum TweetType {
  Tweet = 'Tweet',
  Retweet = 'Retweet',
  Comment = 'Comment',
  QuoteTweet = 'QuoteTweet'
}

export interface ITweet extends Document {
  _id: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_view: number
  user_view: number
  createdAt?: Date
  updatedAt?: Date
}

const TweetSchema = new Schema<ITweet>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: Object.values(TweetType),
      required: true
    },
    audience: {
      type: String,
      enum: Object.values(TweetAudience),
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    parent_id: {
      type: Schema.Types.ObjectId,
      ref: 'Tweet',
      default: null
    },
    hashtags: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Hashtag'
      }
    ],
    mentions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    medias: [
      {
        url: { type: String, required: true },
        type: {
          type: String,
          enum: Object.values(MediaType),
          required: true
        }
      }
    ],
    guest_view: {
      type: Number,
      default: 0
    },
    user_view: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
)

const Tweet = mongoose.model<ITweet>('Tweet', TweetSchema)
export default Tweet
