// xMatic - AI API Handler
class AIAPIHandler {
    constructor(config) {
        this.config = config;
        // Style instruction mapping for precise AI guidance
        this.styleInstructions = {
            'professional': 'Write in a formal, business-like, and authoritative tone. Use professional language, avoid slang, and maintain a serious, credible voice.',
            'casual': 'Write in a friendly, relaxed, and approachable manner. Use conversational language, feel free to use contractions and friendly expressions.',
            'humorous': 'Write with wit, playfulness, and entertainment. Include clever jokes, puns, or humorous observations while staying engaging.',
            'analytical': 'Write with detailed, logical, and data-driven approach. Present facts clearly, use structured thinking, and provide thorough analysis.',
            'concise': 'Write briefly, directly, and to-the-point. Keep sentences short, avoid unnecessary words, and get straight to the core message.',
            'empathetic': 'Write with understanding, support, and care. Show emotional intelligence, acknowledge feelings, and provide encouraging responses.',
            'creative': 'Write with imagination, innovation, and artistic expression. Use vivid language, creative metaphors, and unique perspectives.',
            'enthusiastic': 'Write with energy, passion, and motivation. Use exclamation marks, positive language, and inspiring expressions.',
            'sarcastic': 'Write with wit, irony, and clever humor. Use subtle sarcasm, clever commentary, and witty observations.'
        };
    }

