import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
    getWords, 
    addWord, 
    updateWord, 
    deleteWord 
} from '../controllers/vocabularyController';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getWords);
router.post('/', addWord);
router.put('/:id', updateWord);
router.delete('/:id', deleteWord);

export default router;