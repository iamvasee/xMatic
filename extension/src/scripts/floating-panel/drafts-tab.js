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
                    <h3>Saved Drafts</h3>
                    <p>Manage your saved reply drafts</p>
                </div>
                <div class="tab-actions">
                    <button class="action-button secondary" id="importDrafts">Import</button>
                    <button class="action-button primary" id="newDraft">New Draft</button>
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
            </div>
        `;
        
        this.setupEventListeners(container);
        this.loadDrafts();
    }

    setupEventListeners(container) {
        // Setup event listeners for the drafts tab
        const newDraftBtn = container.querySelector('#newDraft');
        const importBtn = container.querySelector('#importDrafts');
        
        if (newDraftBtn) {
            newDraftBtn.addEventListener('click', () => this.handleNewDraft());
        }
        
        if (importBtn) {
            importBtn.addEventListener('click', () => this.handleImport());
        }
    }

    loadDrafts() {
        // Load saved drafts from storage
        console.log('xMatic: Loading drafts...');
        // TODO: Integrate with Chrome storage
        this.displayDrafts([]);
    }

    displayDrafts(drafts) {
        const draftsList = document.querySelector('#draftsList');
        if (!draftsList) return;

        if (drafts.length === 0) {
            draftsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📄</div>
                    <h4>No drafts yet</h4>
                    <p>Your saved drafts will appear here</p>
                </div>
            `;
            return;
        }

        draftsList.innerHTML = drafts.map(draft => `
            <div class="draft-item" data-draft-id="${draft.id}">
                <div class="draft-content">
                    <p class="draft-text">${draft.text}</p>
                    <div class="draft-meta">
                        <span class="draft-date">${draft.createdAt}</span>
                        <span class="draft-style">${draft.style}</span>
                    </div>
                </div>
                <div class="draft-actions">
                    <button class="action-button secondary" onclick="this.editDraft('${draft.id}')">Edit</button>
                    <button class="action-button primary" onclick="this.useDraft('${draft.id}')">Use</button>
                    <button class="action-button secondary" onclick="this.deleteDraft('${draft.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    handleNewDraft() {
        // Handle creating a new draft
        console.log('xMatic: Creating new draft...');
        // TODO: Implement new draft creation
    }

    handleImport() {
        // Handle importing drafts
        console.log('xMatic: Importing drafts...');
        // TODO: Implement draft import functionality
    }

    editDraft(draftId) {
        // Handle editing a draft
        console.log('xMatic: Editing draft:', draftId);
        // TODO: Implement draft editing
    }

    useDraft(draftId) {
        // Handle using a draft
        console.log('xMatic: Using draft:', draftId);
        // TODO: Implement draft usage
    }

    deleteDraft(draftId) {
        // Handle deleting a draft
        console.log('xMatic: Deleting draft:', draftId);
        // TODO: Implement draft deletion
    }
}

// Export for use in floating panel
if (typeof window !== 'undefined') {
    window.DraftsTab = DraftsTab;
}
