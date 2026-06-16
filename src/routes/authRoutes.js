import express from 'express'

const router = express.Router()

router.post('/register', (req, res) => {
    console.log('Hiciste una peticion POST a /register')

    res.json({ message: 'Hiciste una peticion POST a /register' })
})

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
