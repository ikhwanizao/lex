import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vocabulary } from '../services/api';
import { VocabularyWord } from '../types/vocabulary';
import { useState } from 'react';

export default function Dashboard() {
    const [isAddingWord, setIsAddingWord] = useState(false);
    const [newWord, setNewWord] = useState({
        word: '',
        definition: '',
        user_example: '',
    });

    const queryClient = useQueryClient();

    const { data: words, isLoading } = useQuery({
        queryKey: ['vocabulary'],
        queryFn: vocabulary.getWords
    });

    const addWordMutation = useMutation({
        mutationFn: vocabulary.addWord,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
            setIsAddingWord(false);
            setNewWord({ word: '', definition: '', user_example: '' });
        },
    });
    
    const deleteWordMutation = useMutation({
        mutationFn: vocabulary.deleteWord,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
        },
    });

    const handleAddWord = (e: React.FormEvent) => {
        e.preventDefault();
        addWordMutation.mutate(newWord);
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Vocabulary</h1>
                <button
                    onClick={() => setIsAddingWord(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Add Word
                </button>
            </div>

            {isAddingWord && (
                <form onSubmit={handleAddWord} className="mb-8 p-4 bg-white rounded-lg shadow">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Word</label>
                            <input
                                type="text"
                                value={newWord.word}
                                onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Definition</label>
                            <textarea
                                value={newWord.definition}
                                onChange={(e) => setNewWord({ ...newWord, definition: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Example</label>
                            <textarea
                                value={newWord.user_example}
                                onChange={(e) => setNewWord({ ...newWord, user_example: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => setIsAddingWord(false)}
                                className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </form>
            )}

            <div className="grid gap-4">
                {words?.map((word: VocabularyWord) => (
                    <div key={word.id} className="bg-white p-4 rounded-lg shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold">{word.word}</h3>
                                <p className="text-gray-600 mt-1">{word.definition}</p>
                                {word.user_example && (
                                    <p className="text-gray-500 mt-2 italic">"{word.user_example}"</p>
                                )}
                            </div>
                            <button
                                onClick={() => deleteWordMutation.mutate(word.id)}
                                className="text-red-500 hover:text-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}