import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { getAdminAdapter } from './config/database.config.js'
import { initAdmin } from './config/admin.config.js'
import authRoutes from './routes/auth.route.js'
import vocabularyRoutes from './routes/vocabulary.route.js'

dotenv.config()

const start = async () => {
    const app = express()

    const db = await getAdminAdapter()
    const { admin, router } = initAdmin(db)

    const corsOrigins = process.env.CORS_ORIGIN?.split(',') || []

    app.use(admin.options.rootPath, router)
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
        console.log(`AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`)
    })
}

start()