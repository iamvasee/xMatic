// xMatic - Floating Panel Manager
class FloatingPanelManager {
    constructor() {
        this.isOpen = false;
        this.currentTab = 'generate';
        this.panel = null;
        this.floatingButton = null;
        this.init();
    }

    init() {
        this.createFloatingButton();
        this.setupEventListeners();
        // Don't load tab content until panel is actually created
    }

    createFloatingButton() {
        // Create floating button with clean design
        this.floatingButton = document.createElement('div');
        this.floatingButton.id = 'xmatic-floating-button';
        this.floatingButton.className = 'xmatic-floating-button';
        this.floatingButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 3L17 10L10 17M3 10H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        
        // Position the button with Shadcn-inspired styling
        this.floatingButton.style.cssText = `
            position: fixed;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 10000;
            cursor: pointer;
            transition: all 0.2s ease;
            width: 48px;
            height: 48px;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            color: #374151;
        `;

        // Add to page
        document.body.appendChild(this.floatingButton);
        
        // Add hover effects
        this.floatingButton.addEventListener('mouseenter', () => {
            if (!this.isOpen) {
                this.floatingButton.style.background = '#f9fafb';
                this.floatingButton.style.borderColor = '#d1d5db';
                this.floatingButton.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }
        });
        
        this.floatingButton.addEventListener('mouseleave', () => {
            if (!this.isOpen) {
                this.floatingButton.style.background = '#ffffff';
                this.floatingButton.style.borderColor = '#e5e7eb';
                this.floatingButton.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }
        });
    }

