// xMatic - Drafts Tab Script
// This file will handle saved reply drafts management

class DraftsTab {
    constructor() {
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
            
            <div class="drafts-content">
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
    }

    setupEventListeners(container) {
        // Listen for drafts updates from generate tab
        window.addEventListener('draftsUpdated', (event) => {
            console.log('xMatic: 📄 Drafts tab - Received drafts update event');
            this.handleDraftsUpdate(event.detail.newDrafts);
        });
        
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
        
        draftsList.innerHTML = Object.entries(contextGroups).map(([context, contextDrafts]) => {
            const timestamp = new Date(contextDrafts[0].createdAt).toLocaleString();
            const contextPreview = context.length > 80 ? context.substring(0, 80) + '...' : context;
            
            return `
                <div class="context-group" data-context="${context}">
                    <div class="context-header">
                        <div class="context-info">
                            <h4 class="context-title">${contextPreview}</h4>
                            <span class="context-timestamp">${timestamp}</span>
                            <span class="tweet-count">${contextDrafts.length} tweet${contextDrafts.length > 1 ? 's' : ''}</span>
                        </div>

                    </div>
                    <div class="tweets-container">
                        ${contextDrafts.map(draft => `
                            <div class="tweet-item" data-draft-id="${draft.id}">
                                <div class="tweet-content">
                                    <p class="tweet-text">${draft.text}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
        
        console.log('xMatic: 📄 Drafts HTML rendered with context grouping');
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
}

// Export for use in floating panel
if (typeof window !== 'undefined') {
    window.DraftsTab = DraftsTab;
}
