import mongoose, { Document, ObjectId, Schema } from 'mongoose'

export interface IUser extends Document {
  _id: ObjectId
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
    _id: {
      type: String
    },
    name: {
      type: String,
      required: [true, 'Name is required']
    },
    username: {
      type: String,
      trim: true,
      unique: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    refreshToken: { type: String },
    dayOfBirth: {
      type: Date,
      required: [true, 'Day of birth is required']
    }
  },
  {
    timestamps: true
  }
)

const User = mongoose.model<IUser>('User', UserSchema)
export default User
