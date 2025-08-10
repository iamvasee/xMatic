// Twitter Growth Tool Content Script
console.log('Twitter Growth Tool: Content script loaded');

class TwitterGrowthTool {
    constructor() {
        this.config = null;
        this.isInitialized = false;
        console.log('TwitterGrowthTool: Constructor called');
        this.init();
    }

    async init() {
        try {
            console.log('TwitterGrowthTool: Initializing...');
            this.config = await chrome.storage.sync.get(['openaiKey', 'style']);
            console.log('TwitterGrowthTool: Config loaded', this.config);

            // Always add buttons, even without API keys for testing
            this.addReplyButtons();
            this.observeNewTweets();
            this.isInitialized = true;
            console.log('TwitterGrowthTool: Initialized successfully');
        } catch (error) {
            console.error('TwitterGrowthTool: Initialization error', error);
        }
    }

    observeNewTweets() {
        const observer = new MutationObserver(() => {
            this.addReplyButtons();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        console.log('TwitterGrowthTool: Observer started');
    }

    addReplyButtons() {
        // Instead of adding buttons to tweets, look for compose areas
        this.addAIIconToComposeAreas();
    }

    addAIIconToComposeAreas() {
        // Find compose areas that don't have our AI icon yet
        const composeAreas = document.querySelectorAll('[data-testid="toolBar"]:not(.ai-enhanced)');
        console.log(`TwitterGrowthTool: Found ${composeAreas.length} compose toolbars to enhance`);

        composeAreas.forEach((toolbar, index) => {
            toolbar.classList.add('ai-enhanced');

            // Create AI generation button
            const aiButton = document.createElement('button');
            aiButton.innerHTML = '🤖';
            aiButton.className = 'ai-compose-btn';
            aiButton.title = 'Generate AI Reply';
            aiButton.style.cssText = `
        background: #1da1f2;
        color: white;
        border: none;
        border-radius: 50%;
        width: 34px;
        height: 34px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        margin-right: 8px;
        transition: all 0.2s ease;
      `;

            aiButton.addEventListener('mouseenter', () => {
                aiButton.style.background = '#0d8bd9';
                aiButton.style.transform = 'scale(1.05)';
            });

            aiButton.addEventListener('mouseleave', () => {
                aiButton.style.background = '#1da1f2';
                aiButton.style.transform = 'scale(1)';
            });

            aiButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('TwitterGrowthTool: AI compose button clicked');
                this.handleAIReplyFromCompose(toolbar);
            });

            // Insert the AI button at the beginning of the toolbar
            toolbar.insertBefore(aiButton, toolbar.firstChild);
            console.log(`TwitterGrowthTool: Added AI compose button ${index + 1}`);
        });
    }

    async handleAIReplyFromCompose(toolbar) {
        try {
            console.log('TwitterGrowthTool: Handling AI reply from compose area');

            // Check if OpenAI key is configured
            if (!this.config.openaiKey) {
                alert('Please configure your OpenAI API key first! Click the extension icon to set it up.');
                return;
            }

            // Find the original tweet being replied to
            const context = await this.extractContextFromReplyPage();
            console.log('TwitterGrowthTool: Extracted context from reply page:', context);

            if (!context.mainTweet) {
                alert('Could not extract tweet content. Make sure you\'re replying to a tweet.');
                return;
            }



            // Generate and fill reply immediately
            await this.generateAndFillReply(context);

        } catch (error) {
            console.error('TwitterGrowthTool: Error handling AI reply:', error);
            alert('Error: ' + error.message);
        }
    }

    async extractContextFromReplyPage() {
        const context = {
            mainTweet: '',
            authorInfo: {},
            threadMessages: [],
            replies: [],
            engagement: {}
        };

        try {
            // Look for the tweet being replied to in the compose modal or page
            const replyingToElement = document.querySelector('[data-testid="tweet"]');
            if (replyingToElement) {
                context.mainTweet = this.extractTweetText(replyingToElement);
                context.authorInfo = this.extractAuthorInfo(replyingToElement);
                context.threadMessages = await this.extractThreadContext(replyingToElement);
                context.replies = this.extractRecentReplies(replyingToElement);
                context.engagement = this.extractEngagementMetrics(replyingToElement);
            } else {
                // Fallback: try to extract from "Replying to" text
                const replyingToText = document.querySelector('[data-testid="reply-bar"]');
                if (replyingToText) {
                    // This is a basic fallback - we might not get full context
                    context.mainTweet = 'Reply context available but limited';
                }
            }

            console.log('TwitterGrowthTool: Extracted context from reply page:', context);
        } catch (error) {
            console.error('TwitterGrowthTool: Error extracting context from reply page:', error);
        }

        return context;
    }

