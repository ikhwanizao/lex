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

export interface CreateWordData {
    word: string;
    definition: string;
    user_example?: string;
    ai_example?: string;
}

export interface UpdateWordData {
    word: string;
    definition: string;
    user_example?: string;
    ai_example?: string;
}