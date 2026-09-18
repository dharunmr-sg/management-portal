import express from 'express';
import multer from 'multer';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { importUsers } from '../controllers/importController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/import', upload.single('file'), importUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
