export interface SearchResponse {
    status: 'success' | 'error';
    original_question: string;
    refined_questions: string[];
    search_results: string[];
    refined_thinking_process: string;
    thinking_process: string;
    final_answer: string;
    citations?: string[];
    timestamp: string;
    error?: string;
}

export interface QueryRequest {
    user_input: string;
}

export class InformationSearchAPI {
    private baseUrl: string;

    constructor(baseUrl: string = 'http://localhost:8001') {
        this.baseUrl = baseUrl;
    }

    async sendQuery(userInput: string): Promise<SearchResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_input: userInput } as QueryRequest)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'API request failed');
            }

            const data: SearchResponse = await response.json();
            return data;
        } catch (error) {
            console.error('Error sending query:', error);
            throw error;
        }
    }

    async checkHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/`);
            const data = await response.json();
            return data.status === 'ok';
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }
}
