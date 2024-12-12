import { useState } from 'react';
import { VocabularyWord } from '../types/vocabulary.type';
import { vocabulary } from '../services/api.service';

interface Props {
    word: VocabularyWord;
    onEdit: (word: VocabularyWord) => void;
    onDelete: (word: VocabularyWord) => void;
    onUpdate: (updatedWord: VocabularyWord) => void;  // Add this prop
}

export default function VocabularyCard({ word, onEdit, onDelete, onUpdate }: Props) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateExample = async () => {
        try {
            setIsGenerating(true);
            setError('');
            
            const { aiExample } = await vocabulary.generateAiExample(
                word.id,
                word.word,
                word.definition
            );

            // Update the parent component with the new data
            onUpdate({ ...word, ai_example: aiExample });
        } catch (err) {
            setError('Failed to generate AI example');
            console.error('Generation error:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold text-white">{word.word}</h3>
                    <p className="text-gray-300 mt-1">{word.definition}</p>
                    {word.user_example && (
                        <p className="text-gray-400 mt-2 italic">Your example: "{word.user_example}"</p>
                    )}
                    {word.ai_example && (
                        <p className="text-blue-400 mt-2 italic">AI example: "{word.ai_example}"</p>
                    )}
                    {error && (
                        <p className="text-red-400 mt-2 text-sm">{error}</p>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={handleGenerateExample}
                        disabled={isGenerating}
                        className={`text-blue-400 hover:text-blue-300 transition-colors px-3 py-1 rounded-md ${
                            isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'
                        }`}
                    >
                        {isGenerating ? 'Generating...' : 'Generate Example'}
                    </button>
                    <button
                        onClick={() => onEdit(word)}
                        className="text-blue-400 hover:text-blue-300 transition-colors px-3 py-1 rounded-md hover:bg-gray-700"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(word)}
                        className="text-red-400 hover:text-red-300 transition-colors px-3 py-1 rounded-md hover:bg-gray-700"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}