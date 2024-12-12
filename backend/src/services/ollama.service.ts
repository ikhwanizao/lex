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
            // console.log('Sending request to Ollama...');
            const response = await axios.post<OllamaResponse>(`${OLLAMA_API}/generate`, {
                model: "llama3.2",
                prompt: `Given the word "${word}" which means "${definition}", generate one natural example sentence using this word. The sentence should demonstrate proper usage and help understand the meaning. Provide only the example sentence, nothing else.`,
                stream: false
            });

            // console.log('Ollama response:', response.data); 
            return response.data.response.trim();
        } catch (error) {
            console.error('Error details:', error);
            throw new Error('Failed to generate AI example');
        }
    }
}