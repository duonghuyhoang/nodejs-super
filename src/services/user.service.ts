import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import User, { IUser } from '../models/user.model'
import { IRegisterReqBodyUser } from '~/types/user.types'
import { generateAccessToken, generateRefreshToken } from '~/utils/token.utils'
import Follower from '~/models/follow.model'

export const registerUser = async (payload: IRegisterReqBodyUser, res: Response) => {
  const { name, email, password, confirm_password, day_of_birth } = payload
  const user_id = new ObjectId()

  if (!confirm_password) {
    throw new Error('Confirm password is required')
  }
  if (password !== confirm_password) {
    throw new Error('Passwords do not match')
  }

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new Error('Email already exists')
  }

  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  const newUser: IUser = await User.create({
    _id: user_id,
    name,
    username: `user${user_id.toString()}`,
    email,
    password: hashedPassword,
    dayOfBirth: new Date(day_of_birth),
    refreshToken: ''
  })

  const accessToken = generateAccessToken(newUser)
  const refreshToken = generateRefreshToken(newUser)

  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)
  newUser.refreshToken = hashedRefreshToken
  await newUser.save()

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  return {
    user: {
      id: newUser._id,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      day_of_birth: newUser.dayOfBirth
    },
    access_token: accessToken,
    refresh_token: refreshToken
  }
}

export const loginUser = async (email: string, password: string, res: Response) => {
  const user: IUser | null = await User.findOne({ email })
  if (!user) {
    throw new Error('Invalid email or password')
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw new Error('Invalid email or password')
  }

  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  user.refreshToken = refreshToken
  await user.save()

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    },
    access_token: accessToken,
    refresh_token: refreshToken
  }
}

export const refreshTokenService = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required' })
  }

  try {
    const decoded: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret-hoang')
    const user = await User.findById(decoded.id)
    if (!user || !user.refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' })
    }

    if (refreshToken !== user.refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' })
    }

    const newAccessToken = generateAccessToken(user)

    return res.json({ access_token: newAccessToken })
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired refresh token' })
  }
}

export const getProfile = async (username: string) => {
  try {
    const user = await User.findOne({ username }).select('-password -refreshToken -createdAt -updatedAt').lean()

    if (!user) {
      throw new Error('User not found!')
    }

    return user
  } catch (error) {
    throw new Error('Get profile error!')
  }
}

export const follow = async (user_id: string, followed_user_id: string) => {
  try {
    await Follower.create({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })

    return { message: 'Follow success!' }
  } catch (error) {
    throw new Error(error)
  }
}

export const unFollow = async (user_id: string, followed_user_id: string) => {
  try {
    const existingFollow = await Follower.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })

    if (!existingFollow) {
      throw new Error('You are not following this user')
    }

    await Follower.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    return { message: 'Unfollow success!' }
  } catch (error) {
    throw new Error(error)
  }
}
