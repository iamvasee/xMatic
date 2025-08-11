// xMatic - Simple Twitter AI Reply Tool
console.log('xMatic: Loading...');

class XMatic {
    constructor() {
        this.config = null;
        this.robotSvg = null;
        this.timeSvg = null;
        this.init();
    }

    async init() {
        console.log('xMatic: Initializing...');
        this.config = await chrome.storage.sync.get(['openaiKey', 'style', 'selectedModel']);
        await this.loadSvgIcons();
        this.addAIButtons();
        this.observeChanges();
        console.log('xMatic: Ready!');
    }

    async loadSvgIcons() {
        try {
            // Load robot SVG
            const robotResponse = await fetch(chrome.runtime.getURL('robot.svg'));
            this.robotSvg = await robotResponse.text();

            // Load time SVG
            const timeResponse = await fetch(chrome.runtime.getURL('time.svg'));
            this.timeSvg = await timeResponse.text();

            console.log('xMatic: SVG icons loaded');
        } catch (error) {
            console.error('xMatic: Failed to load SVG icons:', error);
            // Fallback to hardcoded SVGs if loading fails
            this.robotSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H9L3 7V9C3 10.1 3.9 11 5 11V16C5 17.1 5.9 18 7 18H9C9 19.1 9.9 20 11 20H13C14.1 20 15 19.1 15 18H17C18.1 18 19 17.1 19 16V11C20.1 11 21 10.1 21 9ZM11 16H13V14H11V16ZM7 14V11H17V14H15V16H17V18H7V16H9V14H7Z"/>
            </svg>`;
            this.timeSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity="0.25"/>
                <path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z">
                    <animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/>
                </path>
            </svg>`;
        }
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

            // Create AI icon (div instead of button to avoid shadows)
            const aiButton = document.createElement('div');
            aiButton.className = 'xmatic-ai-btn';
            aiButton.title = 'Generate AI Reply';
            aiButton.setAttribute('role', 'button');
            aiButton.setAttribute('tabindex', '0');

            // Use loaded robot SVG icon
            aiButton.innerHTML = this.robotSvg;

            // Style to match Twitter's native icons exactly
            aiButton.style.cssText = `
                background: transparent;
                border: none;
                border-radius: 50%;
                width: 34.75px;
                height: 34.75px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin: 4px 8px 0 0;
                transition: all 0.2s ease;
                padding: 8px;
                color: rgb(83, 100, 113);
                box-shadow: none;
                outline: none;
                vertical-align: middle;
                flex-shrink: 0;
            `;

            // Add hover effects to match Twitter's style
            aiButton.addEventListener('mouseenter', () => {
                aiButton.style.backgroundColor = '#EFF5FD';
                aiButton.style.color = 'rgb(29, 161, 242)';
                aiButton.style.transform = 'none'; // Prevent any zoom/scale effects
            });

            aiButton.addEventListener('mouseleave', () => {
                aiButton.style.backgroundColor = 'transparent';
                aiButton.style.color = 'rgb(83, 100, 113)';
                aiButton.style.transform = 'none';
            });

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
                aiBtn.innerHTML = this.timeSvg;
                aiBtn.style.backgroundColor = 'rgba(255, 140, 0, 0.1)';
                aiBtn.style.color = 'rgb(255, 140, 0)';
            }

            // Get context and generate reply
            const context = this.getContext();
            const reply = await this.generateReply(context);

            // Insert reply using the SIMPLEST method possible
            this.insertReply(reply);

            // Reset button
            if (aiBtn) {
                aiBtn.innerHTML = this.robotSvg;
                aiBtn.style.backgroundColor = 'transparent';
                aiBtn.style.color = 'rgb(83, 100, 113)';
            }

        } catch (error) {
            console.error('xMatic: Error:', error);
            alert('Error: ' + error.message);

            // Reset button
            const aiBtn = document.querySelector('.xmatic-ai-btn');
            if (aiBtn) {
                aiBtn.innerHTML = this.robotSvg;
                aiBtn.style.backgroundColor = 'transparent';
                aiBtn.style.color = 'rgb(83, 100, 113)';
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

        const selectedModel = this.config.selectedModel || 'gpt-4';

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.openaiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: selectedModel,
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

            // Method 1: Try modern clipboard API with paste event
            await navigator.clipboard.writeText(text);

            // Create and dispatch paste event
            const pasteEvent = new ClipboardEvent('paste', {
                bubbles: true,
                cancelable: true,
                clipboardData: new DataTransfer()
            });

            pasteEvent.clipboardData.setData('text/plain', text);
            composeBox.dispatchEvent(pasteEvent);

            console.log('xMatic: Text inserted via clipboard event');

        } catch (error) {
            console.log('xMatic: Clipboard method failed, using direct insertion fallback');
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

        // Method 1: Try modern Selection API with insertText
        try {
            const selection = window.getSelection();

            // Clear existing content
            selection.selectAllChildren(composeBox);
            selection.deleteFromDocument();

            // Create a text node and insert it
            const textNode = document.createTextNode(text);
            const range = document.createRange();
            range.selectNodeContents(composeBox);
            range.collapse(false);
            range.insertNode(textNode);

            // Position cursor at end
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection.removeAllRanges();
            selection.addRange(range);

            console.log('xMatic: Text inserted via Selection API');

        } catch (selectionError) {
            console.log('xMatic: Selection API failed, using DOM manipulation');

            // Method 2: Direct DOM manipulation fallback
            composeBox.textContent = text;

            // Position cursor at end
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(composeBox);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        // Trigger input events to notify Twitter's React components
        composeBox.dispatchEvent(new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            inputType: 'insertText',
            data: text
        }));

        composeBox.dispatchEvent(new Event('change', { bubbles: true }));
        composeBox.dispatchEvent(new Event('keyup', { bubbles: true }));

        console.log('xMatic: Text inserted via modern DOM methods');
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