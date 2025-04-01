import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface AuthRequest extends Request {
  headers: Request['headers']
  user?: any
}

export const authenticateUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers?.authorization
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' })
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token format' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-hoang') as { id: string; email: string }
    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({ message: 'Forbidden: Invalid token' })
  }
}
