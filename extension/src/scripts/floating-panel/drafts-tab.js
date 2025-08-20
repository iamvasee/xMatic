// xMatic - Drafts Tab Script
// This file will handle saved reply drafts management

class DraftsTab {
    constructor() {
        this.isPublishing = false; // Flag to prevent multiple simultaneous publishes
        this.init();
    }

    init() {
        // Initialize drafts tab functionality
        console.log('xMatic: Drafts tab initialized');
    }

    render(container) {
        // Render the drafts tab content
        container.innerHTML = `
            <div class="tab-header">
                <div class="tab-header-content">
                    <h3>Generated Tweets</h3>
                    <p>Your AI-generated tweets and saved drafts</p>
                </div>
            </div>
                
                <div class="drafts-list" id="draftsList">
                    <div class="empty-state">
                        <div class="empty-icon">📄</div>
                        <h4>No drafts yet</h4>
                        <p>Your saved drafts will appear here</p>
                    </div>
                </div>
                
                <!-- Bottom Spacing for Footer -->
                <div class="bottom-spacing"></div>
            </div>
        `;
        
        this.setupEventListeners(container);
        this.loadDrafts();
        
        // Setup action button event listeners after drafts are loaded
        this.setupActionButtonListeners();
    }

    setupEventListeners(container) {
        // Listen for drafts updates from generate tab
        window.addEventListener('draftsUpdated', (event) => {
            console.log('xMatic: 📄 Drafts tab - Received drafts update event');
            this.handleDraftsUpdate(event.detail.newDrafts);
        });
        
        // Add test button listeners for debugging
        setTimeout(() => {
            const testPublishBtn = document.getElementById('testPublishBtn');
            const testClickBtn = document.getElementById('testClickBtn');
            
            if (testPublishBtn) {
                console.log('xMatic: 📄 Test publish button found, adding listener');
                testPublishBtn.addEventListener('click', (e) => {
                    console.log('xMatic: 📄 Test publish button clicked!');
                    this.handlePublishTweet('test-123');
                });
            } else {
                console.warn('xMatic: 📄 Test publish button not found');
            }
            
            if (testClickBtn) {
                console.log('xMatic: 📄 Test click button found, adding listener');
                testClickBtn.addEventListener('click', (e) => {
                    console.log('xMatic: 📄 Test click button clicked!');
                    alert('Click event is working!');
                });
            } else {
                console.warn('xMatic: 📄 Test click button not found');
            }
        }, 200);
        
        console.log('xMatic: 📄 Drafts tab - All event listeners set up successfully');
    }

    loadDrafts() {
        // Load saved drafts from storage
        console.log('xMatic: 📄 Loading drafts...');
        
        // Try to use StorageManager if available
        if (window.StorageManager) {
            try {
                const storageManager = new window.StorageManager();
                this.loadDraftsWithStorageManager(storageManager);
            } catch (error) {
                console.warn('xMatic: 📄 StorageManager failed, falling back to direct storage:', error);
                this.loadDraftsDirectly();
            }
        } else {
            // Fallback to direct storage
            this.loadDraftsDirectly();
        }
    }

    async loadDraftsWithStorageManager(storageManager) {
        try {
            console.log('xMatic: 📄 Using StorageManager to load drafts...');
            
            const drafts = await storageManager.getConfigValue('drafts') || [];
            console.log('xMatic: 📄 Found', drafts.length, 'drafts using StorageManager');
            this.displayDrafts(drafts);
            
        } catch (error) {
            console.error('xMatic: 📄 StorageManager load failed:', error);
            // Fallback to direct storage
            this.loadDraftsDirectly();
        }
    }

    loadDraftsDirectly() {
        console.log('xMatic: 📄 Loading drafts from all storage sources for maximum persistence...');
        
        // Try sync storage first (most persistent across sessions)
        chrome.storage.sync.get(['drafts'], (syncResult) => {
            const syncDrafts = syncResult.drafts || [];
            console.log('xMatic: 📄 Found', syncDrafts.length, 'drafts in sync storage');
            
            // Also check local storage
            chrome.storage.local.get(['drafts'], (localResult) => {
                const localDrafts = localResult.drafts || [];
                console.log('xMatic: 📄 Found', localDrafts.length, 'drafts in local storage');
                
                // Check localStorage as last resort
                let localStorageDrafts = [];
                try {
                    localStorageDrafts = JSON.parse(localStorage.getItem('xMatic_drafts') || '[]');
                    console.log('xMatic: 📄 Found', localStorageDrafts.length, 'drafts in localStorage');
                } catch (error) {
                    console.log('xMatic: 📄 No drafts in localStorage');
                }
                
                // Combine all sources and deduplicate
                const allDrafts = [...syncDrafts, ...localDrafts, ...localStorageDrafts];
                const uniqueDrafts = this.deduplicateDrafts(allDrafts);
                
                console.log('xMatic: 📄 Combined total drafts from all sources:', uniqueDrafts.length);
                this.displayDrafts(uniqueDrafts);
            });
        });
    }

