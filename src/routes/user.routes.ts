import { Router } from 'express'
import {
  loginController,
  refreshTokenController,
  registerController,
  getProfileController,
  followController,
  unFollowController,
  oauthController
} from '~/controllers/user.controllers'
import { loginValidator, registerValidator } from '~/middlewares/user.middlewares'

const userRouter = Router()

// userRouter.post('/register', registerValidator, registerController)

// userRouter.post('/login', loginValidator, loginController)

// userRouter.post('/refresh-token', refreshTokenController)

// userRouter.get('/:username', getProfileController)

// userRouter.post('/follow', followController)

// userRouter.delete('/follow/:user_id', unFollowController)

// userRouter.get('/oauth/google', oauthController)

export default userRouter