    async extractFullContext(tweetElement) {
        const context = {
            mainTweet: '',
            authorInfo: {},
            threadMessages: [],
            replies: [],
            engagement: {}
        };

        // Extract main tweet text
        context.mainTweet = this.extractTweetText(tweetElement);

        // Extract author information
        context.authorInfo = this.extractAuthorInfo(tweetElement);

        // Extract thread context (if this is part of a thread)
        context.threadMessages = await this.extractThreadContext(tweetElement);

        // Extract recent replies for context
        context.replies = this.extractRecentReplies(tweetElement);

        // Extract engagement metrics
        context.engagement = this.extractEngagementMetrics(tweetElement);

        return context;
    }

    extractTweetText(tweetElement) {
        // Try multiple selectors for tweet text
        const selectors = [
            '[data-testid="tweetText"]',
            '[lang]',
            '.css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0'
        ];

        for (const selector of selectors) {
            const textElement = tweetElement.querySelector(selector);
            if (textElement && textElement.textContent.trim()) {
                return textElement.textContent.trim();
            }
        }

        return '';
    }

    extractAuthorInfo(tweetElement) {
        const authorInfo = {
            username: '',
            displayName: '',
            bio: '',
            verified: false,
            followerCount: ''
        };

        try {
            // Extract username and display name
            const usernameElement = tweetElement.querySelector('[data-testid="User-Name"] a[role="link"]');
            if (usernameElement) {
                const href = usernameElement.getAttribute('href');
                if (href) {
                    authorInfo.username = href.replace('/', '');
                }
            }

            const displayNameElement = tweetElement.querySelector('[data-testid="User-Name"] span');
            if (displayNameElement) {
                authorInfo.displayName = displayNameElement.textContent.trim();
            }

            // Check if verified
            const verifiedElement = tweetElement.querySelector('[data-testid="icon-verified"]');
            authorInfo.verified = !!verifiedElement;

            console.log('TwitterGrowthTool: Extracted author info:', authorInfo);
        } catch (error) {
            console.error('TwitterGrowthTool: Error extracting author info:', error);
        }

        return authorInfo;
    }

    async extractThreadContext(tweetElement) {
        const threadMessages = [];

        try {
            // Look for thread indicators
            const threadContainer = tweetElement.closest('[data-testid="tweet"]')?.parentElement;
            if (!threadContainer) return threadMessages;

            // Find all tweets in the thread
            const allTweets = threadContainer.querySelectorAll('[data-testid="tweet"]');

            allTweets.forEach((tweet, index) => {
                const text = this.extractTweetText(tweet);
                const author = this.extractAuthorInfo(tweet);

                if (text && text !== this.extractTweetText(tweetElement)) {
                    threadMessages.push({
                        order: index,
                        text: text,
                        author: author.displayName || author.username,
                        isOriginalAuthor: author.username === this.extractAuthorInfo(tweetElement).username
                    });
                }
            });

            console.log('TwitterGrowthTool: Extracted thread messages:', threadMessages);
        } catch (error) {
            console.error('TwitterGrowthTool: Error extracting thread context:', error);
        }

        return threadMessages;
    }

    extractRecentReplies(tweetElement) {
        const replies = [];

        try {
            // Look for reply elements near the tweet
            const tweetContainer = tweetElement.closest('[data-testid="tweet"]')?.parentElement?.parentElement;
            if (!tweetContainer) return replies;

            const replyElements = tweetContainer.querySelectorAll('[data-testid="tweet"]');

            replyElements.forEach((replyElement, index) => {
                if (index === 0) return; // Skip the main tweet

                const replyText = this.extractTweetText(replyElement);
                const replyAuthor = this.extractAuthorInfo(replyElement);

                if (replyText && replies.length < 3) { // Limit to 3 recent replies
                    replies.push({
                        text: replyText,
                        author: replyAuthor.displayName || replyAuthor.username
                    });
                }
            });

            console.log('TwitterGrowthTool: Extracted replies:', replies);
        } catch (error) {
            console.error('TwitterGrowthTool: Error extracting replies:', error);
        }

        return replies;
    }

