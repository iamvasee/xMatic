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

    // Method to generate multiple replies
    async generateMultipleReplies(context, count) {
        console.log('xMatic: 🚀 AI API - Generating', count, 'replies in single API call for context:', context);
        
        const systemPrompt = `You are an expert at crafting engaging Twitter/X replies. Generate exactly ${count} unique and diverse replies to the given context.

IMPORTANT: Return your response as a valid JSON array of strings, where each string is a different reply. Each reply must be:
1. Under 280 characters
2. Unique and different from the others
3. Engaging and relevant to the context
4. Following Twitter best practices

Example response format:
["First unique reply here", "Second unique reply here", "Third unique reply here"]

Rules for each reply:
1. Keep responses under 280 characters - be concise and to the point
2. Never use double quotes (") in your response.
3. Never use (—) in your response.
4. NEVER use @ symbols (@) in your response - this could accidentally tag other users
5. Match the user's requested style: ${this.config.style || 'conversational and helpful'}
6. Use proper Twitter etiquette - mentions, hashtags, and emojis when appropriate
7. Never include any meta-commentary like "Here's a reply:" or "I would say:" - just provide the reply

Make each reply genuinely different - vary the tone, approach, hashtags, and emojis used.`;

        const userPrompt = `Generate exactly ${count} unique Twitter replies to this context:

${context}

Return ONLY a valid JSON array of ${count} strings, no other text.`;

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
            temperature: 0.8 // Higher temperature for more variety
        };
        
        // Add OpenAI-specific parameters only for OpenAI
        if (selectedProvider === 'openai') {
            requestBody.max_tokens = 150 * count; // Allocate tokens for all replies
            requestBody.top_p = 0.9;
            requestBody.frequency_penalty = 0.8; // Increase variety
            requestBody.presence_penalty = 0.6;
        }

        console.log('xMatic: 🚀 AI API - Making single API call for', count, 'replies...');
        
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

        const content = data.choices?.[0]?.message?.content || '';
        console.log('xMatic: 🚀 AI API - Raw response received:', content.substring(0, 100) + '...');
        
        // Parse JSON response
        try {
            const replies = JSON.parse(content);
            
            if (!Array.isArray(replies)) {
                throw new Error('Response is not an array');
            }
            
            if (replies.length !== count) {
                console.warn(`xMatic: 🚀 AI API - Expected ${count} replies, got ${replies.length}`);
            }
            
            // Validate and clean each reply
            const validReplies = replies
                .filter(reply => typeof reply === 'string' && reply.trim().length > 0)
                .map(reply => reply.trim())
                .slice(0, count);
            
            console.log('xMatic: 🚀 AI API - Successfully parsed', validReplies.length, 'unique replies');
            return validReplies;
            
        } catch (parseError) {
            console.error('xMatic: 🚀 AI API - JSON parsing failed:', parseError);
            console.log('xMatic: 🚀 AI API - Attempting to extract replies from text...');
            
            // Fallback: try to extract individual replies from text
            return this.extractRepliesFromText(content, count);
        }
    }

    extractRepliesFromText(text, expectedCount) {
        // Fallback method to extract replies if JSON parsing fails
        console.log('xMatic: 🚀 AI API - Using fallback text extraction...');
        
        // Split by common delimiters and clean up
        const possibleDelimiters = ['\n\n', '\n', '. ', '! ', '? '];
        let replies = [];
        
        for (const delimiter of possibleDelimiters) {
            replies = text.split(delimiter)
                .map(reply => reply.trim())
                .filter(reply => reply.length > 10 && reply.length < 300)
                .slice(0, expectedCount);
            
            if (replies.length >= expectedCount) {
                break;
            }
        }
        
        // If we still don't have enough, create variations
        while (replies.length < expectedCount) {
            const baseReply = replies[replies.length % replies.length] || 'Great insights! Thanks for sharing.';
            const variation = this.createVariation(baseReply);
            replies.push(variation);
        }
        
        console.log('xMatic: 🚀 AI API - Fallback extraction yielded', replies.length, 'replies');
        return replies.slice(0, expectedCount);
    }

    createVariation(baseReply) {
        // Create a variation of a base reply
        const variations = [
            baseReply.replace(/!/g, '?'),
            baseReply.replace(/\./g, '!'),
            baseReply + ' 🚀',
            '💡 ' + baseReply,
            baseReply.replace(/Thanks/g, 'Appreciate'),
            baseReply.replace(/Great/g, 'Excellent')
        ];
        
        return variations[Math.floor(Math.random() * variations.length)];
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
