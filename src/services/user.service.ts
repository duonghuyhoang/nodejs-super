import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import User, { IUser } from '../models/user.model'
import { IRegisterReqBodyUser } from '~/types/user.types'
import { generateAccessToken, generateRefreshToken } from '~/utils/token.utils'
import Follower from '~/models/follow.model'
import * as process from 'node:process'

export const registerUser = async (payload: IRegisterReqBodyUser, res: Response) => {
  const { name, email, password, confirm_password, day_of_birth } = payload
  const user_id = new ObjectId()

  if (!confirm_password) {
    return res.status(400).json({ message: 'Confirm password is required' })
  }
  if (password !== confirm_password) {
    return res.status(400).json({ message: 'Passwords do not match' })
  }

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return res.status(400).json({ message: 'Email already exists' })
  }

  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  const newUser: IUser = await User.create({
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
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      day_of_birth: newUser.dayOfBirth
    },
    access_token: accessToken
  }
}

export const loginUser = async (email: string, password: string, res: Response) => {
  const user: IUser | null = await User.findOne({ email })
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' })
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid email or password' })
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
      name: user.name,
      email: user.email
    },
    access_token: accessToken
  }
}

export const getOauthGoogleToken = async (code: string) => {
  try {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI || '',
      grant_type: 'authorization_code'
    })

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch Google OAuth token')
    }

    return data
  } catch (error) {
    console.error('Error fetching Google OAuth token:', error)
    throw new Error(error instanceof Error ? error.message : String(error))
  }
}

export const getGoogleUserInfo = async (access_token: string, id_token: string) => {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.statusText}`)
    }

    const userInfo = await response.json()
    return userInfo
  } catch (error) {
    console.error('Error fetching Google user info:', error)
    throw new Error(error instanceof Error ? error.message : String(error))
  }
}

export const oauth = async (code: string) => {
  try {
    const { access_token, id_token } = await getOauthGoogleToken(code)
    const userInfo = await getGoogleUserInfo(access_token, id_token)

    let user = await User.findOne({ email: userInfo.email })
    if (!user) {
      user = new User({
        name: userInfo.name,
        email: userInfo.email,
        avatar: userInfo.picture,
        refreshToken: ''
      })
      await user.save()
    }

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)
    user.refreshToken = hashedRefreshToken
    await user.save()

    return { user, access_token: accessToken, refresh_token: refreshToken }
  } catch (error) {
    throw new Error(error)
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
