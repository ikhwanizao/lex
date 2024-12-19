import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OLLAMA_API = process.env.OLLAMA_API_URL;
const LLM= process.env.LLM;

interface OllamaResponse {
    model: string;
    response: string;
    done: boolean;
}

export class OllamaService {
    private static instance: OllamaService;

    private constructor() { }

    static getInstance(): OllamaService {
        if (!OllamaService.instance) {
            OllamaService.instance = new OllamaService();
        }
        return OllamaService.instance;
    }

    async generateDefinition(word: string): Promise<string> {
        try {
            const response = await axios.post<OllamaResponse>(`${OLLAMA_API}/generate`, {
                model: LLM,
                prompt: `Define the word "${word}" in simple words. Only give definitions that are different, if they are similar then don't repeat the similar definitions. Keep it short. Format as follows:
                1. First meaning
                2. Second meaning
                etc.
                Keep each definition clear and concise. Provide only the numbered definitions, nothing else. Make sure create new lines between each definition.`,
                stream: false
            });
    
            return response.data.response.trim();
        } catch (error) {
            console.error('Error details:', error);
            throw new Error('Failed to generate AI definition');
        }
    }
    
    async generateExample(word: string, definition: string): Promise<string> {
        try {
            const response = await axios.post<OllamaResponse>(`${OLLAMA_API}/generate`, {
                model: LLM,
                prompt: `Given these definitions for the word "${word}":
                ${definition}
                
                Generate one natural example sentence that shows one of these uses of "${word}". The sentence should be clear and helpful for learning.
                Provide only the example sentence without any quotation marks, nothing else.`,
                stream: false
            });
    
            const example = response.data.response.trim().replace(/^["'](.*)["']$/, '$1');
    
            if (!example.toLowerCase().includes(word.toLowerCase())) {
                return await this.generateExample(word, definition);
            }
    
            return example;
        } catch (error) {
            console.error('Error details:', error);
            throw new Error('Failed to generate AI example');
        }
    }
}