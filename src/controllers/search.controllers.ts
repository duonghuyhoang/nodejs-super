import { Request, Response } from 'express'
import { getTweetsByContent } from '~/services/tweet.service'

export const searchController = async (req: Request, res: Response) => {
  const { q, page = '1', limit = '10' } = req.query
  if (!q) {
    return res.status(400).json({ message: 'query is required' })
  }
  try {
    const pageNumber = parseInt(page as string, 10)
    const limitNumber = parseInt(limit as string, 10)

    const result = await getTweetsByContent(q as string, pageNumber, limitNumber)
    return res.json({ data: result })
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' })
  }
}
