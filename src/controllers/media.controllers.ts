import { Request, Response } from 'express'
import path from 'path'
import formidable from 'formidable'

export const uploadSingleImageController = async (req: Request, res: Response) => {
  try {
    const form = formidable({
      uploadDir: path.join(__dirname, '..', '..', 'uploads', 'images'),
      maxFiles: 1,
      keepExtensions: true
    })

    form.parse(req, (err, fields, files) => {
      if (err) {
        throw new Error('An error occurred while uploading the image')
      }

      return res.json({ message: { message: '123' } })
    })
  } catch (error: any) {
    return res.status(error.status || 400).json({ message: error.message })
  }
}
