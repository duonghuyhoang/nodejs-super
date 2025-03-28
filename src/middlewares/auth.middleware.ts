import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface AuthRequest extends Request {
  user?: any
}

export const authenticateUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-hoang') as { id: string; email: string }
    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({ message: error })
  }
}
