import express from 'express';
import multer from 'multer';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { importProducts } from '../controllers/importController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/import', upload.single('file'), importProducts);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
