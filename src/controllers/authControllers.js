import { registerSchema, loginSchema } from '../schemas/authSchema.js'
import UserModel from '../models/UserModel.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { ZodError } from 'zod'

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

export const loginUser = async (req, res) => {
    try {
        // Obtener la clave secreta del entorno
        const JWT_SECRET = process.env.JWT_SECRET

        // Extraer el email y contraseña del cuerpo de la peticion
        // además validarlo
        const { email, password } = loginSchema.parse(req.body)

        // Buscar el usuario por email
        const user = await UserModel.findOne({ email })

        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas' })
        }

        // Comparar las contraseñas
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Credenciales inválidas' })
        }

        // Generar un token con JWT
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET,
            {
                expiresIn: '1h',
            }
        )

        const userData = {
            id: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
        }

        res.cookie('accesToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 60 * 60 * 1000,
        })
            .status(200)
            .json(userData)
    } catch (error) {
        if (error instanceof ZodError) {
            return res
                .status(400)
                .json(error.issues.map((issue) => ({ message: issue.message })))
        }

        res.status(500).json({ message: 'Error al iniciar sesión', error })
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

        res.status(200).json({
            id: user._id,
            email: user.email,
            isAdmin: user.isAdmin,
            username: user.username,
        })
    } catch (error) {
        res.status(401).json({ message: 'No autorizado' })
    }

    return {
        user: 'test user',
    }
}

export const logout = async (req, res) => {
    res.clearCookie('accesToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    })
        .status(200)
        .json({ message: 'Cierre de sesión éxitoso' })
}
