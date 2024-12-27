import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { OllamaService } from '../services/ollama.service.js';

type RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<void>;

export const getWords: RequestHandler = async (req, res, next) => {
    try {
        const words = await prisma.vocabulary.findMany({
            where: {
                user_id: req.user?.id
            },
            orderBy: {
                created_at: 'desc'
            }
        });
        res.json(words);
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

        const newWord = await prisma.vocabulary.create({
            data: {
                word,
                definition: definition || '',
                user_example: user_example || null,
                ai_example: ai_example || null,
                users: {
                    connect: { id: req.user?.id }
                }
            }
        });

        res.status(201).json(newWord);
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

        const updatedWord = await prisma.vocabulary.updateMany({
            where: {
                id: parseInt(id),
                user_id: req.user?.id
            },
            data: {
                word,
                definition: definition || '',
                user_example: user_example || null,
                ai_example: ai_example || null
            }
        });

        if (!updatedWord.count) {
            res.status(404).json({ error: 'Word not found or unauthorized' });
            return;
        }

        const word_data = await prisma.vocabulary.findFirst({
            where: {
                id: parseInt(id),
                user_id: req.user?.id
            }
        });

        res.json(word_data);
    } catch (error) {
        next(error);
    }
};

export const deleteWord: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedWord = await prisma.vocabulary.deleteMany({
            where: {
                id: parseInt(id),
                user_id: req.user?.id
            }
        });

        if (!deletedWord.count) {
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

        if (!definition) {
            res.status(400).json({ error: 'Definition is required' });
            return;
        }

        const updatedWord = await prisma.vocabulary.updateMany({
            where: {
                id: parseInt(id),
                user_id: req.user?.id
            },
            data: {
                definition
            }
        });

        if (!updatedWord.count) {
            res.status(404).json({ error: 'Word not found or unauthorized' });
            return;
        }

        const word_data = await prisma.vocabulary.findFirst({
            where: {
                id: parseInt(id),
                user_id: req.user?.id
            }
        });

        res.json(word_data);
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

        const updatedWord = await prisma.vocabulary.updateMany({
            where: {
                id: parseInt(id),
                user_id: req.user?.id
            },
            data: {
                ai_example: aiExample
            }
        });

        if (!updatedWord.count) {
            res.status(404).json({ error: 'Word not found' });
            return;
        }

        res.json({ aiExample });
    } catch (error) {
        next(error);
    }
};