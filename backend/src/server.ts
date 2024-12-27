import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import authRoutes from './routes/auth.route.js'
import vocabularyRoutes from './routes/vocabulary.route.js'

dotenv.config()

const app = express()

const corsOrigins = process.env.CORS_ORIGIN?.split(',') || []

app.use(cors({
    origin: corsOrigins,
    credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/vocabulary', vocabularyRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`)
})