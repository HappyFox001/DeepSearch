// 定义响应数据的接口
interface SearchResponse {
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

// 定义查询请求的接口
interface QueryRequest {
    user_input: string;
}

class TypewriterEffect {
    private element: HTMLElement;
    private speed: number;
    private currentText: string = '';
    private isTyping: boolean = false;

    constructor(element: HTMLElement, speed: number = 50) {
        this.element = element;
        this.speed = speed;
    }

    async typeText(text: string): Promise<void> {
        if (this.isTyping) {
            return;
        }

        this.isTyping = true;
        this.currentText = '';
        this.element.textContent = '';

        for (let char of text) {
            this.currentText += char;
            this.element.textContent = this.currentText;
            await new Promise(resolve => setTimeout(resolve, this.speed));
        }

        this.isTyping = false;
    }

    stop(): void {
        this.isTyping = false;
    }

    clear(): void {
        this.currentText = '';
        this.element.textContent = '';
    }
}

class InformationSearchAPI {
    private baseUrl: string;

    constructor(baseUrl: string = 'http://localhost:8001') {
        this.baseUrl = baseUrl;
    }

    /**
     * 发送查询请求到API并使用打字机效果显示结果
     * @param userInput 用户输入的查询文本
     * @param elements 显示结果的HTML元素映射
     */
    async sendQueryWithTypewriter(
        userInput: string,
        elements: {
            originalQuestion: HTMLElement;
            refinedQuestions: HTMLElement;
            searchResults: HTMLElement;
            refinedThinkingProcess: HTMLElement;
            thinkingProcess: HTMLElement;
            finalAnswer: HTMLElement;
            citations: HTMLElement;
        }
    ): Promise<void> {
        try {
            const response = await this.sendQuery(userInput);
            
            if (response.status === 'success') {
                // 创建打字机效果实例
                const typewriters = {
                    originalQuestion: new TypewriterEffect(elements.originalQuestion),
                    refinedQuestions: new TypewriterEffect(elements.refinedQuestions),
                    searchResults: new TypewriterEffect(elements.searchResults),
                    refinedThinkingProcess: new TypewriterEffect(elements.refinedThinkingProcess),
                    thinkingProcess: new TypewriterEffect(elements.thinkingProcess),
                    finalAnswer: new TypewriterEffect(elements.finalAnswer),
                    citations: new TypewriterEffect(elements.citations)
                };

                // 按顺序显示每个部分
                await typewriters.originalQuestion.typeText(`原始问题：\n${response.original_question}`);
                await typewriters.refinedQuestions.typeText(`细化问题：\n${response.refined_questions.join('\n')}`);
                await typewriters.searchResults.typeText(`搜索结果：\n${response.search_results.join('\n\n')}`);
                await typewriters.refinedThinkingProcess.typeText(`问题分析：\n${response.refined_thinking_process}`);
                await typewriters.thinkingProcess.typeText(`思维过程：\n${response.thinking_process}`);
                await typewriters.finalAnswer.typeText(`最终答案：\n${response.final_answer}`);
                
                if (response.citations && response.citations.length > 0) {
                    await typewriters.citations.typeText(`引用来源：\n${response.citations.join('\n')}`);
                }
            } else {
                throw new Error(response.error || '查询失败');
            }
        } catch (error) {
            console.error('Error processing query:', error);
            throw error;
        }
    }

    /**
     * 发送查询请求到API
     * @param userInput 用户输入的查询文本
     * @returns Promise<SearchResponse> 查询结果
     */
    private async sendQuery(userInput: string): Promise<SearchResponse> {
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

    /**
     * 检查API服务是否正常运行
     * @returns Promise<boolean> API是否正常运行
     */
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

// 使用示例
async function example() {
    const api = new InformationSearchAPI();
    
    // 检查API健康状态
    const isHealthy = await api.checkHealth();
    console.log('API健康状态:', isHealthy);

    if (isHealthy) {
        try {
            // 发送查询
            const elements = {
                originalQuestion: document.getElementById('original-question') as HTMLElement,
                refinedQuestions: document.getElementById('refined-questions') as HTMLElement,
                searchResults: document.getElementById('search-results') as HTMLElement,
                refinedThinkingProcess: document.getElementById('refined-thinking-process') as HTMLElement,
                thinkingProcess: document.getElementById('thinking-process') as HTMLElement,
                finalAnswer: document.getElementById('final-answer') as HTMLElement,
                citations: document.getElementById('citations') as HTMLElement
            };
            
            await api.sendQueryWithTypewriter('你的问题', elements);
        } catch (error) {
            console.error('处理查询时出错:', error);
        }
    }
}

export { InformationSearchAPI, TypewriterEffect, type SearchResponse, type QueryRequest };