    async generateReply(context) {
        // Get the specific style instruction for the selected style
        const selectedStyle = this.config.style;
        const customInstructions = this.config.customStyleInstructions || '';
        
        let styleInstruction = 'Write in a conversational and helpful tone.';
        if (selectedStyle && this.styleInstructions[selectedStyle]) {
            styleInstruction = this.styleInstructions[selectedStyle];
            if (customInstructions) {
                styleInstruction = `${styleInstruction} Additionally: ${customInstructions}`;
            }
        } else if (customInstructions) {
            styleInstruction = `Write in a conversational and helpful tone. Additionally: ${customInstructions}`;
        }
        
        const systemPrompt = `You are an expert at crafting engaging Twitter/X replies. Follow these rules strictly:
1. Keep responses under 280 characters - be concise and to the point
2. Never use double quotes (") in your response.
3. Never use (—) in your response.
4. NEVER use @ symbols (@) in your response - this could accidentally tag other users
5. Style Instruction: ${styleInstruction}
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

        // Enhanced logging for reply generation
        console.log('xMatic: 🚀 AI API - ===== REPLY GENERATION REQUEST =====');
        console.log('xMatic: 🚀 AI API - Provider:', this.config.selectedProvider || 'openai');
        console.log('xMatic: 🚀 AI API - Model:', this.config.selectedModel || 'gpt-4');
        console.log('xMatic: 🚀 AI API - Temperature:', this.config.temperature || '0.7 (default)');
        console.log('xMatic: 🚀 AI API - Max Tokens:', this.config.maxTokens || '100 (default)');
        console.log('xMatic: 🚀 AI API - Base Style:', this.config.style || 'conversational and helpful');
        console.log('xMatic: 🚀 AI API - Custom Instructions:', this.config.customStyleInstructions || 'none');
        console.log('xMatic: 🚀 AI API - Combined Style:', styleInstruction);
        console.log('xMatic: 🚀 AI API - ===== SYSTEM PROMPT =====');
        console.log('xMatic: 🚀 AI API -', systemPrompt);
        console.log('xMatic: 🚀 AI API -', userPrompt);
        console.log('xMatic: 🚀 AI API - ===== FULL CONTEXT =====');
        console.log('xMatic: 🚀 AI API -', JSON.stringify(context, null, 2));
        console.log('xMatic: 🚀 AI API - ===== END REPLY REQUEST =====');

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
            temperature: parseFloat(this.config.temperature) || 0.7
        };
        
        // Add OpenAI-specific parameters only for OpenAI
        if (selectedProvider === 'openai') {
            requestBody.max_tokens = parseInt(this.config.maxTokens) || 100;
            requestBody.top_p = 0.9;
            requestBody.frequency_penalty = 0.5;
            requestBody.presence_penalty = 0.3;
        }

        console.log('xMatic: 🚀 AI API - ===== REPLY API REQUEST =====');
        console.log('xMatic: 🚀 AI API - Endpoint:', apiEndpoint);
        console.log('xMatic: 🚀 AI API - Temperature Used:', requestBody.temperature);
        console.log('xMatic: 🚀 AI API - Max Tokens Used:', requestBody.max_tokens || 'Not applicable for this provider');
        console.log('xMatic: 🚀 AI API - Request Body:', JSON.stringify(requestBody, null, 2));
        console.log('xMatic: 🚀 AI API - ===== END REPLY API REQUEST =====');

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
        
        console.log('xMatic: 🚀 AI API - ===== REPLY AI RESPONSE =====');
        console.log('xMatic: 🚀 AI API - Response Status:', response.status);
        console.log('xMatic: 🚀 AI API - Full AI Response:', content);
        console.log('xMatic: 🚀 AI API - Response Length:', content.length, 'characters');
        console.log('xMatic: 🚀 AI API - ===== END REPLY RESPONSE =====');

        return content;
    }

    // Method to update configuration
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    // Method to generate multiple replies
    async generateMultipleReplies(context, count) {
        console.log('xMatic: 🚀 AI API - Generating', count, 'replies in single API call for context:', context);
        
        // Get the specific style instruction for the selected style
        const selectedStyle = this.config.style;
        const customInstructions = this.config.customStyleInstructions || '';
        
        let styleInstruction = 'Write in a conversational and helpful tone.';
        if (selectedStyle && this.styleInstructions[selectedStyle]) {
            styleInstruction = this.styleInstructions[selectedStyle];
            if (customInstructions) {
                styleInstruction = `${styleInstruction} Additionally: ${customInstructions}`;
            }
        } else if (customInstructions) {
            styleInstruction = `Write in a conversational and helpful tone. Additionally: ${customInstructions}`;
        }
        
        const systemPrompt = `You are an expert at crafting engaging original Twitter/X posts. Generate exactly ${count} unique and diverse tweets about the given topic.

IIMPORTANT: Return your response as a valid JSON array of strings, where each string is a different original tweet.

Each tweet must be:
1. Under 280 characters
2. Written following this style instruction: ${styleInstruction}
3. Unique and engaging
4. Original standalone content

Rules:
- Never use double quotes (") or @ symbols
- No meta-commentary, just tweet content
- Vary tone and approach while maintaining the specified style
- Use hashtags and emojis when appropriate for the style

Return ONLY a valid JSON array of ${count} strings.`;

        const userPrompt = `Generate exactly ${count} original tweets in ${styleInstruction} style about this topic: ${context}

Return ONLY a valid JSON array of ${count} strings, no other text.`;

        // Enhanced logging to show exactly what goes to the AI
        console.log('xMatic: 🚀 AI API - ===== FULL AI REQUEST DETAILS =====');
        console.log('xMatic: 🚀 AI API - Provider:', this.config.selectedProvider || 'openai');
        console.log('xMatic: 🚀 AI API - Model:', this.config.selectedModel || 'gpt-4');
        console.log('xMatic: 🚀 AI API - Temperature:', this.config.temperature || '0.8 (default)');
        console.log('xMatic: 🚀 AI API - Max Tokens:', this.config.maxTokens || '150 * count (default)');
        console.log('xMatic: 🚀 AI API - Base Style:', this.config.style || 'conversational and helpful');
        console.log('xMatic: 🚀 AI API - Custom Instructions:', this.config.customStyleInstructions || 'none');
        console.log('xMatic: 🚀 AI API - Combined Style:', styleInstruction);
        console.log('xMatic: 🚀 AI API - Count Requested:', count);
        console.log('xMatic: 🚀 AI API - Context Length:', context.length, 'characters');
        console.log('xMatic: 🚀 AI API - ===== SYSTEM PROMPT =====');
        console.log('xMatic: 🚀 AI API -', systemPrompt);
        console.log('xMatic: 🚀 AI API - ===== USER PROMPT =====');
        console.log('xMatic: 🚀 AI API -', userPrompt);
        console.log('xMatic: 🚀 AI API - ===== FULL CONTEXT =====');
        console.log('xMatic: 🚀 AI API -', context);
        console.log('xMatic: 🚀 AI API - ===== END REQUEST DETAILS =====');

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
            temperature: parseFloat(this.config.temperature) || 0.8 // Higher temperature for more variety
        };
        
        // Add OpenAI-specific parameters only for OpenAI
        if (selectedProvider === 'openai') {
            requestBody.max_tokens = parseInt(this.config.maxTokens) || (150 * count); // Allocate tokens for all replies
            requestBody.top_p = 0.9;
            requestBody.frequency_penalty = 0.8; // Increase variety
            requestBody.presence_penalty = 0.6;
        }

        console.log('xMatic: 🚀 AI API - ===== API REQUEST DETAILS =====');
        console.log('xMatic: 🚀 AI API - Endpoint:', apiEndpoint);
        console.log('xMatic: 🚀 AI API - Temperature Used:', requestBody.temperature);
        console.log('xMatic: 🚀 AI API - Max Tokens Used:', requestBody.max_tokens || 'Not applicable for this provider');
        console.log('xMatic: 🚀 AI API - Headers:', JSON.stringify(headers, null, 2));
        console.log('xMatic: 🚀 AI API - Request Body:', JSON.stringify(requestBody, null, 2));
        console.log('xMatic: 🚀 AI API - ===== END API REQUEST =====');
        
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
        
        console.log('xMatic: 🚀 AI API - ===== AI RESPONSE DETAILS =====');
        console.log('xMatic: 🚀 AI API - Response Status:', response.status);
        console.log('xMtic: 🚀 AI API - Response Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
        console.log('xMatic: 🚀 AI API - Full AI Response:', content);
        console.log('xMatic: 🚀 AI API - Response Length:', content.length, 'characters');
        console.log('xMatic: 🚀 AI API - ===== END AI RESPONSE =====');
        
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
            
            console.log('xMatic: 🚀 AI API - ===== PARSED RESULTS =====');
            console.log('xMatic: 🚀 AI API - Successfully parsed', validReplies.length, 'unique replies');
            validReplies.forEach((reply, index) => {
                console.log(`xMatic: 🚀 AI API - Reply ${index + 1}:`, reply);
                console.log(`xMatic: 🚀 AI API - Reply ${index + 1} Length:`, reply.length, 'characters');
            });
            console.log('xMatic: 🚀 AI API - ===== END PARSED RESULTS =====');
            
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
