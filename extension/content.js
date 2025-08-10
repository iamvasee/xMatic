// xMatic - Simple Twitter AI Reply Tool
console.log('xMatic: Loading...');

class XMatic {
    constructor() {
        this.config = null;
        this.init();
    }

    async init() {
        console.log('xMatic: Initializing...');
        this.config = await chrome.storage.sync.get(['openaiKey', 'style']);
        this.addAIButtons();
        this.observeChanges();
        console.log('xMatic: Ready!');
    }

    observeChanges() {
        const observer = new MutationObserver(() => {
            this.addAIButtons();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    addAIButtons() {
        // Find compose toolbars that don't have our button yet
        const toolbars = document.querySelectorAll('[data-testid="toolBar"]:not(.xmatic-enhanced)');
        
        toolbars.forEach(toolbar => {
            toolbar.classList.add('xmatic-enhanced');
            
            // Create AI button
            const aiButton = document.createElement('button');
            aiButton.innerHTML = '🤖';
            aiButton.className = 'xmatic-ai-btn';
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

            aiButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleAIClick();
            });

            toolbar.insertBefore(aiButton, toolbar.firstChild);
        });
    }

    async handleAIClick() {
        console.log('xMatic: AI button clicked');

        if (!this.config.openaiKey) {
            alert('Please configure your OpenAI API key first!');
            return;
        }

        try {
            // Show loading
            const aiBtn = document.querySelector('.xmatic-ai-btn');
            if (aiBtn) {
                aiBtn.innerHTML = '⏳';
                aiBtn.style.background = '#ffa500';
            }

            // Get context and generate reply
            const context = this.getContext();
            const reply = await this.generateReply(context);
            
            // Insert reply using the SIMPLEST method possible
            this.insertReply(reply);

            // Reset button
            if (aiBtn) {
                aiBtn.innerHTML = '🤖';
                aiBtn.style.background = '#1da1f2';
            }

        } catch (error) {
            console.error('xMatic: Error:', error);
            alert('Error: ' + error.message);
            
            // Reset button
            const aiBtn = document.querySelector('.xmatic-ai-btn');
            if (aiBtn) {
                aiBtn.innerHTML = '🤖';
                aiBtn.style.background = '#1da1f2';
            }
        }
    }

    getContext() {
        // Get the main tweet content
        const tweetElement = document.querySelector('[data-testid="tweet"]');
        let mainTweet = '';
        
        if (tweetElement) {
            const textElement = tweetElement.querySelector('[data-testid="tweetText"]');
            if (textElement) {
                mainTweet = textElement.textContent.trim();
            }
        }

        return { mainTweet };
    }

    async generateReply(context) {
        const systemPrompt = `You are helping with Twitter/X replies. Generate a helpful, engaging response under 280 characters. Style: ${this.config.style || 'Be conversational and helpful'}`;
        
        const userPrompt = `Generate a reply to this tweet: "${context.mainTweet}"`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.openaiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                max_tokens: 120,
                temperature: 0.7
            })
        });

        const data = await response.json();
        if (data.error) {
            throw new Error(`OpenAI Error: ${data.error.message}`);
        }

        return data.choices?.[0]?.message?.content || '';
    }

    async insertReply(text) {
        console.log('xMatic: Inserting reply:', text);

        // Find the compose box
        const composeBox = document.querySelector('[data-testid="tweetTextarea_0"]');
        if (!composeBox) {
            throw new Error('Could not find compose box');
        }

        // Try insertion methods
        await this.insertViaClipboard(composeBox, text);
        
        // Ensure Twitter recognizes the content
        setTimeout(() => {
            this.validateInsertion(composeBox, text);
        }, 500);
    }

    validateInsertion(composeBox, expectedText) {
        // Check if text was inserted correctly
        const currentText = composeBox.textContent || composeBox.innerText || '';
        
        if (currentText.trim() === expectedText.trim()) {
            console.log('xMatic: Text insertion validated successfully');
            
            // Ensure reply button is enabled
            const replyButton = document.querySelector('[data-testid="tweetButtonInline"], [data-testid="tweetButton"]');
            if (replyButton && replyButton.disabled) {
                replyButton.disabled = false;
                replyButton.removeAttribute('disabled');
                console.log('xMatic: Reply button enabled');
            }
        } else {
            console.log('xMatic: Text insertion may have failed, current text:', currentText);
        }
    }

    async insertViaClipboard(composeBox, text) {
        try {
            // Focus the compose box
            composeBox.focus();
            composeBox.click();
            
            // Wait for focus
            await new Promise(resolve => setTimeout(resolve, 100));

            // Method 1: Try execCommand insertText (most reliable)
            if (document.execCommand && document.execCommand('insertText', false, text)) {
                console.log('xMatic: Text inserted via execCommand');
                return;
            }

            // Method 2: Try clipboard with actual paste event
            await navigator.clipboard.writeText(text);
            
            // Trigger paste event
            const pasteEvent = new ClipboardEvent('paste', {
                clipboardData: new DataTransfer(),
                bubbles: true,
                cancelable: true
            });
            
            // Add text to clipboard data
            pasteEvent.clipboardData.setData('text/plain', text);
            composeBox.dispatchEvent(pasteEvent);

            console.log('xMatic: Text inserted via clipboard event');

        } catch (error) {
            console.log('xMatic: Clipboard method failed, using typing fallback');
            this.insertViaTyping(composeBox, text);
        }
    }

    async insertViaTyping(composeBox, text) {
        console.log('xMatic: Using direct insertion method');
        
        // Focus the compose box
        composeBox.focus();
        composeBox.click();
        
        // Wait for focus
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Method 1: Try direct execCommand (most compatible)
        if (document.execCommand) {
            // Clear existing content first
            document.execCommand('selectAll', false, null);
            document.execCommand('delete', false, null);
            
            // Insert new text
            if (document.execCommand('insertText', false, text)) {
                console.log('xMatic: Text inserted via direct execCommand');
                return;
            }
        }
        
        // Method 2: Direct DOM manipulation
        composeBox.textContent = text;
        
        // Position cursor at end
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(composeBox);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Trigger input events
        composeBox.dispatchEvent(new InputEvent('input', {
            bubbles: true,
            inputType: 'insertText',
            data: text
        }));
        
        composeBox.dispatchEvent(new Event('change', { bubbles: true }));
        
        console.log('xMatic: Text inserted via DOM manipulation');
    }
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new XMatic());
} else {
    new XMatic();
}

// Also initialize after a delay to catch dynamic content
setTimeout(() => new XMatic(), 2000);

console.log('xMatic: Script loaded');