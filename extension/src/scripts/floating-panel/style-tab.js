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
        console.log('xMatic: 🎨 Style Tab - Starting render...', { container, containerExists: !!container });
        // Render the style tab content
        container.innerHTML = `
            <div class="tab-header">
                <div class="tab-header-content">
                    <h3>Response Style</h3>
                    <p>Configure your AI response personality and tone</p>
                </div>
            </div>
            
            <div class="style-content">
                <!-- Base Style Selection -->
                <div class="simple-form-group">
                    <label>Base Style</label>
                    <div class="style-cards">
                        <button type="button" class="style-card" data-style="professional">
                            <div class="style-card-icon">💼</div>
                            <div class="style-card-content">
                                <h4>Professional</h4>
                                <p>Formal, business-like, and authoritative tone</p>
                            </div>
                        </button>
                        <button type="button" class="style-card" data-style="casual">
                            <div class="style-card-icon">😊</div>
                            <div class="style-card-content">
                                <h4>Casual</h4>
                                <p>Friendly, relaxed, and approachable communication</p>
                            </div>
                        </button>
                        <button type="button" class="style-card" data-style="humorous">
                            <div class="style-card-icon">😄</div>
                            <div class="style-card-content">
                                <h4>Humorous</h4>
                                <p>Witty, playful, and entertaining responses</p>
                            </div>
                        </button>
                        <button type="button" class="style-card" data-style="analytical">
                            <div class="style-card-icon">🔍</div>
                            <div class="style-card-content">
                                <h4>Analytical</h4>
                                <p>Detailed, logical, and data-driven approach</p>
                            </div>
                        </button>
                        <button type="button" class="style-card" data-style="concise">
                            <div class="style-card-icon">⚡</div>
                            <div class="style-card-content">
                                <h4>Concise</h4>
                                <p>Brief, direct, and to-the-point communication</p>
                            </div>
                        </button>
                        <button type="button" class="style-card" data-style="empathetic">
                            <div class="style-card-icon">🤗</div>
                            <div class="style-card-content">
                                <h4>Empathetic</h4>
                                <p>Understanding, supportive, and caring tone</p>
                            </div>
                        </button>
                        <button type="button" class="style-card" data-style="creative">
                            <div class="style-card-icon">🎨</div>
                            <div class="style-card-content">
                                <h4>Creative</h4>
                                <p>Imaginative, innovative, and artistic expression</p>
                            </div>
                        </button>
                        <button type="button" class="style-card" data-style="enthusiastic">
                            <div class="style-card-icon">🔥</div>
                            <div class="style-card-content">
                                <h4>Enthusiastic</h4>
                                <p>Energetic, passionate, and motivational tone</p>
                            </div>
                        </button>
                        <button type="button" class="style-card" data-style="sarcastic">
                            <div class="style-card-icon">😏</div>
                            <div class="style-card-content">
                                <h4>Sarcastic</h4>
                                <p>Witty, ironic, and cleverly humorous</p>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Custom Instructions -->
                <div class="simple-form-group">
                    <label>Custom Instructions</label>
                    <textarea 
                        id="customStyleInput" 
                        class="simple-textarea large" 
                        placeholder="Add your own custom instructions, personality traits, or specific requirements here..."
                        rows="4"
                    ></textarea>
                    <small class="help-text">Your custom instructions will be combined with the selected base style.</small>
                </div>

                <!-- Style Preview -->
                <div class="simple-form-group">
                    <label>Style Preview</label>
                    <div id="stylePreview" class="style-preview">
                        Select a base style or add custom instructions to see a preview...
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="simple-form-group">
                    <div class="style-actions">
                        <button type="button" id="resetStyles" class="style-btn secondary">
                            <span class="btn-text">Reset to Default</span>
                            <span class="btn-loading" style="display: none;">
                                <svg class="spinner" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                                        <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                                        <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                                    </circle>
                                </svg>
                                Resetting...
                            </span>
                        </button>
                        <button type="button" id="saveStyles" class="style-btn primary">
                            <span class="btn-text">Save Style</span>
                            <span class="btn-loading" style="display: none;">
                                <svg class="spinner" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                                        <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                                        <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                                    </circle>
                                </svg>
                                Saving...
                            </span>
                        </button>
                    </div>
                    <div id="styleStatus" class="style-status"></div>
                </div>
                
                <!-- Bottom Spacing for Footer -->
                <div class="bottom-spacing"></div>
            </div>
        `;
        
        console.log('xMatic: 🎨 Style Tab - HTML rendered, setting up event listeners...');
        this.setupEventListeners(container);
        console.log('xMatic: 🎨 Style Tab - Event listeners set up, loading current style...');
        this.loadCurrentStyle();
        console.log('xMatic: 🎨 Style Tab - Render complete!');
    }

    setupEventListeners(container) {
        console.log('xMatic: 🎨 Style Tab - Setting up event listeners...', { container });
        
        // Setup event listeners for the style tab
        const saveBtn = container.querySelector('#saveStyles');
        const resetBtn = container.querySelector('#resetStyles');
        const styleCards = container.querySelectorAll('.style-card');
        const customStyleInput = container.querySelector('#customStyleInput');
        
        console.log('xMatic: 🎨 Style Tab - Found elements:', {
            saveBtn: !!saveBtn,
            resetBtn: !!resetBtn,
            styleCards: styleCards.length,
            customStyleInput: !!customStyleInput
        });
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.handleSave());
            console.log('xMatic: 🎨 Style Tab - Save button event listener added');
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.handleReset());
            console.log('xMatic: 🎨 Style Tab - Reset button event listener added');
        }
        
        // Add event listeners to style cards
        styleCards.forEach(card => {
            card.addEventListener('click', () => this.handleStyleCardClick(card));
            console.log('xMatic: 🎨 Style Tab - Style card event listener added for:', card.dataset.style);
        });
        
        if (customStyleInput) {
            customStyleInput.addEventListener('input', () => this.handleCustomStyleChange());
            console.log('xMatic: 🎨 Style Tab - Custom style input event listener added');
        }
        
        console.log('xMatic: 🎨 Style Tab - All event listeners set up successfully');
    }

    async loadCurrentStyle() {
        // Load current style configuration from storage
        console.log('xMatic: 🎨 Style Tab - Loading current style...');
        
        try {
            if (window.StorageManager) {
                const storageManager = new window.StorageManager();
                
                // Load base style and custom instructions
                const [baseStyle, customInstructions] = await Promise.all([
                    storageManager.getResponseStyle(),
                    storageManager.getCustomStyleInstructions()
                ]);
                
                console.log('xMatic: 🎨 Style Tab - Loaded from storage:', { baseStyle, customInstructions });
                
                // Update UI with loaded values
                this.updateUIWithLoadedStyles(baseStyle, customInstructions);
                
                // Update preview
                this.updateStylePreview();
                
            } else {
                console.warn('xMatic: 🎨 Style Tab - StorageManager not available');
            }
        } catch (error) {
            console.error('xMatic: 🎨 Style Tab - Error loading styles:', error);
            this.showStyleStatus('Error loading styles', 'error');
        }
    }

    updateUIWithLoadedStyles(baseStyle, customInstructions) {
        const styleCards = document.querySelectorAll('.style-card');
        const customStyleInput = document.querySelector('#customStyleInput');
        
        // Update style cards selection
        if (baseStyle) {
            styleCards.forEach(card => {
                if (card.dataset.style === baseStyle) {
                    card.classList.add('selected');
                } else {
                    card.classList.remove('selected');
                }
            });
        }
        
        if (customStyleInput && customInstructions) {
            customStyleInput.value = customInstructions;
        }
    }

    handleStyleCardClick(clickedCard) {
        // Handle style card selection
        console.log('xMatic: 🎨 Style Tab - Style card clicked:', clickedCard.dataset.style);
        
        // Remove selection from all cards
        document.querySelectorAll('.style-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Add selection to clicked card
        clickedCard.classList.add('selected');
        
        // Update preview
        this.updateStylePreview();
        this.showStyleStatus('Style updated - preview refreshed', 'info');
    }

    handleCustomStyleChange() {
        // Handle custom style input changes
        console.log('xMatic: 🎨 Style Tab - Custom style changed...');
        this.updateStylePreview();
    }

    updateStylePreview() {
        // Update the style preview based on current selections
        const selectedCard = document.querySelector('.style-card.selected');
        const customStyleInput = document.querySelector('#customStyleInput');
        const previewContainer = document.querySelector('#stylePreview');
        
        if (!customStyleInput || !previewContainer) return;
        
        const baseStyle = selectedCard ? selectedCard.dataset.style : null;
        const customInstructions = customStyleInput.value;
        
        let previewText = '';
        
        if (baseStyle) {
            previewText += `Base Style: ${this.getStyleDescription(baseStyle)}\n\n`;
        }
        
        if (customInstructions) {
            previewText += `Custom Instructions:\n${customInstructions}\n\n`;
        }
        
        if (previewText) {
            previewText += `Combined Effect:\nYour AI responses will use the ${baseStyle || 'default'} style combined with your custom instructions to create personalized, engaging content.`;
        } else {
            previewText = 'No style selected. AI will use default conversational style.';
        }
        
        previewContainer.textContent = previewText;
    }

    getStyleDescription(style) {
        const descriptions = {
            'professional': 'Formal, business-like, and authoritative tone',
            'casual': 'Friendly, relaxed, and approachable communication',
            'humorous': 'Witty, playful, and entertaining responses',
            'analytical': 'Detailed, logical, and data-driven approach',
            'concise': 'Brief, direct, and to-the-point communication',
            'empathetic': 'Understanding, supportive, and caring tone',
            'creative': 'Imaginative, innovative, and artistic expression',
            'enthusiastic': 'Energetic, passionate, and motivational tone',
            'sarcastic': 'Witty, ironic, and cleverly humorous'
        };
        return descriptions[style] || 'Custom style';
    }

    async handleSave() {
        // Handle saving style configuration
        console.log('xMatic: 🎨 Style Tab - Saving styles...');
        
        const saveBtn = document.querySelector('#saveStyles');
        const saveBtnText = saveBtn?.querySelector('.btn-text');
        const saveBtnLoading = saveBtn?.querySelector('.btn-loading');
        
        // Show loading state
        if (saveBtn && saveBtnText && saveBtnLoading) {
            saveBtn.disabled = true;
            saveBtnText.style.display = 'none';
            saveBtnLoading.style.display = 'inline-flex';
        }
        
        try {
            const selectedCard = document.querySelector('.style-card.selected');
            const customStyleInput = document.querySelector('#customStyleInput');
            
            if (!customStyleInput) {
                throw new Error('Custom style input not found');
            }
            
            const baseStyle = selectedCard ? selectedCard.dataset.style : null;
            const customInstructions = customStyleInput.value;
            
            if (!baseStyle && !customInstructions) {
                this.showStyleStatus('Please select a base style or add custom instructions', 'warning');
                this.resetSaveButton(saveBtn, saveBtnText, saveBtnLoading);
                return;
            }
            
            if (window.StorageManager) {
                const storageManager = new window.StorageManager();
                
                // Save both base style and custom instructions
                const [styleSaved, instructionsSaved] = await Promise.all([
                    baseStyle ? storageManager.saveResponseStyle(baseStyle) : Promise.resolve(true),
                    customInstructions ? storageManager.saveCustomStyleInstructions(customInstructions) : Promise.resolve(true)
                ]);
                
                if (styleSaved && instructionsSaved) {
                    this.showStyleStatus('Style configuration saved successfully!', 'success');
                    console.log('xMatic: 🎨 Style Tab - Styles saved successfully');
                } else {
                    throw new Error('Failed to save some style settings');
                }
                
            } else {
                throw new Error('StorageManager not available');
            }
            
        } catch (error) {
            console.error('xMatic: 🎨 Style Tab - Error saving styles:', error);
            this.showStyleStatus(`Error saving styles: ${error.message}`, 'error');
        } finally {
            // Reset button state
            this.resetSaveButton(saveBtn, saveBtnText, saveBtnLoading);
        }
    }
    
    resetSaveButton(saveBtn, saveBtnText, saveBtnLoading) {
        if (saveBtn && saveBtnText && saveBtnLoading) {
            saveBtn.disabled = false;
            saveBtnText.style.display = 'inline';
            saveBtnLoading.style.display = 'none';
        }
    }

    async handleReset() {
        // Handle resetting style configuration
        console.log('xMatic: 🎨 Style Tab - Resetting styles...');
        
        const resetBtn = document.querySelector('#resetStyles');
        const resetBtnText = resetBtn?.querySelector('.btn-text');
        const resetBtnLoading = resetBtn?.querySelector('.btn-loading');
        
        // Show loading state
        if (resetBtn && resetBtnText && resetBtnLoading) {
            resetBtn.disabled = true;
            resetBtnText.style.display = 'none';
            resetBtnLoading.style.display = 'inline-flex';
        }
        
        try {
            const styleCards = document.querySelectorAll('.style-card');
            const customStyleInput = document.querySelector('#customStyleInput');
            
            // Remove selection from all style cards
            styleCards.forEach(card => {
                card.classList.remove('selected');
            });
            
            if (customStyleInput) {
                customStyleInput.value = '';
            }
            
            // Clear from storage
            if (window.StorageManager) {
                const storageManager = new window.StorageManager();
                await Promise.all([
                    storageManager.saveResponseStyle(''),
                    storageManager.saveCustomStyleInstructions('')
                ]);
            }
            
            // Update preview
            this.updateStylePreview();
            
            this.showStyleStatus('Styles reset to default successfully!', 'success');
            console.log('xMatic: 🎨 Style Tab - Styles reset complete');
            
        } catch (error) {
            console.error('xMatic: 🎨 Style Tab - Error resetting styles:', error);
            this.showStyleStatus('Error resetting styles', 'error');
        } finally {
            // Reset button state
            this.resetResetButton(resetBtn, resetBtnText, resetBtnLoading);
        }
    }
    
    resetResetButton(resetBtn, resetBtnText, resetBtnLoading) {
        if (resetBtn && resetBtnText && resetBtnLoading) {
            resetBtn.disabled = false;
            resetBtnText.style.display = 'inline';
            resetBtnLoading.style.display = 'none';
        }
    }

    showStyleStatus(message, type = 'info') {
        const styleStatus = document.querySelector('#styleStatus');
        if (styleStatus) {
            styleStatus.textContent = message;
            styleStatus.className = `style-status show ${type}`;
            setTimeout(() => {
                styleStatus.className = 'style-status';
            }, 3000); // Hide after 3 seconds
        }
    }
}

// Export for use in floating panel
if (typeof window !== 'undefined') {
    window.StyleTab = StyleTab;
}
