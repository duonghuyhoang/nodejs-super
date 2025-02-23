import { Request, Response } from 'express'
import { registerUser, loginUser } from '../services/user.service'

export const registerController = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body
    const user = await registerUser(name, email, password)
    return res.status(201).json({ data: user })
  } catch (error: any) {
    return res.status(400).json({ message: error.message })
  }
}

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    const user = await loginUser(email, password)
    return res.status(200).json({ data: user })
  } catch (error: any) {
    return res.status(400).json({ message: error.message })
  }
}
