import mongoose from 'mongoose'

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = `${process.env.DATABASE_URL}/${process.env.DATABASE_NAME}`

    await mongoose.connect(mongoURI)
    console.log('🔥 MongoDB Connected!')
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error)
    process.exit(1)
  }
}

export default connectDB
