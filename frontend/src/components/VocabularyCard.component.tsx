import { useState } from 'react';
import { VocabularyWord } from '../types/vocabulary.type';
import { vocabulary } from '../services/api.service';
import HighlightedExample from './HighlightedExample.component';

interface Props {
    word: VocabularyWord;
    onEdit: (word: VocabularyWord) => void;
    onDelete: (word: VocabularyWord) => void;
    onUpdate: (updatedWord: VocabularyWord) => void;
}

export default function VocabularyCard({ word, onEdit, onDelete, onUpdate }: Props) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingDefinition, setIsGeneratingDefinition] = useState(false);
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

            onUpdate({ ...word, ai_example: aiExample });
        } catch (err) {
            setError('Failed to generate AI example');
            console.error('Generation error:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateDefinition = async () => {
        try {
            setIsGeneratingDefinition(true);
            setError('');

            const { definition } = await vocabulary.generateDefinition(word.word);
            onUpdate({ ...word, definition });
        } catch (err) {
            setError('Failed to generate AI definition');
            console.error('Definition generation error:', err);
        } finally {
            setIsGeneratingDefinition(false);
        }
    };

    return (
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg border border-gray-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-gradient-x" />

            <div className="flex flex-col sm:flex-row justify-between gap-4 relative">
                <div className="flex-grow space-y-3">
                    <h3 className="text-lg font-semibold text-white">{word.word}</h3>

                    <div className="space-y-2">
                        <p className="text-gray-300">{word.definition}</p>
                        <button
                            onClick={handleGenerateDefinition}
                            disabled={isGeneratingDefinition}
                            className={`w-full sm:w-auto px-3 py-2 text-sm rounded-md ${isGeneratingDefinition
                                    ? 'bg-indigo-700/50 opacity-50 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-500'
                                } text-white transition-colors`}
                        >
                            {isGeneratingDefinition ? 'Generating...' : 'Generate Definition'}
                        </button>
                    </div>

                    {word.user_example && (
                        <p className="text-gray-400 italic">Your example: "{word.user_example}"</p>
                    )}

                    {word.ai_example && (
                        <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                            <HighlightedExample text={word.ai_example} word={word.word} />
                        </div>
                    )}

                    {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                    )}
                </div>

                <div className="flex flex-col gap-2 sm:ml-4 min-w-[140px]">
                    <div className="flex sm:flex-col gap-2">
                        <button
                            onClick={() => onEdit(word)}
                            className="flex-1 text-blue-400 hover:text-blue-300 transition-all px-3 py-2 rounded-md hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => onDelete(word)}
                            className="flex-1 text-red-400 hover:text-red-300 transition-all px-3 py-2 rounded-md hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                        >
                            Delete
                        </button>
                    </div>

                    <button
                        onClick={handleGenerateExample}
                        disabled={isGenerating}
                        className={`
                            group
                            relative
                            flex items-center justify-center
                            px-4 py-2.5 rounded-lg
                            font-medium text-base
                            w-full
                            ${isGenerating
                                ? 'bg-indigo-700/50 opacity-50 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
                            }
                            text-white
                            shadow-lg shadow-blue-500/20
                            transform transition-all duration-200
                            hover:scale-105
                            active:scale-95
                        `}
                    >
                        {isGenerating ? 'Generating...' : 'Generate Example'}
                    </button>
                </div>
            </div>
        </div>
    );
}