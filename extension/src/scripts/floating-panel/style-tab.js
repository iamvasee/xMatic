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
                    <p>Configure your AI response personality</p>
                </div>
                <div class="tab-actions">
                    <button class="action-button secondary" id="resetStyles">Reset</button>
                    <button class="action-button primary" id="saveStyles">Save</button>
                </div>
            </div>
            
            <div class="style-content">
                <!-- Base Style Selection -->
                <div class="simple-form-group">
                    <label>Base Style</label>
                    <select id="styleSelect" class="simple-select">
                        <option value="">Select a base style</option>
                        <option value="professional">Professional & Formal</option>
                        <option value="casual">Casual & Friendly</option>
                        <option value="humorous">Humorous & Witty</option>
                        <option value="analytical">Analytical & Detailed</option>
                        <option value="concise">Concise & Direct</option>
                        <option value="empathetic">Empathetic & Supportive</option>
                        <option value="creative">Creative & Imaginative</option>
                    </select>
                </div>

                <!-- Custom Instructions -->
                <div class="simple-form-group">
                    <label>Custom Instructions</label>
                    <textarea 
                        id="customStyleInput" 
                        class="simple-textarea" 
                        placeholder="Add your own custom instructions, personality traits, or specific requirements here..."
                        rows="3"
                    ></textarea>
                    <small class="help-text">Your custom instructions will be combined with the selected base style.</small>
                </div>
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
        const styleSelect = container.querySelector('#styleSelect');
        const customStyleInput = container.querySelector('#customStyleInput');
        
        console.log('xMatic: 🎨 Style Tab - Found elements:', {
            saveBtn: !!saveBtn,
            resetBtn: !!resetBtn,
            styleSelect: !!styleSelect,
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
        
        if (styleSelect) {
            styleSelect.addEventListener('change', () => this.handleStyleSelectChange());
            console.log('xMatic: 🎨 Style Tab - Style select event listener added');
        }
        
        if (customStyleInput) {
            customStyleInput.addEventListener('input', () => this.handleCustomStyleChange());
            console.log('xMatic: 🎨 Style Tab - Custom style input event listener added');
        }
        
        console.log('xMatic: 🎨 Style Tab - All event listeners set up successfully');
    }

    loadCurrentStyle() {
        // Load current style configuration
        console.log('xMatic: 🎨 Style Tab - Loading current style...');
        // TODO: Load from storage manager
    }



    handleStyleSelectChange() {
        // Handle style select dropdown changes
        console.log('xMatic: 🎨 Style Tab - Style select changed...');
        this.updateStylePreview();
    }

    handleCustomStyleChange() {
        // Handle custom style input changes
        console.log('xMatic: 🎨 Style Tab - Custom style changed...');
        this.updateStylePreview();
    }



    handleSave() {
        // Handle saving style configuration
        console.log('xMatic: Saving styles...');
        // TODO: Save to storage manager
    }

    handleReset() {
        // Handle resetting style configuration
        console.log('xMatic: 🎨 Style Tab - Resetting styles...');
        
        const styleSelect = document.querySelector('#styleSelect');
        if (styleSelect) {
            styleSelect.value = '';
        }
        
        const customStyleInput = document.querySelector('#customStyleInput');
        if (customStyleInput) {
            customStyleInput.value = '';
        }
        
        console.log('xMatic: 🎨 Style Tab - Styles reset complete');
    }
}

// Export for use in floating panel
if (typeof window !== 'undefined') {
    window.StyleTab = StyleTab;
}
