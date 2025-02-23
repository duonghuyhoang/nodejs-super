import { Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult, Schema } from 'express-validator'

const registerSchema: Schema = {
  name: {
    isString: true,
    notEmpty: {
      errorMessage: 'Name is required'
    }
  },
  email: {
    isEmail: {
      errorMessage: 'Invalid email format'
    }
  },
  password: {
    isStrongPassword: true,
    isLength: {
      options: { min: 6 },
      errorMessage: 'Password must be at least 6 characters'
    }
  }
}

const loginSchema: Schema = {
  email: {
    isEmail: {
      errorMessage: 'Invalid email format'
    }
  },
  password: {
    notEmpty: {
      errorMessage: 'Password is required'
    }
  }
}

const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() })
  }
  next()
}

export const registerValidator = [...checkSchema(registerSchema), validateRequest]
export const loginValidator = [...checkSchema(loginSchema), validateRequest]
