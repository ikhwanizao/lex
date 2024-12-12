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

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 relative overflow-hidden">
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-gradient-x" />

            <div className="flex justify-between items-start relative">
                <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-white">{word.word}</h3>
                    <p className="text-gray-300 mt-1">{word.definition}</p>
                    {word.user_example && (
                        <p className="text-gray-400 mt-2 italic">Your example: "{word.user_example}"</p>
                    )}
                    {word.ai_example && (
                        <div className="mt-2 bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                            <HighlightedExample text={word.ai_example} word={word.word} />
                        </div>
                    )}
                    {error && (
                        <p className="text-red-400 mt-2 text-sm">{error}</p>
                    )}
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                    <button
                        onClick={handleGenerateExample}
                        disabled={isGenerating}
                        className={`
                            group
                            relative
                            flex items-center justify-center
                            px-4 py-2.5 rounded-lg
                            font-medium text-base
                            min-w-[160px]
                            ${isGenerating
                                ? 'bg-indigo-700/50 opacity-50 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
                            }
                            text-white
                            shadow-lg shadow-blue-500/20
                            transform transition-all duration-200
                            hover:scale-105
                            active:scale-95
                            overflow-hidden
                            border border-white/10
                            after:absolute
                            after:inset-0
                            after:bg-gradient-to-r
                            after:from-transparent
                            after:via-white/25
                            after:to-transparent
                            after:-translate-x-full
                            after:animate-shimmer
                            after:hover:animate-shimmer-fast
                        `}
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/30 to-indigo-400/0 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />

                        {/* Button content */}
                        <div className="relative flex items-center">
                            {isGenerating ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="animate-pulse">Generating...</span>
                                </>
                            ) : (
                                <>
                                    <svg
                                        className="w-5 h-5 mr-2 text-blue-200 animate-pulse group-hover:animate-bounce"
                                        fill="none"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Generate Example
                                </>
                            )}
                        </div>
                    </button>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onEdit(word)}
                            className="flex-1 text-blue-400 hover:text-blue-300 transition-all px-3 py-1.5 rounded-md hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => onDelete(word)}
                            className="flex-1 text-red-400 hover:text-red-300 transition-all px-3 py-1.5 rounded-md hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}