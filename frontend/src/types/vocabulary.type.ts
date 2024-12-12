// Database/API response type
export interface VocabularyWord {
    id: number;
    user_id: number;
    word: string;
    definition: string;
    user_example: string | null;
    ai_example: string | null;
    created_at: string;
    updated_at: string;
}

// Type for creating a new word
export interface CreateWordData {
    word: string;
    definition: string;
    user_example?: string;
    ai_example?: string;
}

// Type for updating an existing word
export interface UpdateWordData {
    word: string;
    definition: string;
    user_example?: string | null;
    ai_example?: string | null;
}