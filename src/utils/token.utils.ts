import jwt from 'jsonwebtoken'
import { IUser } from '~/models/user.model'

export const generateAccessToken = (user: IUser) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'secret-hoang', {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '1h'
  } as jwt.SignOptions)
}

export const generateRefreshToken = (user: IUser) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET || 'refresh-secret-hoang', {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
  } as jwt.SignOptions)
}