    extractEngagementMetrics(tweetElement) {
        const engagement = {
            likes: 0,
            retweets: 0,
            replies: 0
        };

        try {
            // Extract like count
            const likeElement = tweetElement.querySelector('[data-testid="like"] span');
            if (likeElement) {
                engagement.likes = this.parseEngagementNumber(likeElement.textContent);
            }

            // Extract retweet count
            const retweetElement = tweetElement.querySelector('[data-testid="retweet"] span');
            if (retweetElement) {
                engagement.retweets = this.parseEngagementNumber(retweetElement.textContent);
            }

            // Extract reply count
            const replyElement = tweetElement.querySelector('[data-testid="reply"] span');
            if (replyElement) {
                engagement.replies = this.parseEngagementNumber(replyElement.textContent);
            }

            console.log('TwitterGrowthTool: Extracted engagement:', engagement);
        } catch (error) {
            console.error('TwitterGrowthTool: Error extracting engagement:', error);
        }

        return engagement;
    }

    parseEngagementNumber(text) {
        if (!text) return 0;

        const cleanText = text.trim().toLowerCase();
        if (cleanText.includes('k')) {
            return parseFloat(cleanText.replace('k', '')) * 1000;
        } else if (cleanText.includes('m')) {
            return parseFloat(cleanText.replace('m', '')) * 1000000;
        }

        return parseInt(cleanText) || 0;
    }



    async generateAndFillReply(context) {
        try {
            console.log('TwitterGrowthTool: Generating reply for context:', context);

            // Find the compose text area with multiple selectors
            const composeSelectors = [
                '[data-testid="tweetTextarea_0"]',
                '[contenteditable="true"][data-testid*="textInput"]',
                '.public-DraftEditor-content',
                '[role="textbox"]',
                '.DraftEditor-editorContainer [contenteditable="true"]'
            ];

            let composeBox = null;
            for (const selector of composeSelectors) {
                composeBox = document.querySelector(selector);
                if (composeBox) {
                    console.log(`TwitterGrowthTool: Found compose box with selector: ${selector}`);
                    break;
                }
            }

            if (!composeBox) {
                console.log('TwitterGrowthTool: Could not find compose box');
                alert('Could not find compose box. Please make sure you\'re in the reply area.');
                return;
            }

            // Show loading state by temporarily changing the AI button
            const aiButton = document.querySelector('.ai-compose-btn');
            if (aiButton) {
                aiButton.innerHTML = '⏳';
                aiButton.style.background = '#ffa500';
            }

            // Generate reply using OpenAI with full context
            const reply = await this.generateReplyWithOpenAI(context);

            // Fill the compose box using clipboard method
            await this.fillComposeBoxWithClipboard(composeBox, reply);

            // Reset AI button
            if (aiButton) {
                aiButton.innerHTML = '🤖';
                aiButton.style.background = '#1da1f2';
            }

        } catch (error) {
            console.error('TwitterGrowthTool: Error generating reply:', error);
            alert('Error generating reply: ' + error.message);

            // Reset AI button on error
            const aiButton = document.querySelector('.ai-compose-btn');
            if (aiButton) {
                aiButton.innerHTML = '🤖';
                aiButton.style.background = '#1da1f2';
            }
        }
    }

    async fillComposeBoxWithClipboard(composeBox, text) {
        console.log('TwitterGrowthTool: Filling compose box with direct DOM manipulation:', text);

        try {
            // Focus the compose box first
            composeBox.focus();
            composeBox.click();

            // Clear any existing content
            this.clearComposeBox(composeBox);

            // Insert text directly into Twitter's React editor
            await this.insertTextIntoTwitterEditor(composeBox, text);

            // Force Twitter to validate the input
            await this.forceTwitterValidation(composeBox);
            
            console.log('TwitterGrowthTool: Successfully filled compose box');

        } catch (error) {
            console.log('TwitterGrowthTool: Direct method failed, falling back to typing simulation:', error);
            await this.simulateTyping(composeBox, text);
        }
    }

    clearComposeBox(composeBox) {
        // Clear all content
        composeBox.textContent = '';
        composeBox.innerHTML = '';

        // Trigger events to notify React
        const deleteEvent = new InputEvent('beforeinput', {
            bubbles: true,
            cancelable: true,
            inputType: 'deleteContentBackward'
        });
        composeBox.dispatchEvent(deleteEvent);
    }

    async insertTextIntoTwitterEditor(composeBox, text) {
        // Method 1: Use React's internal methods if available
        const reactFiber = this.getReactFiber(composeBox);
        if (reactFiber && this.tryReactMethod(reactFiber, text)) {
            return;
        }

        // Method 2: Direct DOM manipulation with proper events
        await this.insertTextWithEvents(composeBox, text);
    }

