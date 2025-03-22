import { Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult, Schema } from 'express-validator'

const tweetSchema: Schema = {
  type: {
    isIn: {
      options: [['Tweet', 'Retweet', 'Comment', 'QuoteTweet']],
      errorMessage: 'Invalid tweet type'
    }
  },
  audience: {
    isIn: {
      options: [['Everyone', 'TwitterCircle']],
      errorMessage: 'Invalid audience type'
    }
  },
  content: {
    isString: true,
    notEmpty: {
      errorMessage: 'Content is required'
    }
  },
  parent_id: {
    optional: true,
    custom: {
      options: (value) => {
        if (value === null) return true
        if (typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value)) return true
        throw new Error('Invalid parent_id')
      }
    }
  },
  hashtags: {
    optional: true,
    isArray: {
      errorMessage: 'Hashtags must be an array'
    }
  },
  mentions: {
    optional: true,
    isArray: {
      errorMessage: 'Mentions must be an array'
    }
  },
  medias: {
    optional: true,
    isArray: {
      errorMessage: 'Medias must be an array'
    }
  },
  'medias.*.url': {
    optional: true,
    isString: {
      errorMessage: 'Media URL must be a string'
    }
  },
  'medias.*.type': {
    optional: true,
    isIn: {
      options: [['Image', 'Video']],
      errorMessage: 'Media type must be either Image or Video'
    }
  }
}

const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() })
  }
  next()
}

export const validateTweet = [...checkSchema(tweetSchema), validateRequest]
