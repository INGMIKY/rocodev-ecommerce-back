import express from 'express'
import { registerUser } from '../controllers/authControllers.js'

const router = express.Router()

router.post('/register', registerUser)

router.post('/login', (req, res) => {
    console.log('Hiciste una peticion POST a /login')

    res.json({ message: 'Hiciste una peticion POST a /login' })
})

router.post('/logout', (req, res) => {
    console.log('Hiciste una peticion POST a /login')

    res.json({ message: 'Hiciste una peticion POST a /login' })
})

router.get('/profile', (req, res) => {
    console.log('Hiciste una peticion POST a /login')

    res.json({ message: 'Hiciste una peticion POST a /login' })
})

export default router
