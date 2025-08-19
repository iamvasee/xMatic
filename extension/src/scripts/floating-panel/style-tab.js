// xMatic - Style Tab Script
// This file will handle response style configuration

class StyleTab {
    constructor() {
        this.init();
    }

    init() {
        // Initialize style tab functionality
        console.log('xMatic: Style tab initialized');
    }

    render(container) {
        // Render the style tab content
        container.innerHTML = `
            <div class="tab-header">
                <div class="tab-header-content">
                    <h3>Response Style</h3>
                    <p>Configure your AI response personality</p>
                </div>
                <div class="tab-actions">
                    <button class="action-button secondary" id="resetStyles">Reset</button>
                    <button class="action-button primary" id="saveStyles">Save</button>
                </div>
            </div>
            
            <div class="style-content">
                <div class="style-grid">
                    <div class="style-card" data-style="professional">
                        <h4>Professional</h4>
                        <p>Formal and business-like</p>
                    </div>
                    <div class="style-card" data-style="casual">
                        <h4>Casual</h4>
                        <p>Friendly and relaxed</p>
                    </div>
                    <div class="style-card" data-style="creative">
                        <h4>Creative</h4>
                        <p>Imaginative and artistic</p>
                    </div>
                    <div class="style-card" data-style="humorous">
                        <h4>Humorous</h4>
                        <p>Witty and entertaining</p>
                    </div>
                    <div class="style-card" data-style="analytical">
                        <h4>Analytical</h4>
                        <p>Logical and data-driven</p>
                    </div>
                    <div class="style-card" data-style="empathetic">
                        <h4>Empathetic</h4>
                        <p>Understanding and supportive</p>
                    </div>
                </div>
                
                <div class="content-card">
                    <div class="card-header">
                        <h4>Custom Instructions</h4>
                        <span class="context-badge">Advanced</span>
                    </div>
                    <div class="card-content">
                        <div class="input-group">
                            <label for="customStyle">Additional Style Instructions</label>
                            <textarea 
                                id="customStyle" 
                                class="config-input" 
                                placeholder="Enter custom style instructions..."
                                rows="4"
                            ></textarea>
                        </div>
                        <div class="style-preview">
                            <h5>Style Preview</h5>
                            <div id="stylePreview" class="preview-content">
                                <p class="placeholder-text">Style preview will appear here...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.setupEventListeners(container);
        this.loadCurrentStyle();
    }

    setupEventListeners(container) {
        // Setup event listeners for the style tab
        const saveBtn = container.querySelector('#saveStyles');
        const resetBtn = container.querySelector('#resetStyles');
        const customStyleInput = container.querySelector('#customStyle');
        const styleCards = container.querySelectorAll('.style-card');
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.handleSave());
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.handleReset());
        }
        
        if (customStyleInput) {
            customStyleInput.addEventListener('input', () => this.handleCustomStyleChange());
        }
        
        // Setup style card selection
        styleCards.forEach(card => {
            card.addEventListener('click', () => this.handleStyleSelection(card));
        });
    }

    loadCurrentStyle() {
        // Load current style configuration
        console.log('xMatic: Loading current style...');
        // TODO: Load from storage manager
        this.updateStylePreview();
    }

    handleStyleSelection(selectedCard) {
        // Handle style card selection
        const allCards = document.querySelectorAll('.style-card');
        allCards.forEach(card => card.classList.remove('selected'));
        selectedCard.classList.add('selected');
        
        const selectedStyle = selectedCard.getAttribute('data-style');
        console.log('xMatic: Selected style:', selectedStyle);
        
        this.updateStylePreview();
    }

    handleCustomStyleChange() {
        // Handle custom style input changes
        console.log('xMatic: Custom style changed...');
        this.updateStylePreview();
    }

    updateStylePreview() {
        // Update the style preview
        const previewElement = document.querySelector('#stylePreview');
        if (!previewElement) return;
        
        const selectedCard = document.querySelector('.style-card.selected');
        const customStyle = document.querySelector('#customStyle')?.value || '';
        
        if (selectedCard) {
            const styleName = selectedCard.querySelector('h4').textContent;
            const styleDesc = selectedCard.querySelector('p').textContent;
            
            previewElement.innerHTML = `
                <div class="preview-example">
                    <strong>${styleName}</strong>: ${styleDesc}
                    ${customStyle ? `<br><em>Custom: ${customStyle}</em>` : ''}
                </div>
            `;
        }
    }

    handleSave() {
        // Handle saving style configuration
        console.log('xMatic: Saving styles...');
        // TODO: Save to storage manager
    }

    handleReset() {
        // Handle resetting style configuration
        console.log('xMatic: Resetting styles...');
        const allCards = document.querySelectorAll('.style-card');
        allCards.forEach(card => card.classList.remove('selected'));
        
        const customStyleInput = document.querySelector('#customStyle');
        if (customStyleInput) {
            customStyleInput.value = '';
        }
        
        this.updateStylePreview();
    }
}

// Export for use in floating panel
if (typeof window !== 'undefined') {
    window.StyleTab = StyleTab;
}
