import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
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
