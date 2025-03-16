import { Request, Response, NextFunction } from 'express'

interface ApiResponse {
  code: number
  status: 'success' | 'error'
  data?: any[]
  message?: string
  meta?: any
}

export const responseFormatter = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json.bind(res)

  res.json = (body: any) => {
    const isError = res.statusCode >= 400

    const response: ApiResponse = {
      code: res.statusCode,
      status: isError ? 'error' : 'success',
      ...(isError
        ? { message: body.message || 'An error occurred' }
        : {
            data: Array.isArray(body?.data) ? body.data : body?.data ? [body.data] : [],
            ...(body.message ? body.message : {})
          }),
      ...(body.meta ? { meta: body.meta } : {})
    }

    return originalJson(response)
  }

  next()
}
