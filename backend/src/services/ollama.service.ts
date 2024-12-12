import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OLLAMA_API = process.env.OLLAMA_API_URL;

interface OllamaResponse {
    model: string;
    response: string;
    done: boolean;
}

export class OllamaService {
    private static instance: OllamaService;

    private constructor() {}

    static getInstance(): OllamaService {
        if (!OllamaService.instance) {
            OllamaService.instance = new OllamaService();
        }
        return OllamaService.instance;
    }

    async generateExample(word: string, definition: string): Promise<string> {
        try {
            const response = await axios.post<OllamaResponse>(`${OLLAMA_API}/generate`, {
                model: "mistral",
                prompt: `Given the word "${word}" which means "${definition}", generate one natural example sentence that MUST use the exact word "${word}". The sentence should demonstrate proper usage and help understand the meaning. Provide only the example sentence without any quotation marks, nothing else.`,
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