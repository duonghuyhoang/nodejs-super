import { Request, Response, NextFunction } from 'express'

interface ApiResponse {
  code: number
  status: 'success' | 'error'
  data?: any
  message?: string
  meta?: any
}

export const responseFormatter = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json.bind(res)

  res.json = (body: any) => {
    const response: ApiResponse = {
      code: res.statusCode,
      status: res.statusCode >= 400 ? 'error' : 'success',
      ...(body.data ? { data: body.data } : { data: body }),
      // ...(body.message ? { message: body.message } : {}),
      ...(body.meta ? { meta: body.meta } : {})
    }

    return originalJson(response)
  }

  next()
}
