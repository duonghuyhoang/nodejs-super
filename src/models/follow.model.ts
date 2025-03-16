import mongoose, { Document, ObjectId, Schema } from 'mongoose'

export interface IFollower extends Document {
  _id: ObjectId
  user_id: string
  followed_user_id: ObjectId
  createdAt?: Date
  updatedAt?: Date
}

const FollowerSchema = new Schema<IFollower>(
  {
    user_id: {
      type: String,
      required: true,
      ref: 'User'
    },
    followed_user_id: {
      type: String,
      required: true,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
)

const Follower = mongoose.model<IFollower>('Follower', FollowerSchema)
export default Follower