    getReactFiber(element) {
        // Try to get React fiber from the element
        const keys = Object.keys(element);
        const reactKey = keys.find(key => key.startsWith('__reactInternalInstance') || key.startsWith('__reactFiber'));
        return reactKey ? element[reactKey] : null;
    }

    tryReactMethod(fiber, text) {
        try {
            // Try to find React's setValue method
            let current = fiber;
            while (current) {
                if (current.memoizedProps && current.memoizedProps.onChange) {
                    // Simulate React onChange
                    const event = {
                        target: { value: text },
                        currentTarget: { value: text }
                    };
                    current.memoizedProps.onChange(event);
                    return true;
                }
                current = current.return || current.parent;
            }
            return false;
        } catch (error) {
            console.log('TwitterGrowthTool: React method failed:', error);
            return false;
        }
    }

    async insertTextWithEvents(composeBox, text) {
        // Focus and position cursor
        composeBox.focus();

        // Create a text node and insert it
        const textNode = document.createTextNode(text);
        composeBox.appendChild(textNode);

        // Create proper selection at the end
        const range = document.createRange();
        const selection = window.getSelection();
        range.setStart(textNode, text.length);
        range.setEnd(textNode, text.length);
        selection.removeAllRanges();
        selection.addRange(range);

        // Trigger comprehensive events
        const events = [
            new InputEvent('beforeinput', {
                bubbles: true,
                cancelable: true,
                inputType: 'insertText',
                data: text
            }),
            new InputEvent('input', {
                bubbles: true,
                cancelable: true,
                inputType: 'insertText',
                data: text
            }),
            new Event('change', { bubbles: true }),
            new KeyboardEvent('keyup', {
                bubbles: true,
                key: 'End',
                code: 'End'
            }),
            new Event('blur', { bubbles: true }),
            new Event('focus', { bubbles: true })
        ];

        // Dispatch events with delays to simulate real interaction
        for (const event of events) {
            composeBox.dispatchEvent(event);
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Final focus to ensure cursor is visible
        setTimeout(() => {
            composeBox.focus();
            // Ensure cursor is at the end
            const finalRange = document.createRange();
            const finalSelection = window.getSelection();
            finalRange.selectNodeContents(composeBox);
            finalRange.collapse(false);
            finalSelection.removeAllRanges();
            finalSelection.addRange(finalRange);
        }, 200);
    }



    async generateReplyWithOpenAI(context) {
        const systemPrompt = `You are a Twitter growth expert. Generate engaging replies that add value and encourage meaningful conversation. 

Style guidelines: ${this.config.style || 'Be conversational, helpful, and authentic'}

Rules:
- Keep under 280 characters
- Add genuine value to the conversation
- Be respectful and professional
- Use the thread context to avoid repeating points
- Consider the author's background when crafting your response
- If replying to a high-engagement tweet, make your response stand out`;

        const contextPrompt = this.buildContextPrompt(context);

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.openaiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{
                    role: 'system',
                    content: systemPrompt
                }, {
                    role: 'user',
                    content: contextPrompt
                }],
                max_tokens: 120,
                temperature: 0.7
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(`OpenAI API Error: ${data.error.message}`);
        }

