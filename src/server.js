import express from 'express'
import dotenv from 'dotenv'
import { connectDB, disconnectDB } from './config/configdb.js'
import authRoutes from './routes/authRoutes.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'

dotenv.config()

const app = express()

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Cookie',
            'Set-Cookie',
        ],
        credentials: true,
    })
)
app.use(cookieParser())
app.use(express.json()) // recibir respuestas en formato json en los endpoints

const PORT = 3001

// Rutas API
app.use('/api/auth', authRoutes)

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log('Servidor corriendo en puerto', PORT)
        })
    })
    .catch(() => {
        disconnectDB()
    })