    displayDrafts(drafts) {
        const draftsList = document.querySelector('#draftsList');
        if (!draftsList) return;

        if (drafts.length === 0) {
            draftsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📄</div>
                    <h4>No tweets generated yet</h4>
                    <p>Generate some tweets in the Generate tab to see them here</p>
                </div>
            `;
            return;
        }

        // Group drafts by context
        const contextGroups = this.groupDraftsByContext(drafts);
        console.log('xMatic: 📄 Grouped drafts by context:', contextGroups);
        
        const htmlContent = Object.entries(contextGroups).map(([context, contextDrafts]) => {
            const timestamp = new Date(contextDrafts[0].createdAt).toLocaleString();
            const contextPreview = context.length > 80 ? context.substring(0, 80) + '...' : context;
            
            console.log('xMatic: 📄 Processing context:', contextPreview);
            console.log('xMatic: 📄 Drafts in this context:', contextDrafts.length);
            
            const contextHtml = `
                <div class="context-group" data-context="${context}">
                    <div class="context-header">
                        <div class="context-info">
                            <h4 class="context-title">${contextPreview}</h4>
                            <span class="context-timestamp">${timestamp}</span>
                            <span class="tweet-count">${contextDrafts.length} tweet${contextDrafts.length > 1 ? 's' : ''}</span>
                        </div>

                    </div>
                    <div class="tweets-container">
                        ${contextDrafts.map(draft => {
                            console.log('xMatic: 📄 Creating tweet item for draft:', {
                                id: draft.id,
                                text: draft.text?.substring(0, 50) + '...',
                                hasId: !!draft.id,
                                hasText: !!draft.text
                            });
                            
                            return `
                                <div class="tweet-item" data-draft-id="${draft.id}">
                                    <div class="tweet-content">
                                        <p class="tweet-text">${draft.text}</p>
                                    </div>
                                    <div class="tweet-actions">
                                        <button class="action-btn primary" data-action="publish" data-draft-id="${draft.id}">
                                            <span class="btn-text">Publish</span>
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
            
            console.log('xMatic: 📄 Context HTML generated:', contextHtml.substring(0, 200) + '...');
            return contextHtml;
        }).join('');
        
        console.log('xMatic: 📄 Final HTML length:', htmlContent.length);
        console.log('xMatic: 📄 Setting innerHTML...');
        
        draftsList.innerHTML = htmlContent;
        
        console.log('xMatic: 📄 Drafts HTML rendered with context grouping');
        console.log('xMatic: 📄 Final DOM structure:', draftsList.innerHTML.substring(0, 500) + '...');
        
        // Verify buttons were created
        const actionButtons = draftsList.querySelectorAll('.action-btn');
        console.log('xMatic: 📄 Action buttons found after rendering:', actionButtons.length);
        
        actionButtons.forEach((button, index) => {
            console.log(`xMatic: 📄 Button ${index + 1} details:`, {
                action: button.dataset.action,
                draftId: button.dataset.draftId,
                text: button.textContent,
                classes: button.className
            });
        });
    }

    groupDraftsByContext(drafts) {
        // Group drafts by their context
        const groups = {};
        drafts.forEach(draft => {
            if (!groups[draft.context]) {
                groups[draft.context] = [];
            }
            groups[draft.context].push(draft);
        });
        return groups;
    }

    deduplicateDrafts(drafts) {
        // Remove duplicate drafts based on ID
        const seen = new Set();
        return drafts.filter(draft => {
            if (seen.has(draft.id)) {
                return false;
            }
            seen.add(draft.id);
            return true;
        });
    }



    deleteDraft(draftId) {
        // Handle deleting a draft
        console.log('xMatic: 📄 Deleting draft:', draftId);
        // TODO: Implement draft deletion
    }











    handleDraftsUpdate(newDrafts) {
        // Handle new drafts from generate tab
        console.log('xMatic: 📄 Drafts tab - Handling update with', newDrafts.length, 'new drafts');
        
        // Force reload drafts to show new content
        setTimeout(() => {
            console.log('xMatic: 📄 Drafts tab - Forcing reload after update...');
            this.loadDrafts();
        }, 100);
        
        // Show notification
        this.showNewDraftsNotification(newDrafts.length);
    }

    showNewDraftsNotification(count) {
        console.log('xMatic: 📄 Drafts tab - Showing notification for', count, 'new drafts');
        // TODO: Show user notification about new drafts
    }

    setupActionButtonListeners() {
        console.log('xMatic: 📄 Setting up action button listeners...');
        
        // Clear any existing timeouts
        if (this._setupTimeout) {
            clearTimeout(this._setupTimeout);
        }
        
        // Wait a bit for DOM to be ready
        this._setupTimeout = setTimeout(() => {
            this.attachActionButtonListeners();
        }, 100);
    }
    
    attachActionButtonListeners() {
        console.log('xMatic: 📄 Attaching action button listeners...');
        
        // First, remove all existing listeners from previous runs
        this.removeAllActionButtonListeners();
        
        // Find all action buttons
        const actionButtons = document.querySelectorAll('.action-btn');
        console.log('xMatic: 📄 Found action buttons:', actionButtons.length);
        
        if (actionButtons.length === 0) {
            console.warn('xMatic: 📄 No action buttons found in DOM');
            console.log('xMatic: 📄 Current DOM structure:', document.querySelector('#draftsList')?.innerHTML || 'No drafts list');
            return;
        }
        
        // Log each button's details
        actionButtons.forEach((button, index) => {
            const action = button.dataset.action;
            const draftId = button.dataset.draftId;
            const buttonText = button.textContent;
            
            console.log(`xMatic: 📄 Button ${index + 1}:`, {
                action,
                draftId,
                buttonText,
                element: button,
                dataset: button.dataset
            });
            
            // Create a unique handler for this button
            const boundHandler = this.handleButtonClick.bind(this);
            
            // Add new listener
            button.addEventListener('click', boundHandler);
            
            // Store the bound handler for removal later
            button._boundHandler = boundHandler;
            
            console.log(`xMatic: 📄 Event listener attached to button ${index + 1}`);
        });
        
        console.log('xMatic: 📄 All action button listeners attached successfully');
    }
    
    removeAllActionButtonListeners() {
        console.log('xMatic: 📄 Removing all existing action button listeners...');
        
        const allActionButtons = document.querySelectorAll('.action-btn');
        allActionButtons.forEach((button, index) => {
            if (button._boundHandler) {
                button.removeEventListener('click', button._boundHandler);
                delete button._boundHandler;
                console.log(`xMatic: 📄 Removed listener from button ${index + 1}`);
            }
        });
    }
    
    handleButtonClick(e) {
        console.log('xMatic: 📄 Button click event triggered!');
        console.log('xMatic: 📄 Event details:', {
            target: e.target,
            currentTarget: e.currentTarget,
            type: e.type,
            bubbles: e.bubbles
        });
        
        const button = e.currentTarget;
        const action = button.dataset.action;
        const draftId = button.dataset.draftId;
        
        console.log('xMatic: 📄 Button data:', { action, draftId });
        console.log('xMatic: 📄 Button element:', button);
        
        if (!action) {
            console.error('xMatic: 📄 No action found in button dataset');
            return;
        }
        
        if (!draftId) {
            console.error('xMatic: 📄 No draft ID found in button dataset');
            return;
        }
        
        console.log('xMatic: 📄 Processing action:', action, 'for draft:', draftId);
        
        switch (action) {
            case 'publish':
                console.log('xMatic: 📄 Calling handlePublishTweet with draftId:', draftId);
                // Add small delay to prevent rapid successive clicks
                setTimeout(() => {
                    this.handlePublishTweet(draftId);
                }, 100);
                break;
            default:
                console.warn('xMatic: 📄 Unknown action:', action);
        }
    }

    handlePublishTweet(draftId) {
        console.log('xMatic: 📄 Publish tweet clicked for draft:', draftId);
        
        // Prevent multiple simultaneous publishes
        if (this.isPublishing) {
            console.log('xMatic: 📄 Already publishing, ignoring duplicate click');
            return;
        }
        
        this.isPublishing = true;
        console.log('xMatic: 📄 Publishing flag set to true');
        
        try {
            // Method 1: Try to find by data-draft-id attribute
            let draftElement = document.querySelector(`[data-draft-id="${draftId}"]`);
            
            // Method 2: If not found, try to find by draft ID in the context group
            if (!draftElement) {
                console.log('xMatic: 📄 Method 1 failed, trying method 2...');
                const contextGroups = document.querySelectorAll('.context-group');
                for (const group of contextGroups) {
                    const tweetItem = group.querySelector(`[data-draft-id="${draftId}"]`);
                    if (tweetItem) {
                        draftElement = tweetItem;
                        break;
                    }
                }
            }
            
            // Method 3: If still not found, try to find by text content (fallback)
            if (!draftElement) {
                console.log('xMatic: 📄 Method 2 failed, trying method 3...');
                const allTweetItems = document.querySelectorAll('.tweet-item');
                for (const item of allTweetItems) {
                    const textElement = item.querySelector('.tweet-text');
                    if (textElement && textElement.textContent.trim()) {
                        draftElement = item;
                        break;
                    }
                }
            }
            
            if (!draftElement) {
                console.error('xMatic: 📄 Draft element not found after all methods:', draftId);
                this.showError('Could not find the tweet to publish');
                this.isPublishing = false; // Reset flag
                return;
            }
            
            console.log('xMatic: 📄 Draft element found:', draftElement);
            
            // Get the tweet text
            const tweetTextElement = draftElement.querySelector('.tweet-text');
            if (!tweetTextElement) {
                console.error('xMatic: 📄 Tweet text element not found');
                this.showError('Could not extract tweet text');
                this.isPublishing = false; // Reset flag
                return;
            }
            
            const tweetText = tweetTextElement.textContent.trim();
            if (!tweetText) {
                console.error('xMatic: 📄 Tweet text is empty');
                this.showError('Tweet text is empty');
                this.isPublishing = false; // Reset flag
                return;
            }
            
            console.log('xMatic: 📄 Publishing tweet text:', tweetText);
            console.log('xMatic: 📄 Tweet length:', tweetText.length, 'characters');
            
            // Validate tweet length (Twitter limit is 280 characters)
            if (tweetText.length > 280) {
                console.warn('xMatic: 📄 Tweet exceeds 280 characters:', tweetText.length);
                this.showWarning(`Tweet is ${tweetText.length} characters (Twitter limit: 280)`);
            }
            
            // Create Twitter intent URL with better parameters
            const encodedText = encodeURIComponent(tweetText);
            const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
            
            // Also create a direct compose URL as fallback
            const directComposeUrl = `https://twitter.com/compose/tweet`;
            
            console.log('xMatic: 📄 Twitter intent URL created:', twitterIntentUrl);
            
            // Try multiple methods to open Twitter intent
            let newTab = null;
            let openMethod = 'unknown';
            
            // Method 1: Try window.open with basic parameters
            try {
                console.log('xMatic: 📄 Trying Method 1: window.open with basic params');
                newTab = window.open(twitterIntentUrl, '_blank');
                openMethod = 'basic';
            } catch (error) {
                console.log('xMatic: 📄 Method 1 failed:', error);
            }
            
            // Method 2: Try window.open with specific features
            if (!newTab) {
                try {
                    console.log('xMatic: 📄 Trying Method 2: window.open with specific features');
                    newTab = window.open(twitterIntentUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
                    openMethod = 'features';
                } catch (error) {
                    console.log('xMatic: 📄 Method 2 failed:', error);
                }
            }
            
            // Method 3: Try creating a link and clicking it
            if (!newTab) {
                try {
                    console.log('xMatic: 📄 Trying Method 3: Create and click link');
                    const link = document.createElement('a');
                    link.href = twitterIntentUrl;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    openMethod = 'link-click';
                    console.log('xMatic: 📄 Method 3 completed (link clicked)');
                } catch (error) {
                    console.log('xMatic: 📄 Method 3 failed:', error);
                }
            }
            
            // Method 4: Try direct compose URL (better fallback)
            if (!newTab && openMethod === 'unknown') {
                try {
                    console.log('xMatic: 📄 Trying Method 4: Direct compose URL');
                    newTab = window.open(directComposeUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
                    if (newTab) {
                        openMethod = 'direct-compose';
                        console.log('xMatic: 📄 Method 4 completed (direct compose opened)');
                        
                        // Wait for the page to load, then inject robot button and fix interface
                        setTimeout(() => {
                            this.injectRobotButtonAndFixInterface(newTab, tweetText);
                        }, 3000);
                        
                        // Don't close this tab - let user publish manually
                        console.log('xMatic: 📄 Keeping direct compose tab open for manual publishing');
                        return; // Exit early since we're handling this differently
                    }
                } catch (error) {
                    console.log('xMatic: 📄 Method 4 failed:', error);
                }
            }
            
            // Method 4.5: Try Twitter's new compose URL with text parameter
            if (!newTab && openMethod === 'unknown') {
                try {
                    console.log('xMatic: 📄 Trying Method 4.5: Twitter compose with text parameter');
                    const composeWithTextUrl = `https://twitter.com/compose/tweet?text=${encodedText}`;
                    newTab = window.open(composeWithTextUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
                    if (newTab) {
                        openMethod = 'compose-with-text';
                        console.log('xMatic: 📄 Method 4.5 completed (compose with text opened)');
                        
                        // Inject our robot button and fix the interface
                        setTimeout(() => {
                            this.injectRobotButtonAndFixInterface(newTab, tweetText);
                        }, 2000);
                        
                        console.log('xMatic: 📄 Keeping compose-with-text tab open for manual publishing');
                        return; // Exit early since we're handling this differently
                    }
                } catch (error) {
                    console.log('xMatic: 📄 Method 4.5 failed:', error);
                }
            }
            
            // Method 5: Try location.href as last resort
            if (!newTab && openMethod === 'unknown') {
                try {
                    console.log('xMatic: 📄 Trying Method 5: location.href (last resort)');
                    window.location.href = twitterIntentUrl;
                    openMethod = 'location-href';
                    console.log('xMatic: 📄 Method 5 completed (redirecting)');
                    return; // Exit early since we're redirecting
                } catch (error) {
                    console.log('xMatic: 📄 Method 5 failed:', error);
                }
            }
            
            console.log('xMatic: 📄 Final result - Method used:', openMethod, 'New tab:', newTab);
            
            if (newTab) {
                console.log('xMatic: 📄 Twitter intent tab opened successfully using method:', openMethod);
                this.showSuccess('Opening Twitter to publish your tweet...');
                
                // Only auto-close for intent URLs, not for direct compose methods
                if (openMethod === 'basic' || openMethod === 'features' || openMethod === 'link-click') {
                    // Close the tab after a delay (Twitter loads)
                    setTimeout(() => {
                        try {
                            if (newTab && !newTab.closed) {
                                newTab.close();
                                console.log('xMatic: 📄 Twitter intent tab closed automatically');
                            }
                        } catch (error) {
                            console.log('xMatic: 📄 Could not close tab (user may have closed it manually):', error);
                        }
                    }, 30000); // 30 second delay for better user experience
                } else {
                    console.log('xMatic: 📄 Keeping tab open for method:', openMethod);
                }
                
            } else if (openMethod === 'link-click') {
                console.log('xMatic: 📄 Link click method completed - tab may have opened');
                this.showSuccess('Twitter link clicked - check for new tab');
                
            } else if (openMethod === 'direct-compose') {
                console.log('xMatic: 📄 Direct compose method completed');
                this.showSuccess('Opening Twitter compose page - text will be inserted automatically');
                
            } else if (openMethod === 'compose-with-text') {
                console.log('xMatic: 📄 Compose with text method completed');
                this.showSuccess('Opening Twitter compose page with pre-filled text - ready to publish!');
                
            } else if (openMethod === 'location-href') {
                console.log('xMatic: 📄 Location redirect method completed');
                this.showSuccess('Redirecting to Twitter...');
                
            } else {
                console.error('xMatic: 📄 All methods failed to open Twitter intent');
                
                // Create a manual link as last resort
                this.createManualTwitterLink(twitterIntentUrl);
                
                this.showError('Failed to open Twitter automatically. Click the link above to open manually.');
                this.isPublishing = false; // Reset flag
            }
            
        } catch (error) {
            console.error('xMatic: 📄 Error in handlePublishTweet:', error);
            this.showError('An error occurred while publishing the tweet');
            this.isPublishing = false; // Reset flag
        } finally {
            // Always reset the publishing flag
            this.isPublishing = false;
            console.log('xMatic: 📄 Publishing flag reset to false');
        }
    }
    
    showSuccess(message) {
        console.log('xMatic: 📄 Success:', message);
        // TODO: Show success notification to user
    }
    
    showError(message) {
        console.error('xMatic: 📄 Error:', message);
        // TODO: Show error notification to user
    }
    
    showWarning(message) {
        console.warn('xMatic: 📄 Warning:', message);
        // TODO: Show warning notification to user
    }
    
    createManualTwitterLink(twitterIntentUrl) {
        console.log('xMatic: 📄 Creating manual Twitter link as fallback');
        
        // Find the drafts list to add the manual link
        const draftsList = document.querySelector('#draftsList');
        if (!draftsList) return;
        
        // Create manual link element
        const manualLinkDiv = document.createElement('div');
        manualLinkDiv.className = 'manual-twitter-link';
        manualLinkDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1da1f2;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 300px;
            text-align: center;
        `;
        
        manualLinkDiv.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: bold;">🐦 Twitter Publish Link</div>
            <a href="${twitterIntentUrl}" target="_blank" rel="noopener noreferrer" 
               style="color: white; text-decoration: underline; word-break: break-all;">
                Click here to open Twitter
            </a>
            <button onclick="this.parentElement.remove()" 
                    style="margin-top: 10px; background: rgba(255,255,255,0.2); border: none; color: white; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                ✕ Close
            </button>
        `;
        
        // Add to page
        document.body.appendChild(manualLinkDiv);
        
        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (manualLinkDiv.parentElement) {
                manualLinkDiv.remove();
            }
        }, 30000);
        
        console.log('xMatic: 📄 Manual Twitter link created and displayed');
    }
    
    insertTextIntoCompose(tab, tweetText) {
        try {
            console.log('xMatic: 📄 Attempting to insert text into compose box in new tab');
            
            // Try to access the new tab's document
            if (tab && !tab.closed) {
                // Wait a bit more for the page to fully load
                setTimeout(() => {
                    try {
                        // Try to find the compose box in the new tab
                        const composeBox = tab.document.querySelector('[data-testid="tweetTextarea_0"]');
                        if (composeBox) {
                            console.log('xMatic: 📄 Found compose box, inserting text');
                            
                            // Focus the compose box
                            composeBox.focus();
                            
                            // Insert the text
                            composeBox.value = tweetText;
                            
                            // Trigger input event to make Twitter recognize the content
                            const inputEvent = new Event('input', { bubbles: true });
                            composeBox.dispatchEvent(inputEvent);
                            
                            console.log('xMatic: 📄 Text inserted successfully into compose box');
                            
                            // Show success message in the new tab
                            this.showMessageInTab(tab, '✅ Tweet text inserted! Click Post to publish.');
                            
                        } else {
                            console.log('xMatic: 📄 Compose box not found, trying alternative selectors');
                            
                            // Try alternative selectors
                            const alternativeSelectors = [
                                '[data-testid="tweetTextarea_1"]',
                                '[data-testid="tweetTextarea_2"]',
                                'textarea[placeholder*="What"]',
                                'textarea[placeholder*="Tweet"]',
                                'textarea[placeholder*="Post"]'
                            ];
                            
                            for (const selector of alternativeSelectors) {
                                const altComposeBox = tab.document.querySelector(selector);
                                if (altComposeBox) {
                                    console.log('xMatic: 📄 Found compose box with selector:', selector);
                                    altComposeBox.focus();
                                    altComposeBox.value = tweetText;
                                    altComposeBox.dispatchEvent(new Event('input', { bubbles: true }));
                                    this.showMessageInTab(tab, '✅ Tweet text inserted! Click Post to publish.');
                                    return;
                                }
                            }
                            
                            console.log('xMatic: 📄 No compose box found with any selector');
                            this.showMessageInTab(tab, '⚠️ Could not find compose box. Please paste the text manually.');
                        }
                    } catch (error) {
                        console.error('xMatic: 📄 Error inserting text:', error);
                        this.showMessageInTab(tab, '⚠️ Error inserting text. Please paste manually.');
                    }
                }, 2000); // Wait 2 more seconds for page to load
            }
        } catch (error) {
            console.error('xMatic: 📄 Error in insertTextIntoCompose:', error);
        }
    }
    
    showMessageInTab(tab, message) {
        try {
            if (tab && !tab.closed) {
                // Create a temporary message element
                const messageDiv = tab.document.createElement('div');
                messageDiv.style.cssText = `
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #1da1f2;
                    color: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 10000;
                    font-size: 14px;
                    font-weight: 500;
                `;
                messageDiv.textContent = message;
                
                tab.document.body.appendChild(messageDiv);
                
                // Remove after 5 seconds
                setTimeout(() => {
                    if (messageDiv.parentElement) {
                        messageDiv.remove();
                    }
                }, 5000);
            }
        } catch (error) {
            console.error('xMatic: 📄 Error showing message in tab:', error);
        }
    }
    
    injectRobotButtonAndFixInterface(tab, tweetText) {
        try {
            console.log('xMatic: 📄 Injecting robot button and fixing interface in new tab');
            
            if (!tab || tab.closed) {
                console.log('xMatic: 📄 Tab is closed or invalid');
                return;
            }
            
            // Wait for the page to be fully loaded
            setTimeout(() => {
                try {
                    this.performInterfaceInjection(tab, tweetText);
                } catch (error) {
                    console.error('xMatic: 📄 Error in interface injection:', error);
                }
            }, 1000);
            
        } catch (error) {
            console.error('xMatic: 📄 Error in injectRobotButtonAndFixInterface:', error);
        }
    }
    
    performInterfaceInjection(tab, tweetText) {
        try {
            console.log('xMatic: 📄 Performing interface injection...');
            
            // First, try to find and fix the compose box
            const composeBox = this.findComposeBox(tab);
            if (composeBox) {
                console.log('xMatic: 📄 Found compose box, inserting text');
                this.insertTextIntoComposeBox(tab, composeBox, tweetText);
            }
            
            // Now inject the robot button
            this.injectRobotButton(tab);
            
            // Try to fix the bottom row visibility
            this.fixBottomRowVisibility(tab);
            
            // Show success message
            this.showMessageInTab(tab, '✅ Interface fixed! Robot button added and tweet text inserted.');
            
        } catch (error) {
            console.error('xMatic: 📄 Error in performInterfaceInjection:', error);
        }
    }
    
    findComposeBox(tab) {
        const selectors = [
            '[data-testid="tweetTextarea_0"]',
            '[data-testid="tweetTextarea_1"]',
            '[data-testid="tweetTextarea_2"]',
            'textarea[placeholder*="What"]',
            'textarea[placeholder*="Tweet"]',
            'textarea[placeholder*="Post"]',
            'textarea[placeholder*="Reply"]'
        ];
        
        for (const selector of selectors) {
            const element = tab.document.querySelector(selector);
            if (element) {
                console.log('xMatic: 📄 Found compose box with selector:', selector);
                return element;
            }
        }
        
        console.log('xMatic: 📄 No compose box found');
        return null;
    }
    
    insertTextIntoComposeBox(tab, composeBox, tweetText) {
        try {
            // Focus the compose box
            composeBox.focus();
            
            // Insert the text
            composeBox.value = tweetText;
            
            // Trigger input event to make Twitter recognize the content
            const inputEvent = new Event('input', { bubbles: true });
            composeBox.dispatchEvent(inputEvent);
            
            // Also trigger change event
            const changeEvent = new Event('change', { bubbles: true });
            composeBox.dispatchEvent(changeEvent);
            
            console.log('xMatic: 📄 Text inserted successfully into compose box');
            
        } catch (error) {
            console.error('xMatic: 📄 Error inserting text into compose box:', error);
        }
    }
    
    injectRobotButton(tab) {
        try {
            console.log('xMatic: 📄 Injecting robot button...');
            
            // Create robot button
            const robotButton = tab.document.createElement('div');
            robotButton.className = 'xmatic-ai-btn';
            robotButton.title = 'Generate AI Reply';
            robotButton.setAttribute('role', 'button');
            robotButton.setAttribute('tabindex', '0');
            robotButton.setAttribute('data-xmatic-active', 'true');
            robotButton.setAttribute('data-xmatic-id', `btn-${Date.now()}`);
            
            // Add robot SVG icon
            robotButton.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 168 122" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M113 0C134.539 0 152 17.4609 152 39V83C152 104.539 134.539 122 113 122H55C33.4609 122 16 104.539 16 83V39C16 17.4609 33.4609 3.86556e-07 55 0H113ZM54.5 17C43.7304 17 35 25.7304 35 36.5V85.5C35 96.2696 43.7304 105 54.5 105H113.5C124.27 105 133 96.2696 133 85.5V36.5C133 25.7304 124.27 17 113.5 17H54.5Z" fill="url(#paint0_linear_581_23)"/>
                    <path d="M0 46.3333C0 42.2832 3.28325 39 7.33333 39L16 39V75C16 79.4182 12.4183 83 8 83C3.58172 83 0 79.4182 0 75V46.3333Z" fill="url(#paint1_linear_581_23)"/>
                    <path d="M168 46.3333C168 42.2832 164.717 39 160.667 39L152 39V75C152 79.4182 155.582 83 160 83C164.418 83 168 79.4182 168 75V46.3333Z" fill="url(#paint2_linear_581_23)"/>
                    <path d="M71.9887 47.0844C77.9943 53.9836 79.601 63.6194 74.6772 72.4287C72.1567 76.9383 68.447 79.4618 63.7964 79.8972C58.3084 80.4111 53.8681 78.3785 50.1458 73.335C45.8793 67.5541 46.0276 55.6888 50.1354 49.7408C55.0859 42.5728 64.6404 40.654 71.9887 47.0844Z" fill="url(#paint3_linear_581_23)"/>
                    <path d="M107.384 79.8607C102.257 80.4858 97.8427 79.0565 94.4753 74.5822C90.6246 69.4656 88.9814 63.4627 90.6728 56.556C92.4194 49.424 96.3288 44.7353 102.313 43.4057C108.655 41.9967 114.408 44.2064 118.129 50.8391C121.866 57.5002 122.037 65.1893 118.159 72.161C115.755 76.4837 112.251 79.5653 107.384 79.8607Z" fill="url(#paint4_linear_581_23)"/>
                    <defs>
                        <linearGradient id="paint0_linear_581_23" x1="109.988" y1="74.2377" x2="75.3367" y2="33.2223" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#070707"/>
                            <stop offset="1" stop-color="#6D6D6D"/>
                        </linearGradient>
                        <linearGradient id="paint1_linear_581_23" x1="109.988" y1="74.2377" x2="75.3367" y2="33.2223" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#070707"/>
                            <stop offset="1" stop-color="#6D6D6D"/>
                        </linearGradient>
                        <linearGradient id="paint2_linear_581_23" x1="109.988" y1="74.2377" x2="75.3367" y2="33.2223" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#109.988" y1="74.2377" x2="75.3367" y2="33.2223" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#070707"/>
                            <stop offset="1" stop-color="#6D6D6D"/>
                        </linearGradient>
                        <linearGradient id="paint3_linear_581_23" x1="109.988" y1="74.2377" x2="75.3367" y2="33.2223" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#070707"/>
                            <stop offset="1" stop-color="#6D6D6D"/>
                        </linearGradient>
                        <linearGradient id="paint4_linear_581_23" x1="109.988" y1="74.2377" x2="75.3367" y2="33.2223" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#070707"/>
                            <stop offset="1" stop-color="#6D6D6D"/>
                        </linearGradient>
                    </defs>
                </svg>
            `;
            
            // Style the button to match Twitter's design
            robotButton.style.cssText = `
                background: transparent;
                border: none;
                border-radius: 50%;
                width: 34.75px;
                height: 34.75px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin: 7px 8px 0 0;
                transition: all 0.2s ease;
                padding: 8px;
                color: rgb(83, 100, 113);
                box-shadow: none;
                outline: none;
                vertical-align: middle;
                flex-shrink: 0;
                z-index: 1000;
            `;
            
            // Add click event
            robotButton.addEventListener('click', () => {
                console.log('xMatic: 📄 Robot button clicked in new tab');
                this.showMessageInTab(tab, '🤖 AI Reply generation coming soon!');
            });
            
            // Try to find the toolbar to inject the button
            const toolbar = tab.document.querySelector('[data-testid="toolBar"]');
            if (toolbar) {
                toolbar.appendChild(robotButton);
                console.log('xMatic: 📄 Robot button injected into toolbar');
            } else {
                // Fallback: inject near the compose box
                const composeBox = this.findComposeBox(tab);
                if (composeBox && composeBox.parentElement) {
                    composeBox.parentElement.appendChild(robotButton);
                    console.log('xMatic: 📄 Robot button injected near compose box');
                } else {
                    // Last resort: inject into body
                    tab.document.body.appendChild(robotButton);
                    robotButton.style.position = 'fixed';
                    robotButton.style.top = '20px';
                    robotButton.style.right = '20px';
                    robotButton.style.zIndex = '10000';
                    console.log('xMatic: 📄 Robot button injected as floating element');
                }
            }
            
        } catch (error) {
            console.error('xMatic: 📄 Error injecting robot button:', error);
        }
    }
    
    fixBottomRowVisibility(tab) {
        try {
            console.log('xMatic: 📄 Attempting to fix bottom row visibility...');
            
            // Try to find and fix the bottom row with buttons
            const bottomRowSelectors = [
                '[data-testid="toolBar"]',
                '[data-testid="tweetButtonInline"]',
                '[data-testid="tweetButton"]',
                '.css-1dbjc4n.r-1wbh5a2.r-rs99b7.r-1loqt21.r-18u37iz.r-15zivkp.r-1otgn73.r-1i6wzkk.r-lrvibr'
            ];
            
            for (const selector of bottomRowSelectors) {
                const element = tab.document.querySelector(selector);
                if (element) {
                    console.log('xMatic: 📄 Found bottom row element:', selector);
                    
                    // Make sure it's visible
                    element.style.display = 'flex';
                    element.style.visibility = 'visible';
                    element.style.opacity = '1';
                    element.style.zIndex = '1000';
                    
                    // Try to trigger a re-render
                    element.style.transform = 'translateZ(0)';
                    
                    console.log('xMatic: 📄 Bottom row visibility fixed');
                    break;
                }
            }
            
        } catch (error) {
            console.error('xMatic: 📄 Error fixing bottom row visibility:', error);
        }
    }
}

// Export for use in floating panel
if (typeof window !== 'undefined') {
    window.DraftsTab = DraftsTab;
}
