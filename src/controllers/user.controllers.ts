import { Request, Response } from 'express'
import { IRegisterReqBodyUser } from '~/types/user.types'
import { loginUser, refreshTokenService, registerUser } from '~/services/user.service'

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
    const { email, password } = req.body
    const { user, access_token } = await loginUser(email, password, res)

    return res.status(200).json({ data: { user, access_token } })
  } catch (error: any) {
    return res.status(error.status || 400).json({ message: error.message })
  }
}

export const refreshTokenController = async (req: Request<any, any, any, any>, res: Response) => {
  try {
    await refreshTokenService(req, res)
  } catch (error: any) {
    return res.status(403).json({ message: error.message })
  }
}
