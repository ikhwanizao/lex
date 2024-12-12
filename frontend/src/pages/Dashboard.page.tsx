import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vocabulary } from '../services/api.service';
import { VocabularyWord, CreateWordData, UpdateWordData } from '../types/vocabulary.type';
import { useState } from 'react';
import VocabularyCard from '../components/VocabularyCard.component';
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog.ui';

export default function Dashboard() {
    const [isAddingWord, setIsAddingWord] = useState(false);
    const [editingWord, setEditingWord] = useState<VocabularyWord | null>(null);
    const [newWord, setNewWord] = useState<CreateWordData>({
        word: '',
        definition: '',
        user_example: '',
    });

    const queryClient = useQueryClient();

    const { data: words, isLoading } = useQuery<VocabularyWord[]>({
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

    const updateWordMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateWordData }) => 
            vocabulary.updateWord(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
        },
    });

    const handleWordUpdate = (updatedWord: VocabularyWord) => {
        // Convert VocabularyWord to UpdateWordData
        const updateData: UpdateWordData = {
            word: updatedWord.word,
            definition: updatedWord.definition,
            user_example: updatedWord.user_example,
            ai_example: updatedWord.ai_example
        };

        // Update the word in the cache immediately
        queryClient.setQueryData(['vocabulary'], (oldData: VocabularyWord[] | undefined) => {
            if (!oldData) return [updatedWord];
            return oldData.map(word => 
                word.id === updatedWord.id ? updatedWord : word
            );
        });

        // Also send to the server
        updateWordMutation.mutate({ 
            id: updatedWord.id, 
            data: updateData 
        });
    };
    
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

    const handleEditWord = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingWord) {
            updateWordMutation.mutate({
                id: editingWord.id,
                data: {
                    word: editingWord.word,
                    definition: editingWord.definition,
                    user_example: editingWord.user_example || '',
                }
            });
        }
    };

    const handleDelete = (word: VocabularyWord) => {
        deleteWordMutation.mutate(word.id);
    };

    if (isLoading) return <div className="text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="max-w-4xl mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-white">My Vocabulary</h1>
                    <button
                        onClick={() => setIsAddingWord(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Add Word
                    </button>
                </div>

                {/* Add Word Form */}
                {isAddingWord && (
                    <form onSubmit={handleAddWord} className="mb-8 p-4 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Word</label>
                                <input
                                    type="text"
                                    value={newWord.word}
                                    onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Definition</label>
                                <textarea
                                    value={newWord.definition}
                                    onChange={(e) => setNewWord({ ...newWord, definition: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Example</label>
                                <textarea
                                    value={newWord.user_example}
                                    onChange={(e) => setNewWord({ ...newWord, user_example: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddingWord(false)}
                                    className="px-4 py-2 text-gray-300 border border-gray-600 rounded-md hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {/* Word List */}
                <div className="grid gap-4">
                    {words?.map((word) => (
                        <div key={word.id} className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
                            {editingWord?.id === word.id ? (
                                <form onSubmit={handleEditWord} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300">Word</label>
                                        <input
                                            type="text"
                                            value={editingWord.word}
                                            onChange={(e) => setEditingWord({
                                                ...editingWord,
                                                word: e.target.value
                                            })}
                                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300">Definition</label>
                                        <textarea
                                            value={editingWord.definition}
                                            onChange={(e) => setEditingWord({
                                                ...editingWord,
                                                definition: e.target.value
                                            })}
                                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300">Example</label>
                                        <textarea
                                            value={editingWord.user_example || ''}
                                            onChange={(e) => setEditingWord({
                                                ...editingWord,
                                                user_example: e.target.value
                                            })}
                                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => setEditingWord(null)}
                                            className="px-4 py-2 text-gray-300 border border-gray-600 rounded-md hover:bg-gray-700"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <VocabularyCard
                                    word={word}
                                    onEdit={setEditingWord}
                                    onDelete={handleDelete}
                                    onUpdate={handleWordUpdate}  // Add this prop
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}