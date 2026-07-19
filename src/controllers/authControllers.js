import { registerSchema } from '../schemas/authSchema.js'
import UserModel from '../models/UserModel.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const registerUser = async (req, res) => {
    try {
        // Traer la clave secreta de JWT
        const JWT_SECRET = process.env.JWT_SECRET

        // Extraer los datos del usuario al registrarnos
        const { username, email, password } = registerSchema.parse(req.body)

        // Comprobar si ya existe el usuario
        const existingUser = await UserModel.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' })
        }

        // Encriptar contrasenia
        const hashedPassword = await bcrypt.hash(password, 10)

        // Comprobar el usuario admin
        const isFirstUser = (await UserModel.countDocuments()) === 0

        // Crear el usuario y guardar en la DB
        const newUser = await UserModel.create({
            username,
            email,
            password: hashedPassword,
            isAdmin: isFirstUser,
        })

        // Generar un token con JWT, revisar que usuario está autenticado
        // 1er paso el payload
        const payload = {
            userId: newUser._id,
        }

        // 2do paso crear el token
        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: '1h',
        })

        // 3er el resultado será header.payload.signature, generar una cadena de las 3 partes
        // console.log('TOKEN: ', token)

        // Enviar el token como una cookie
        res.cookie('accessToken', token, {
            httpOnly: true, // Denegamos el acceso a la cookie desde el front
            secure: process.env.NODE_ENV === 'production', // true // el cookie solamente sera enviado a url https
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', //Permitir que la cookie viaje a distintas plataformas, es decir, el front está en vercel y el back en otro, la cookie puede viajar entre esas dos plataformas
            maxAge: 60 * 60 * 1000, // La duración del cookie, 1hora
        })
            .status(201)
            .json({ message: 'Usuario registrado con éxito' })
    } catch (error) {
        res.json(error)
    }
}

export const profile = async (req, res) => {
    // Extraer el accessToken enviado por el cliente
    const token = req.cookies.accessToken

    try {
        // Verificar o decodificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Buscar el usuario en la base de datos
        const user = await UserModel.findById(decoded.userId)
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' })
        }

        console.log(
            'USUARIO ENCONTRADO CON ÉXITO Y ENVIANDO AL FRONT DE DATOS DEL USUARIO'
        )
        res.status(200).json({
            id: user._id,
            email: user.email,
            isAdmin: user.isAdmin,
            username: user.username,
        })
    } catch (error) {}

    return {
        user: 'test user',
    }
}
