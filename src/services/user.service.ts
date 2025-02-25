import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Request, Response } from 'express'
import User, { IUser } from '../models/user.model'
import { IRegisterReqBodyUser } from '~/types/user.types'
import { generateAccessToken, generateRefreshToken } from '~/utils/token.utils'

export const registerUser = async (payload: IRegisterReqBodyUser, res: Response) => {
  const { name, email, password, confirm_password, day_of_birth } = payload

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
    name,
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
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)

  user.refreshToken = hashedRefreshToken
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

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken)
    if (!isValid) {
      return res.status(403).json({ message: 'Invalid refresh token' })
    }

    const newAccessToken = generateAccessToken(user)

    return res.json({ access_token: newAccessToken })
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired refresh token' })
  }
}