    setupEventListeners() {
        // Floating button click
        this.floatingButton.addEventListener('click', () => {
            this.togglePanel();
        });

        // Close button - use event delegation since button is created dynamically
        document.addEventListener('click', (e) => {
            if (e.target.closest('#closePanel') || e.target.id === 'closePanel') {
                console.log('xMatic: Close button clicked via delegation');
                this.closePanel();
            }
        });

        // Tab navigation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-button')) {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            }
        });

        // Close panel when clicking outside (but not inside the panel)
        document.addEventListener('click', (e) => {
            // Only close if clicking outside both the panel and the floating button
            const isClickingInsidePanel = e.target.closest('#xmatic-panel-container');
            const isClickingOnFloatingButton = e.target.closest('#xmatic-floating-button');
            
            if (this.isOpen && !isClickingInsidePanel && !isClickingOnFloatingButton) {
                this.closePanel();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closePanel();
            }
        });
    }

    togglePanel() {
        if (this.isOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }

    openPanel() {
        console.log('xMatic: openPanel() called, isOpen:', this.isOpen);
        if (this.isOpen) {
            console.log('xMatic: Panel already open, returning');
            return;
        }

        // Create panel if it doesn't exist
        if (!this.panel) {
            console.log('xMatic: Creating new panel...');
            this.createPanel();
        }

        // Show panel
        this.panel.style.display = 'block';
        this.panel.style.transform = 'translateX(0)';
        this.isOpen = true;
        console.log('xMatic: Panel opened, isOpen:', this.isOpen);

        // Update floating button
        this.floatingButton.style.transform = 'translateY(-50%) scale(0.95)';
        this.floatingButton.style.background = '#f9fafb';
        this.floatingButton.style.borderColor = '#d1d5db';
        
        // Load current tab content
        this.loadTabContent();
        console.log('xMatic: Panel open complete');
    }

    closePanel() {
        console.log('xMatic: closePanel() called, isOpen:', this.isOpen);
        if (!this.isOpen) {
            console.log('xMatic: Panel already closed, returning');
            return;
        }

        console.log('xMatic: Closing panel...');
        // Hide panel
        this.panel.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (this.panel) {
                this.panel.style.display = 'none';
                console.log('xMatic: Panel hidden');
            }
        }, 300);

        this.isOpen = false;
        console.log('xMatic: Panel closed, isOpen:', this.isOpen);

        // Reset floating button
        this.floatingButton.style.transform = 'translateY(-50%) scale(1)';
        this.floatingButton.style.background = '#ffffff';
        this.floatingButton.style.borderColor = '#e5e7eb';
        console.log('xMatic: Floating button reset');
    }

    createPanel() {
        // Create panel container
        this.panel = document.createElement('div');
        this.panel.id = 'xmatic-panel-container';
        this.panel.style.cssText = `
            position: fixed;
            top: 0;
            right: 0;
            width: 50vw;
            min-width: 600px;
            max-width: 800px;
            height: 100vh;
            background: #ffffff;
            box-shadow: -4px 0 25px rgba(0, 0, 0, 0.08);
            z-index: 10001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            border-left: 1px solid #e5e7eb;
        `;

        // Load panel content
        this.loadPanelHTML();

        // Add to page
        document.body.appendChild(this.panel);
        
        // Set up close button event listener directly
        const closeButton = this.panel.querySelector('#closePanel');
        if (closeButton) {
            closeButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('xMatic: Close button clicked');
                this.closePanel();
            });
            console.log('xMatic: Close button event listener added');
            
            // Also add mousedown event as backup
            closeButton.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('xMatic: Close button mousedown');
                this.closePanel();
            });
        } else {
            console.warn('xMatic: Close button not found');
        }
    }

    loadPanelHTML() {
        // Create panel HTML directly to avoid CSP issues
        this.panel.innerHTML = `
            <div class="panel-header">
                <div class="panel-logo">
                    <img src="${chrome.runtime.getURL('src/assets/xMatic.png')}" alt="xMatic" class="logo-image">
                    <div class="own-key-chip">Own Key</div>
                </div>
                <button class="close-button" id="closePanel" aria-label="Close panel">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>

            <div class="tab-navigation">
                <div class="tab-container">
                    <button class="tab-button active" data-tab="generate">Generate</button>
                    <button class="tab-button" data-tab="drafts">Drafts</button>
                    <button class="tab-button" data-tab="style">Style</button>
                    <button class="tab-button" data-tab="ai">AI</button>
                </div>
            </div>

            <div class="tab-content">
                <div id="generate-tab" class="tab-pane active">
                    <div class="generate-content"></div>
                </div>

                <div id="drafts-tab" class="tab-pane">
                    <div class="drafts-content"></div>
                </div>

                <div id="style-tab" class="tab-pane">
                    <div class="style-content"></div>
                </div>

                <div id="ai-tab" class="tab-pane">
                    <div class="ai-content"></div>
                </div>
            </div>

            <div class="panel-footer">
                <div class="footer-content">
                    <div class="social-links">
                        <a href="https://xmatic.app/" target="_blank" rel="noopener noreferrer" class="social-link" title="Visit Landing Page">
                            <svg class="social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                        </a>
                        <a href="https://github.com/iamvasee/xMatic" target="_blank" rel="noopener noreferrer" class="social-link" title="View on GitHub">
                            <svg class="social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7a3.37 3.37 0 0 0-.94 2.6V22"></path>
                            </svg>
                        </a>
                        <a href="https://x.com/iamvasee" target="_blank" rel="noopener noreferrer" class="social-link" title="Follow on X">
                            <svg class="social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                            </svg>
                        </a>
                        <a href="https://chromewebstore.google.com/detail/xmatic/jhgjeaklmjohgmnephiaeiefejdhfnml" target="_blank" rel="noopener noreferrer" class="social-link" title="Rate on Chrome Web Store">
                            <svg class="social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                            </svg>
                        </a>
                    </div>
                    
                    <div class="footer-info" id="panelStatus">
                        <span class="info-icon">🚀</span>
                        <span class="info-text">Own Key v2.2.2</span>
                        <span class="info-separator">•</span>
                        <span class="status-dot"></span>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize tab functionality
        this.initializeTabs();
    }

    initializeTabs() {
        // Set up tab switching
        const tabButtons = this.panel.querySelectorAll('.tab-button');
        const tabPanes = this.panel.querySelectorAll('.tab-pane');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Update active tab button
        const tabButtons = this.panel.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => btn.classList.remove('active'));
        
        const activeButton = this.panel.querySelector(`[data-tab="${tabName}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Update active tab pane
        const tabPanes = this.panel.querySelectorAll('.tab-pane');
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        const activePane = this.panel.querySelector(`#${tabName}-tab`);
        if (activePane) {
            activePane.classList.add('active');
        }

        this.currentTab = tabName;
        this.loadTabContent();
    }

    loadTabContent() {
        // Only load tab content if panel exists
        if (!this.panel) return;
        
        // Load specific tab content based on current tab
        switch (this.currentTab) {
            case 'generate':
                this.loadGenerateTab();
                break;
            case 'drafts':
                this.loadDraftsTab();
                break;
            case 'style':
                this.loadStyleTab();
                break;
            case 'ai':
                this.loadAITab();
                break;
        }
    }

    loadGenerateTab() {
        // Load generate tab content from module
        if (!this.panel) return;
        const generateContent = this.panel.querySelector('.generate-content');
        if (generateContent && window.GenerateTab) {
            const generateTab = new window.GenerateTab();
            generateTab.render(generateContent);
        }
    }

    loadDraftsTab() {
        // Load drafts tab content from module
        if (!this.panel) return;
        const draftsContent = this.panel.querySelector('.drafts-content');
        if (draftsContent && window.DraftsTab) {
            const draftsTab = new window.DraftsTab();
            draftsTab.render(draftsContent);
        }
    }

    loadStyleTab() {
        // Load style tab content from module
        if (!this.panel) return;
        const styleContent = this.panel.querySelector('.style-content');
        if (styleContent && window.StyleTab) {
            const styleTab = new window.StyleTab();
            styleTab.render(styleContent);
        }
    }

    loadAITab() {
        // Load AI tab content from module
        console.log('xMatic: Loading AI tab...');
        if (!this.panel) {
            console.log('xMatic: Panel not found');
            return;
        }
        const aiContent = this.panel.querySelector('.ai-content');
        console.log('xMatic: AI content element:', aiContent);
        console.log('xMatic: AITab class available:', window.AITab);
        if (aiContent && window.AITab) {
            console.log('xMatic: Creating AI tab instance...');
            const aiTab = new window.AITab();
            aiTab.render(aiContent);
        } else {
            console.log('xMatic: Missing aiContent or AITab class');
        }
    }

    // Public methods for external access
    getCurrentTab() {
        return this.currentTab;
    }

    isPanelOpen() {
        return this.isOpen;
    }

    updateStatus(status, type = 'info') {
        const statusIndicator = this.panel?.querySelector('#panelStatus');
        if (statusIndicator) {
            const statusText = statusIndicator.querySelector('.status-text');
            const statusDot = statusIndicator.querySelector('.status-dot');
            
            if (statusText) statusText.textContent = status;
            if (statusDot) {
                statusDot.className = `status-dot ${type}`;
            }
        }
    }
}

// Initialize floating panel when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.xMaticPanel = new FloatingPanelManager();
    });
} else {
    window.xMaticPanel = new FloatingPanelManager();
}
