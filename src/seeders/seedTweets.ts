import mongoose from 'mongoose'
import { faker } from '@faker-js/faker'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import User from '~/models/user.model'
import Hashtag from '~/models/hashtag.model'
import Tweet from '~/models/tweet.model'

dotenv.config()

// Define enums based on your model
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

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = `${process.env.DATABASE_URL}/${process.env.DATABASE_NAME}`
    await mongoose.connect(mongoURI)
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

// Generate fake users
const generateUsers = async (count: number) => {
  const users = []
  const existingCount = await User.countDocuments()

  console.log(`Generating ${count} fake users...`)

  for (let i = 0; i < count; i++) {
    const user = new User({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      username:
        faker.internet
          .userName()
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '') +
        existingCount +
        i,
      password: await bcrypt.hash('password123', 10)
    })

    users.push(user)
  }

  await User.insertMany(users)
  console.log(`${count} users generated successfully`)
  return users
}

// Generate fake hashtags
const generateHashtags = async (count: number) => {
  console.log(`Generating ${count} fake hashtags...`)

  const topics = ['tech', 'news', 'sports', 'music', 'movies', 'food', 'travel', 'fashion', 'health', 'business']
  const hashtags = []

  for (let i = 0; i < count; i++) {
    let name
    if (i < topics.length) {
      name = topics[i]
    } else {
      const baseTopic = faker.helpers.arrayElement(topics)
      name = `${baseTopic}${faker.number.int(100)}`
    }

    const existingHashtag = await Hashtag.findOne({ name })
    if (!existingHashtag) {
      hashtags.push({ name })
    }
  }

  if (hashtags.length > 0) {
    await Hashtag.insertMany(hashtags)
    console.log(`${hashtags.length} hashtags generated successfully`)
  } else {
    console.log('No new hashtags were inserted')
  }

  return Hashtag.find()
}

// Helper function to get random items from an array
const getRandomItems = <T>(items: T[], min: number, max: number): T[] => {
  const count = faker.number.int({ min, max })
  const shuffled = [...items].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// Generate fake tweets
const generateTweets = async (count: number, users: any[], hashtags: any[]) => {
  const tweets = []
  console.log(`Generating ${count} fake tweets...`)

  // First generate original tweets
  for (let i = 0; i < Math.floor(count * 0.7); i++) {
    const mediaCount = faker.number.int({ min: 0, max: 4 })
    const medias = []

    for (let j = 0; j < mediaCount; j++) {
      medias.push({
        url: faker.image.url(),
        type: faker.helpers.arrayElement([MediaType.Image, MediaType.Video])
      })
    }

    const selectedHashtags = getRandomItems(hashtags, 0, 3)
    const mentionedUsers = getRandomItems(users, 0, 3)

    const tweet = new Tweet({
      user_id: faker.helpers.arrayElement(users)._id,
      type: TweetType.Tweet,
      audience: faker.helpers.arrayElement([TweetAudience.Everyone, TweetAudience.TwitterCircle]),
      content: faker.lorem.paragraph(),
      parent_id: null,
      hashtags: selectedHashtags.map((h) => h._id),
      mentions: mentionedUsers.map((u) => u._id),
      medias,
      guest_view: faker.number.int({ min: 0, max: 1000 }),
      user_view: faker.number.int({ min: 0, max: 500 })
    })

    tweets.push(tweet)
  }

  await Tweet.insertMany(tweets)
  console.log(`${Math.floor(count * 0.7)} original tweets generated successfully`)

  // Now generate replies, retweets and quote tweets
  const childTweets = []
  const originalTweetIds = (await Tweet.find({}, '_id')).map((t) => t._id)

  for (let i = 0; i < Math.floor(count * 0.3); i++) {
    const tweetType = faker.helpers.arrayElement([TweetType.Comment, TweetType.Retweet, TweetType.QuoteTweet])

    const parentId = faker.helpers.arrayElement(originalTweetIds)

    const medias = []
    // Only add media for comments and quote tweets
    if (tweetType !== TweetType.Retweet) {
      const mediaCount = faker.number.int({ min: 0, max: 2 })
      for (let j = 0; j < mediaCount; j++) {
        medias.push({
          url: faker.image.url(),
          type: faker.helpers.arrayElement([MediaType.Image, MediaType.Video])
        })
      }
    }

    const selectedHashtags = getRandomItems(hashtags, 0, 2)
    const mentionedUsers = getRandomItems(users, 0, 2)

    // Content varies based on tweet type
    let content = faker.lorem.paragraph().trim()

    // Nếu content rỗng hoặc quá ngắn, tạo lại
    while (!content || content.length < 5) {
      content = faker.lorem.sentence().trim()
    }

    const tweet = new Tweet({
      user_id: faker.helpers.arrayElement(users)._id,
      type: TweetType.Tweet,
      audience: faker.helpers.arrayElement([TweetAudience.Everyone, TweetAudience.TwitterCircle]),
      content, // Luôn có nội dung hợp lệ
      parent_id: null,
      hashtags: selectedHashtags.map((h) => h._id),
      mentions: mentionedUsers.map((u) => u._id),
      medias,
      guest_view: faker.number.int({ min: 0, max: 1000 }),
      user_view: faker.number.int({ min: 0, max: 500 })
    })
    childTweets.push(tweet)
  }

  await Tweet.insertMany(childTweets)
  console.log(`${Math.floor(count * 0.3)} replies, retweets and quote tweets generated successfully`)

  return [...tweets, ...childTweets]
}

// Main function to generate all data
const generateFakeData = async () => {
  try {
    await connectDB()

    // Check if we already have data
    const userCount = await User.countDocuments()
    const hashtagCount = await Hashtag.countDocuments()
    const tweetCount = await Tweet.countDocuments()

    console.log(`Current data: ${userCount} users, ${hashtagCount} hashtags, ${tweetCount} tweets`)

    // You can comment out any of these steps if you don't want to regenerate that data
    const users = await generateUsers(50)
    const hashtags = await generateHashtags(30)
    await generateTweets(200, users, hashtags)

    console.log('Fake data generation complete!')

    // Exit the process
    mongoose.disconnect()
    console.log('MongoDB disconnected')
  } catch (error) {
    console.error('Error generating fake data:', error)
    mongoose.disconnect()
    process.exit(1)
  }
}

// Run the generator
generateFakeData()

// You might need to import this for password hashing, uncomment and install if needed
// import bcrypt from 'bcrypt';
