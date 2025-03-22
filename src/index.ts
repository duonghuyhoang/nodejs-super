import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import cors from 'cors'
import connectDB from './config/db'
import { responseFormatter } from './middlewares/responseFormatter'
import apiRoute from './routes/router'
import { initFolder } from './utils/file'

dotenv.config()

initFolder()

const app = express()
const PORT = process.env.PORT || 3000

connectDB()

app.use(
  bodyParser.urlencoded({
    extended: true
  })
)
app.use(express.json())
app.use(cookieParser())
app.use(responseFormatter)
app.use(express.static('uploads'))
app.use(
  cors({
    origin: '*'
  })
)
app.use('/api', apiRoute)

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