        return data.choices?.[0]?.message?.content || '';
    }

    buildContextPrompt(context) {
        let prompt = `MAIN TWEET: "${context.mainTweet}"\n\n`;

        // Add author information
        if (context.authorInfo.displayName || context.authorInfo.username) {
            prompt += `AUTHOR: ${context.authorInfo.displayName || context.authorInfo.username}`;
            if (context.authorInfo.verified) prompt += ' (Verified)';
            prompt += '\n\n';
        }

        // Add thread context
        if (context.threadMessages.length > 0) {
            prompt += `THREAD CONTEXT:\n`;
            context.threadMessages.forEach((msg, index) => {
                prompt += `${index + 1}. ${msg.author}: "${msg.text}"\n`;
            });
            prompt += '\n';
        }

        // Add recent replies for context
        if (context.replies.length > 0) {
            prompt += `RECENT REPLIES:\n`;
            context.replies.forEach((reply, index) => {
                prompt += `${index + 1}. ${reply.author}: "${reply.text}"\n`;
            });
            prompt += '\n';
        }

        // Add engagement metrics
        if (context.engagement.likes > 0 || context.engagement.retweets > 0) {
            prompt += `ENGAGEMENT: ${context.engagement.likes} likes, ${context.engagement.retweets} retweets, ${context.engagement.replies} replies\n\n`;
        }



        prompt += `Generate a thoughtful, engaging reply that adds value to this conversation:`;

        return prompt;
    }

    async fillComposeBox(composeBox, text) {
        console.log('TwitterGrowthTool: Filling compose box with:', text);

        // Focus the compose box
        composeBox.focus();
        composeBox.click();

        // Clear any existing content
        composeBox.textContent = '';
        composeBox.innerHTML = '';

        // Simulate actual typing character by character
        await this.simulateTyping(composeBox, text);

        console.log('TwitterGrowthTool: Compose box filled successfully');
    }

    async simulateTyping(element, text) {
        console.log('TwitterGrowthTool: Using typing simulation fallback');

        // Focus and clear the element
        element.focus();
        element.click();

        // Clear existing content first
        this.clearComposeBox(element);

        // Wait a bit for clearing to take effect
        await new Promise(resolve => setTimeout(resolve, 100));

        // Type each character with proper events
        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            // Use document.execCommand for better compatibility
            if (document.execCommand && document.execCommand('insertText', false, char)) {
                // Success with execCommand
            } else {
                // Fallback: manual DOM insertion
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const textNode = document.createTextNode(char);
                    range.insertNode(textNode);
                    range.setStartAfter(textNode);
                    range.setEndAfter(textNode);
                    selection.removeAllRanges();
                    selection.addRange(range);
                } else {
                    // Last resort: append to element
                    element.appendChild(document.createTextNode(char));
                }
            }

            // Trigger input event for each character
            const inputEvent = new InputEvent('input', {
                bubbles: true,
                cancelable: true,
                inputType: 'insertText',
                data: char
            });
            element.dispatchEvent(inputEvent);

            // Small delay between characters
            if (i % 10 === 0) { // Every 10 characters, pause a bit longer
                await new Promise(resolve => setTimeout(resolve, 50));
            } else {
                await new Promise(resolve => setTimeout(resolve, 20));
            }
        }

        // Final events to ensure Twitter recognizes the complete text
        const events = [
            new Event('change', { bubbles: true }),
            new Event('blur', { bubbles: true }),
            new Event('focus', { bubbles: true })
        ];

        for (const event of events) {
            element.dispatchEvent(event);
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Ensure final focus and cursor position
        setTimeout(() => {
            element.focus();
            // Move cursor to end
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(element);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }, 200);

        console.log('TwitterGrowthTool: Typing simulation completed');
    }

    async forceTwitterValidation(composeBox) {
        console.log('TwitterGrowthTool: Forcing Twitter validation');
        
        // Focus the compose box
        composeBox.focus();
        
        // Trigger a sequence of events that Twitter uses for validation
        const validationEvents = [
            // Input event with proper inputType
            new InputEvent('input', {
                bubbles: true,
                cancelable: true,
                inputType: 'insertText',
                data: composeBox.textContent
            }),
            // Change event
            new Event('change', { bubbles: true }),
            // Composition events for React
            new CompositionEvent('compositionend', { 
                bubbles: true, 
                data: composeBox.textContent 
            }),
            // Keyboard event to simulate user interaction
            new KeyboardEvent('keyup', { 
                bubbles: true, 
                key: 'End',
                keyCode: 35
            })
        ];
        
        // Dispatch validation events
        for (const event of validationEvents) {
            composeBox.dispatchEvent(event);
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        // Additional trick: simulate a tiny edit to trigger validation
        setTimeout(async () => {
            const originalText = composeBox.textContent;
            
            // Add a space and remove it to trigger validation
            if (document.execCommand) {
                document.execCommand('insertText', false, ' ');
                await new Promise(resolve => setTimeout(resolve, 50));
                document.execCommand('delete', false, null);
                
                // Trigger final input event
                const finalEvent = new InputEvent('input', {
                    bubbles: true,
                    cancelable: true,
                    inputType: 'deleteContentBackward'
                });
                composeBox.dispatchEvent(finalEvent);
            }
            
            // Ensure text is still correct
            if (composeBox.textContent !== originalText) {
                composeBox.textContent = originalText;
            }
            
            console.log('TwitterGrowthTool: Validation sequence completed');
        }, 200);
    }
}

// Initialize when page loads
console.log('TwitterGrowthTool: Script execution started');

function initializeTool() {
    console.log('TwitterGrowthTool: Initializing tool');
    try {
        new TwitterGrowthTool();
    } catch (error) {
        console.error('TwitterGrowthTool: Failed to initialize:', error);
    }
}

// Multiple initialization strategies
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTool);
} else {
    initializeTool();
}

// Also try after a delay to ensure Twitter has loaded
setTimeout(initializeTool, 2000);

console.log('TwitterGrowthTool: Script setup complete');