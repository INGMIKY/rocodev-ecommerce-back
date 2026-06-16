import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trime: true, //NO espacios en los laterales
        minLength: 6,
        maxLength: 254,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 6,
        maxLenght: 254,
    },
    username: {
        type: String,
        default: '',
        required: true,
        trimg: true,
        minLength: 3,
        maxLenght: 20,
    },
    isAdmin: {
        type: Boolean,
        default: false,
        required: true,
    },
})

export default mongoose.model('User', UserSchema)
