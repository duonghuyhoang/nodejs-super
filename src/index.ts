import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import connectDB from './config/db'
import { responseFormatter } from './middlewares/responseFormatter'
import apiRoute from './routes/router'

dotenv.config()

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
app.use('/api', apiRoute)

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
