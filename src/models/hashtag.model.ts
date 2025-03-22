import mongoose, { Document, Schema } from 'mongoose'
import { ObjectId } from 'mongodb'

export interface IHashtag extends Document {
  _id: ObjectId
  name: string
  createdAt?: Date
  updatedAt?: Date
}

const HashtagSchema = new Schema<IHashtag>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    }
  },
  { timestamps: true }
)

const Hashtag = mongoose.model<IHashtag>('Hashtag', HashtagSchema)
export default Hashtag
