import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import cors from 'cors'
import connectDB from './config/db'
import { responseFormatter } from './middlewares/responseFormatter'
import apiRoute from './routes/router'
import { initFolder } from './utils/file'
import { createServer } from 'http'
import { Server } from 'socket.io'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
// import '~/utils/s3'

dotenv.config()

initFolder()

const app = express()
const PORT = process.env.PORT || 3000

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false
})

connectDB()

app.use(limiter)
app.use(
  bodyParser.urlencoded({
    extended: true
  })
)
app.use(helmet())
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

const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: '*'
  }
})

const users: Record<string, string> = {}

io.on('connection', (socket) => {
  const userId = socket.handshake.auth?._id
  if (userId) {
    users[userId] = socket.id
  }

  socket.on('message', (data) => {
    const { receiverId, content } = data

    const receiverSocketId = users[receiverId]
    if (receiverSocketId) {
      socket.to(receiverSocketId).emit('message', { sender: userId, content })
    }
  })
})

httpServer.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
