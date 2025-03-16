import mongoose, { Document, Schema } from 'mongoose'
import { ObjectId } from 'mongodb'

export interface IUser extends Document {
  _id: Types.ObjectId
  name: string
  email: string
  username: string
  password: string
  refreshToken?: string
  dayOfBirth: Date
  createdAt?: Date
  updatedAt?: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required']
    },
    username: {
      type: String,
      trim: true,
      unique: true,
      default: function () {
        return `user_${new ObjectId().toString()}`
      }
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true
    },
    password: {
      type: String
    },
    refreshToken: { type: String },
    dayOfBirth: {
      type: Date
    }
  },
  {
    timestamps: true
  }
)

const User = mongoose.model<IUser>('User', UserSchema)
export default User
