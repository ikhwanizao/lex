import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database.config.js';
import { OllamaService } from '../services/ollama.service.js';

type RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<void>;

export const getWords: RequestHandler = async (req, res, next) => {
    try {
        const result = await query(
            'SELECT * FROM vocabulary WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user?.id]
        );
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
};

export const addWord: RequestHandler = async (req, res, next) => {
    try {
        const { word, definition, user_example, ai_example } = req.body;

        if (!word) {
            res.status(400).json({ error: 'Word is required' });
            return;
        }

        const result = await query(
            'INSERT INTO vocabulary (user_id, word, definition, user_example, ai_example) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.user?.id, word, definition || null, user_example, ai_example]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

export const updateWord: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { word, definition, user_example, ai_example } = req.body;

        if (!word) {
            res.status(400).json({ error: 'Word is required' });
            return;
        }

        const existingWord = await query(
            'SELECT ai_example FROM vocabulary WHERE id = $1 AND user_id = $2',
            [id, req.user?.id]
        );

        const finalAiExample = ai_example !== undefined ? ai_example : existingWord.rows[0]?.ai_example;

        const result = await query(
            'UPDATE vocabulary SET word = $1, definition = $2, user_example = $3, ai_example = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 AND user_id = $6 RETURNING *',
            [word, definition || null, user_example, finalAiExample, id, req.user?.id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Word not found or unauthorized' });
            return;
        }

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

export const deleteWord: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await query(
            'DELETE FROM vocabulary WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user?.id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Word not found or unauthorized' });
            return;
        }

        res.json({ message: 'Word deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const generateDefinition: RequestHandler = async (req, res, next): Promise<void> => {
    try {
        const { word } = req.body;

        if (!word) {
            res.status(400).json({ error: 'Word is required' });
            return;
        }

        const ollama = OllamaService.getInstance();
        const definition = await ollama.generateDefinition(word);

        res.json({ definition });
    } catch (error) {
        next(error);
    }
};

export const updateDefinition: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { definition } = req.body;

        const result = await query(
            'UPDATE vocabulary SET definition = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
            [definition, id, req.user?.id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Word not found or unauthorized' });
            return;
        }

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

export const generateAiExample: RequestHandler = async (req, res, next): Promise<void> => {
    try {
        const { id } = req.params;
        const { word, definition } = req.body;

        if (!word || !definition) {
            res.status(400).json({ error: 'Word and definition are required' });
            return;
        }

        const ollama = OllamaService.getInstance();
        const aiExample = await ollama.generateExample(word, definition);

        const result = await query(
            'UPDATE vocabulary SET ai_example = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [aiExample, id, req.user?.id]
        );

        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Word not found' });
            return;
        }

        res.json({ aiExample });
    } catch (error) {
        next(error);
    }
};