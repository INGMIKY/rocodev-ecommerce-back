import express from 'express'
import {
    createProduct,
    deleteProduct,
    getAllProducts,
    getProductById,
    updateProduct,
} from '../controllers/productsControllers.js'

const router = express.Router()

// Rutas publicas
router.get('/', getAllProducts)

router.get('/:id', getProductById)

// Rutas protegidas (solo administradores puede modificar productos)
router.post('/', createProduct) // Crear producto

router.put('/:id', updateProduct) // Actualizar un producto

router.delete('/:id', deleteProduct) // Eliminar un producto

export default router
