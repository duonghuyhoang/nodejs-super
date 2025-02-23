import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db'
import { responseFormatter } from './middlewares/responseFormatter'
import apiRoute from './routes/router'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

connectDB()

app.use(express.json())
app.use(responseFormatter)
app.use('/api', apiRoute)

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
