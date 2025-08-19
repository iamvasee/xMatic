// xMatic - Text Insertion Manager
class TextInsertionManager {
    constructor() {
        // Initialize text insertion configurations
    }

    // Main method to insert reply text into the compose box
    async insertReply(text, themeManager = null) {
        const composeBox = document.querySelector('[data-testid="tweetTextarea_0"]');
        if (!composeBox) {
            throw new Error('Could not find compose box');
        }

        // Use integrated theme detection (no need for external theme manager)
        const theme = this.getCurrentTheme();
        await this.insertViaClipboard(composeBox, text);

        // Apply full theme styling
        this.applyThemeStyling(composeBox, theme);

        // Ensure Twitter recognizes the content
        setTimeout(() => {
            this.validateInsertion(composeBox, text);
            this.applyThemeStyling(composeBox, theme);
        }, 500);
    }

    // Insert text using clipboard API
    async insertViaClipboard(composeBox, text) {
        try {
            composeBox.focus();
            composeBox.click();
            await new Promise(resolve => setTimeout(resolve, 100));

            await navigator.clipboard.writeText(text);
            const pasteEvent = new ClipboardEvent('paste', {
                bubbles: true,
                cancelable: true,
                clipboardData: new DataTransfer()
            });

            pasteEvent.clipboardData.setData('text/plain', text);
            composeBox.dispatchEvent(pasteEvent);

        } catch (error) {
            // Fallback to typing simulation
            await this.insertViaTyping(composeBox, text);
        }
    }

    // Insert text using typing simulation
    async insertViaTyping(composeBox, text) {
        composeBox.focus();
        composeBox.click();
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const selection = window.getSelection();
            selection.selectAllChildren(composeBox);
            selection.deleteFromDocument();

            const textNode = document.createTextNode(text);
            const range = document.createRange();
            range.selectNodeContents(composeBox);
            range.collapse(false);
            range.insertNode(textNode);

            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection.removeAllRanges();
            selection.addRange(range);

        } catch (selectionError) {
            // Direct DOM manipulation fallback
            composeBox.textContent = text;
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(composeBox);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        // Trigger input events to notify Twitter's React components
        this.triggerInputEvents(composeBox, text);
    }

    // Validate that text was inserted correctly
    validateInsertion(composeBox, expectedText) {
        const currentText = composeBox.textContent || composeBox.innerText || '';

        if (currentText.trim() === expectedText.trim()) {
            // Ensure reply button is enabled
            const replyButton = document.querySelector('[data-testid="tweetButtonInline"], [data-testid="tweetButton"]');
            if (replyButton && replyButton.disabled) {
                replyButton.disabled = false;
                replyButton.removeAttribute('disabled');
            }
            return true;
        }
        return false;
    }

    // Trigger input events to notify Twitter's React components
    triggerInputEvents(composeBox, text) {
        composeBox.dispatchEvent(new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            inputType: 'insertText',
            data: text
        }));

        composeBox.dispatchEvent(new Event('change', { bubbles: true }));
        composeBox.dispatchEvent(new Event('keyup', { bubbles: true }));
    }

    // Set appropriate text color based on theme
    setTextColor(composeBox, theme) {
        const textColor = this.getTextColorForTheme(theme);
        composeBox.style.color = textColor;
    }

    // Set compose box background color based on theme
    setBackgroundColor(composeBox, theme) {
        const backgroundColor = this.getBackgroundColorForTheme(theme);
        composeBox.style.backgroundColor = backgroundColor;
    }

    // Apply full theme styling to compose box
    applyThemeStyling(composeBox, theme) {
        this.setTextColor(composeBox, theme);
        this.setBackgroundColor(composeBox, theme);
    }

    // Advanced theme detection for Twitter pages
    detectTheme() {
        const html = document.documentElement;
        const body = document.body;
        
        // Check for data-theme attribute on html or body
        if (html.getAttribute('data-theme') === 'dark' || 
            body.getAttribute('data-theme') === 'dark' ||
            html.getAttribute('data-mode') === 'dark' ||
            body.getAttribute('data-mode') === 'dark' ||
            html.classList.contains('dark') ||
            body.classList.contains('dark') ||
            window.getComputedStyle(html).colorScheme === 'dark' ||
            window.getComputedStyle(body).colorScheme === 'dark') {
            return 'dark';
        }
        
        // Default to light theme
        return 'light';
    }

    // Get current theme with enhanced detection
    getCurrentTheme() {
        return this.detectTheme();
    }

    // Check if dark theme is active
    isDarkTheme() {
        return this.detectTheme() === 'dark';
    }

    // Check if light theme is active
    isLightTheme() {
        return this.detectTheme() === 'light';
    }

    // Get appropriate text color for current theme
    getTextColorForTheme(theme = null) {
        const currentTheme = theme || this.detectTheme();
        return currentTheme === 'dark' ? '#E7E9EA' : '#0F1419';
    }

    // Get appropriate background color for current theme
    getBackgroundColorForTheme(theme = null) {
        const currentTheme = theme || this.detectTheme();
        return currentTheme === 'dark' ? '#15202B' : '#FFFFFF';
    }

    // Clear compose box content
    clearComposeBox() {
        const composeBox = document.querySelector('[data-testid="tweetTextarea_0"]');
        if (composeBox) {
            composeBox.textContent = '';
            this.triggerInputEvents(composeBox, '');
        }
    }

    // Get current compose box content
    getComposeBoxContent() {
        const composeBox = document.querySelector('[data-testid="tweetTextarea_0"]');
        return composeBox ? (composeBox.textContent || composeBox.innerText || '') : '';
    }

    // Check if compose box exists and is ready
    isComposeBoxReady() {
        const composeBox = document.querySelector('[data-testid="tweetTextarea_0"]');
        return !!composeBox && !composeBox.disabled;
    }

    // Focus the compose box
    focusComposeBox() {
        const composeBox = document.querySelector('[data-testid="tweetTextarea_0"]');
        if (composeBox) {
            composeBox.focus();
            composeBox.click();
        }
    }

    // Insert text at cursor position (append mode)
    async appendText(text) {
        const composeBox = document.querySelector('[data-testid="tweetTextarea_0"]');
        if (!composeBox) {
            throw new Error('Could not find compose box');
        }

        const currentText = this.getComposeBoxContent();
        const newText = currentText ? `${currentText} ${text}` : text;
        
        await this.insertReply(newText);
    }

    // Insert text with a prefix (e.g., for replies)
    async insertWithPrefix(text, prefix = '') {
        const finalText = prefix ? `${prefix} ${text}` : text;
        await this.insertReply(finalText);
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextInsertionManager;
}
