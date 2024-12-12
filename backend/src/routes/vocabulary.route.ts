import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.ts';
import { 
    getWords, 
    addWord, 
    updateWord, 
    deleteWord 
} from '../controllers/vocabulary.controller.ts';
import * as vocabularyController from '../controllers/vocabulary.controller.ts';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getWords);
router.post('/', addWord);
router.put('/:id', updateWord);
router.delete('/:id', deleteWord);

router.post('/:id/generate-example', vocabularyController.generateAiExample);

export default router;