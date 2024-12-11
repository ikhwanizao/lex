import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.ts';
import { 
    getWords, 
    addWord, 
    updateWord, 
    deleteWord 
} from '../controllers/vocabularyController.ts';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getWords);
router.post('/', addWord);
router.put('/:id', updateWord);
router.delete('/:id', deleteWord);

export default router;