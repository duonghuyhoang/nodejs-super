import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User, { IUser } from '../models/user.model'

export const registerUser = async (name: string, email: string, password: string) => {
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new Error('Email already exists')
  }

  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  const newUser: IUser = await User.create({
    name,
    email,
    password: hashedPassword
  })

  return {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email
  }
}

export const loginUser = async (email: string, password: string) => {
  const user: IUser | null = await User.findOne({ email })
  if (!user) {
    throw new Error('Invalid email or password')
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw new Error('Invalid email or password')
  }

  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'secretkey', {
    expiresIn: '1h'
  })

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    token
  }
}
