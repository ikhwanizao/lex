import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vocabulary } from '../services/api.service';
import { VocabularyWord, CreateWordData, UpdateWordData } from '../types/vocabulary.type';
import { useState } from 'react';
import VocabularyCard from '../components/VocabularyCard.component';
import LoadingSpinner from '../components/LoadingSpinner.component';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../components/ui/alert-dialog.ui';

export default function Dashboard() {
    const [isAddingWord, setIsAddingWord] = useState(false);
    const [editingWord, setEditingWord] = useState<VocabularyWord | null>(null);
    const [wordToDelete, setWordToDelete] = useState<VocabularyWord | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showDiscardDialog, setShowDiscardDialog] = useState(false);
    const [isGeneratingDefinition, setIsGeneratingDefinition] = useState(false);
    const [error, setError] = useState<string | null>(null);
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
            setError(null);
        },
        onError: (error: { response?: { data?: { error?: string } } }) => {
            setError(error.response?.data?.error || 'Failed to add word');
        }
    });

    const updateWordMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateWordData }) =>
            vocabulary.updateWord(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
            setEditingWord(null);
            setHasUnsavedChanges(false);
            setError(null);
        },
        onError: (error: { response?: { data?: { error?: string } } }) => {
            setError(error.response?.data?.error || 'Failed to update word');
        }
    });

    const deleteWordMutation = useMutation({
        mutationFn: vocabulary.deleteWord,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
            setWordToDelete(null);
            setError(null);
        },
        onError: (error: { response?: { data?: { error?: string } } }) => {
            setError(error.response?.data?.error || 'Failed to delete word');
        }
    });

    const handleGenerateDefinition = async () => {
        try {
            setIsGeneratingDefinition(true);
            setError(null);
            const { definition } = await vocabulary.generateDefinition(newWord.word);
            setNewWord(prev => ({ ...prev, definition }));
        } catch {
            setError('Failed to generate definition');
        } finally {
            setIsGeneratingDefinition(false);
        }
    };

    const handleAddWord = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWord.word.trim()) {
            setError('Word is required');
            return;
        }
        addWordMutation.mutate(newWord);
    };

    const handleEditWord = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingWord) {
            if (!editingWord.word.trim()) {
                setError('Word is required');
                return;
            }
            updateWordMutation.mutate({
                id: editingWord.id,
                data: {
                    word: editingWord.word,
                    definition: editingWord.definition || null,
                    user_example: editingWord.user_example || '',
                    ai_example: editingWord.ai_example
                }
            });
        }
    };

    const handleCancelEdit = () => {
        if (hasUnsavedChanges) {
            setShowDiscardDialog(true);
        } else {
            setEditingWord(null);
        }
    };

    const handleInputChange = (field: keyof VocabularyWord, value: string) => {
        if (editingWord) {
            setEditingWord({ ...editingWord, [field]: value });
            setHasUnsavedChanges(true);
        }
    };

    const handleDelete = (word: VocabularyWord) => {
        setWordToDelete(word);
    };

    const confirmDelete = () => {
        if (wordToDelete) {
            deleteWordMutation.mutate(wordToDelete.id);
        }
    };

    const handleWordUpdate = (updatedWord: VocabularyWord) => {
        queryClient.setQueryData(['vocabulary'], (oldData: VocabularyWord[] | undefined) => {
            if (!oldData) return [updatedWord];
            return oldData.map(word =>
                word.id === updatedWord.id ? updatedWord : word
            );
        });
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="max-w-4xl mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-white">My Vocabulary</h1>
                    <button
                        onClick={() => setIsAddingWord(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Add Word
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-red-300">
                        {error}
                    </div>
                )}

                {/* Add Word Form */}
                {isAddingWord && (
                    <form onSubmit={handleAddWord} className="mb-8 p-4 sm:p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                        <div className="space-y-4">
                            {/* Word Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300">
                                    <span className="flex items-center gap-2">
                                        Word <span className="text-red-500">*</span>
                                        <span className="text-gray-400 text-xs">Required</span>
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={newWord.word}
                                    onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                    required
                                />
                            </div>

                            {/* Definition Input */}
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                                    <label className="block text-sm font-medium text-gray-300">
                                        <span className="flex items-center gap-2">
                                            Definition
                                            <span className="text-gray-400 text-xs">Optional</span>
                                        </span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleGenerateDefinition}
                                        disabled={!newWord.word.trim() || isGeneratingDefinition}
                                        className={`text-sm px-3 py-1.5 rounded-md transition-colors w-full sm:w-auto ${!newWord.word.trim() || isGeneratingDefinition
                                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                    >
                                        {isGeneratingDefinition ? 'Generating...' : 'Generate Definition'}
                                    </button>
                                </div>
                                <textarea
                                    value={newWord.definition || ''}
                                    onChange={(e) => setNewWord({ ...newWord, definition: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                    rows={3}
                                />
                            </div>

                            {/* Example Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300">
                                    <span className="flex items-center gap-2">
                                        Example
                                        <span className="text-gray-400 text-xs">Optional</span>
                                    </span>
                                </label>
                                <textarea
                                    value={newWord.user_example || ''}
                                    onChange={(e) => setNewWord({ ...newWord, user_example: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                    rows={2}
                                />
                            </div>

                            {/* Form Buttons */}
                            <div className="flex flex-col sm:flex-row justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddingWord(false);
                                        setNewWord({ word: '', definition: '', user_example: '' });
                                        setError(null);
                                    }}
                                    className="w-full sm:w-auto px-4 py-2 text-gray-300 border border-gray-600 rounded-md hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newWord.word.trim()}
                                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={!!wordToDelete} onOpenChange={() => setWordToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Word</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete "{wordToDelete?.word}"? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmDelete}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Discard Changes Dialog */}
                <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Discard Changes</AlertDialogTitle>
                            <AlertDialogDescription>
                                You have unsaved changes. Are you sure you want to discard them?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    setEditingWord(null);
                                    setHasUnsavedChanges(false);
                                    setShowDiscardDialog(false);
                                }}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Discard Changes
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Word List */}
                <div className="grid gap-4">
                    {words?.map((word) => (
                        <div key={word.id}>
                            {editingWord?.id === word.id ? (
                                <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
                                    <form onSubmit={handleEditWord} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">
                                                Word <span className="text-red-500">*</span>
                                                <span className="text-gray-400 text-xs ml-2">Required</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={editingWord.word}
                                                onChange={(e) => handleInputChange('word', e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">
                                                Definition
                                                <span className="text-gray-400 text-xs ml-2">Optional</span>
                                            </label>
                                            <textarea
                                                value={editingWord.definition || ''}
                                                onChange={(e) => handleInputChange('definition', e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                rows={3}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">
                                                Example
                                                <span className="text-gray-400 text-xs ml-2">Optional</span>
                                            </label>
                                            <textarea
                                                value={editingWord.user_example || ''}
                                                onChange={(e) => handleInputChange('user_example', e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                rows={2}
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                className="px-4 py-2 text-gray-300 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={!editingWord.word.trim()}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-600/50 disabled:cursor-not-allowed"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <VocabularyCard
                                    word={word}
                                    onEdit={setEditingWord}
                                    onDelete={handleDelete}
                                    onUpdate={handleWordUpdate}
                                />
                            )}
                        </div>
                    ))}

                    {words?.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-gray-400 text-lg">
                                No words added yet. Click the "Add Word" button to get started!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}