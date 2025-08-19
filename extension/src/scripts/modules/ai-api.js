// xMatic - AI API Handler
class AIAPIHandler {
    constructor(config) {
        this.config = config;
    }

    async generateReply(context) {
        const systemPrompt = `You are an expert at crafting engaging Twitter/X replies. Follow these rules strictly:
1. Keep responses under 280 characters - be concise and to the point
2. Never use double quotes (") in your response.
3. Never use (—) in your response.
4. NEVER use @ symbols (@) in your response - this could accidentally tag other users
5. Match the user's requested style: ${this.config.style || 'conversational and helpful'}
6. Use proper Twitter etiquette - mentions, hashtags, and emojis when appropriate
7. Never include any meta-commentary like "Here's a reply:" or "I would say:" - just provide the reply
8. If the tweet is a question, directly answer it
9. If it's an opinion, respond with a thoughtful reaction
10. If it's a joke, respond in kind with humor`;

        const userPrompt = `Craft a Twitter reply to this tweet. Follow all system instructions carefully. Make it sound natural and engaging.

Tweet Details:
- Content: ${context.mainTweet}
- Author: ${context.authorName}
- Engagement: ${context.engagementData.likes || 0} likes, ${context.engagementData.retweets || 0} retweets, ${context.engagementData.replies || 0} replies, ${context.engagementData.quotes || 0} quotes

Consider the author's influence and the tweet's engagement level when crafting your response.`;

        const selectedModel = this.config.selectedModel || 'gpt-4';
        const selectedProvider = this.config.selectedProvider || 'openai';

        // Determine API endpoint and key based on selected provider
        let apiEndpoint, apiKey, headers;
        
        if (selectedProvider === 'grok') {
            apiEndpoint = 'https://api.x.ai/v1/chat/completions';
            apiKey = this.config.grokKey;
            if (!apiKey) {
                throw new Error('Grok API key not configured');
            }
            headers = {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };
        } else {
            // Default to OpenAI
            apiEndpoint = 'https://api.openai.com/v1/chat/completions';
            apiKey = this.config.openaiKey;
            if (!apiKey) {
                throw new Error('OpenAI API key not configured');
            }
            headers = {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            };
        }
        
        const requestBody = {
            model: selectedModel,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            stream: false,
            temperature: 0.7
        };
        
        // Add OpenAI-specific parameters only for OpenAI
        if (selectedProvider === 'openai') {
            requestBody.max_tokens = 100;
            requestBody.top_p = 0.9;
            requestBody.frequency_penalty = 0.5;
            requestBody.presence_penalty = 0.3;
        }

        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        
        if (data.error) {
            const providerName = selectedProvider === 'grok' ? 'Grok' : 'OpenAI';
            throw new Error(`${providerName} Error: ${data.error.message}`);
        }

        return data.choices?.[0]?.message?.content || '';
    }

    // Method to update configuration
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIAPIHandler;
}

// Export for use in browser environment
if (typeof window !== 'undefined') {
    window.AIAPIHandler = AIAPIHandler;
    console.log('xMatic: 🚀 AIAPIHandler exported to window object');
}
