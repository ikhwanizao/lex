interface TimeStamps {
    created_at: Date;
    updated_at: Date;
  }
  
  export interface DbUser extends TimeStamps {
    id: number;
    email: string;
    username: string;
    password_hash: string;
    reset_token_hash?: string;
    reset_token_expires?: Date;
  }
  
  export interface DbVocabulary extends TimeStamps {
    id: number;
    user_id: number;
    word: string;
    definition: string;
    user_example?: string;
    ai_example?: string;
  }