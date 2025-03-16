import { Request, Response } from 'express'
import { IRegisterReqBodyUser } from '~/types/user.types'
import { loginUser, refreshTokenService, registerUser, getProfile, follow, unFollow } from '~/services/user.service'
import _ from 'lodash'

export const registerController = async (req: Request<any, any, IRegisterReqBodyUser>, res: Response) => {
  try {
    const { user, access_token } = await registerUser(req.body, res)

    return res.status(201).json({ data: { user, access_token } })
  } catch (error: any) {
    return res.status(error.status || 400).json({ message: error.message })
  }
}

export const loginController = async (req: Request, res: Response) => {
  try {
    const bodyPayload = _.pick(req.body, ['name', 'email', 'password'])

    const { email, password } = bodyPayload
    const { user, access_token } = await loginUser(email, password, res)

    return res.status(200).json({ data: { user, access_token } })
  } catch (error: any) {
    return res.status(error.status || 400).json({ message: error.message })
  }
}

export const refreshTokenController = async (req: Request, res: Response) => {
  try {
    await refreshTokenService(req, res)
  } catch (error: any) {
    return res.status(403).json({ message: error.message })
  }
}

export const getProfileController = async (req: Request, res: Response) => {
  try {
    const { username } = req.params
    const user = await getProfile(username)
    return res.json({ data: user })
  } catch (error: any) {
    return res.status(404).json({ message: error.message })
  }
}

export const followController = async (req: Request, res: Response) => {
  try {
    const { user_id, followed_user_id } = req.body
    const message = await follow(user_id, followed_user_id)
    return res.json({ message: message })
  } catch (error: any) {
    return res.status(404).json({ message: error.message })
  }
}

export const unFollowController = async (req: Request, res: Response) => {
  try {
    const { user_id, followed_user_id } = req.body

    if (!user_id || !followed_user_id) {
      return res.status(400).json({ message: 'user_id and followed_user_id are required' })
    }

    const message = await unFollow(user_id, followed_user_id)

    return res.json({ message })
  } catch (error: any) {
    return res.status(400).json({ message: error.message })
  }
}
