import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { 
    getWords, 
    addWord, 
    updateWord, 
    deleteWord 
} from '../controllers/vocabulary.controller.js';
import * as vocabularyController from '../controllers/vocabulary.controller.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getWords);
router.post('/', addWord);
router.put('/:id', updateWord);
router.delete('/:id', deleteWord);

router.post('/generate-definition', vocabularyController.generateDefinition);
router.put('/:id/definition', vocabularyController.updateDefinition);
router.post('/:id/generate-example', vocabularyController.generateAiExample);

export default router;