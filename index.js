/* -------------------------------------------------------------------------- */
/*                                 dating app                                 */
/* -------------------------------------------------------------------------- */

import express from 'express'
// import Server from 'socket.io'
import { createServer } from 'http'

import methodOverride from 'method-override'
import cookieParser from 'cookie-parser'
import path from 'path'
import dotenv from 'dotenv'

import AuthRouter from './routes/auth.routes.js'

const envFilePath = '.env'
dotenv.config({ path: path.normalize(envFilePath) })

const PORT = process.env.PORT || 3004

const app = express()
const http = createServer(app)
// const io = new Server(http)

// serving the whole folder
const projectDirectory = './'
app.use(express.static(path.normalize(projectDirectory)))

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))
app.use(cookieParser())
app.use(express.static('uploads'))

const routers = [AuthRouter]

routers.forEach((router) => app.use('/', router))

http.listen(PORT, () => {
  console.log(`application running at ${PORT}`);
});
