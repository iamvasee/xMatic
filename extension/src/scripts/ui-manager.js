// xMatic - UI Component Manager
class UIManager {
    constructor(config, robotSvg, timeSvg) {
        this.config = config;
        this.robotSvg = robotSvg;
        this.timeSvg = timeSvg;
    }

    // Update configuration when needed
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    // Update SVG icons when needed
    updateSvgIcons(robotSvg, timeSvg) {
        this.robotSvg = robotSvg;
        this.timeSvg = timeSvg;
    }

    async addAIButtons() {
        // Check if extension is enabled
        const config = await chrome.storage.sync.get(['extensionEnabled']);
        if (config.extensionEnabled === false) {
            return;
        }
        
        // Don't add buttons if SVGs aren't loaded yet
        if (!this.robotSvg || !this.timeSvg) {
            return;
        }

        // Clean up any orphaned buttons first
        this.cleanupOrphanedButtons();

        // Find compose toolbars that don't have our button yet
        const toolbars = document.querySelectorAll('[data-testid="toolBar"]:not(.xmatic-enhanced)');

        toolbars.forEach((toolbar, index) => {
            toolbar.classList.add('xmatic-enhanced');

            // Create AI icon (div instead of button to avoid shadows)
            const aiButton = document.createElement('div');
            aiButton.className = 'xmatic-ai-btn';
            aiButton.title = 'Generate AI Reply';
            aiButton.setAttribute('role', 'button');
            aiButton.setAttribute('tabindex', '0');
            aiButton.setAttribute('data-xmatic-active', 'true'); // Mark as active button
            aiButton.setAttribute('data-xmatic-id', `btn-${Date.now()}-${index}`); // Unique ID

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
                margin: 7px 8px 0 0;
                transition: all 0.2s ease;
                padding: 8px;
                color: rgb(83, 100, 113);
                box-shadow: none;
                outline: none;
                vertical-align: middle;
                flex-shrink: 0;
            `;

            // Add controlled hover effects only to this specific button
            aiButton.addEventListener('mouseenter', (e) => {
                // Only apply hover if this is the actual target
                if (e.target === aiButton && aiButton.getAttribute('data-xmatic-active') === 'true') {
                    aiButton.style.setProperty('background-color', '#EFF5FD', 'important');
                    aiButton.style.setProperty('color', 'rgb(29, 161, 242)', 'important');
                }
            });

            aiButton.addEventListener('mouseleave', (e) => {
                // Only remove hover if this is the actual target
                if (e.target === aiButton && aiButton.getAttribute('data-xmatic-active') === 'true') {
                    aiButton.style.setProperty('background-color', 'transparent', 'important');
                    aiButton.style.setProperty('color', 'rgb(83, 100, 113)', 'important');
                }
            });

            // Store the click handler reference for later removal
            const clickHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Dispatch custom event for main content script to handle
                aiButton.dispatchEvent(new CustomEvent('xmatic-ai-click', { bubbles: true }));
            };

            aiButton.addEventListener('click', clickHandler);

            // Also handle keyboard activation
            const keydownHandler = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    aiButton.dispatchEvent(new CustomEvent('xmatic-ai-click', { bubbles: true }));
                }
            };

            aiButton.addEventListener('keydown', keydownHandler);

            // Store handlers for cleanup
            aiButton._xmaticHandlers = { click: clickHandler, keydown: keydownHandler };

            toolbar.insertBefore(aiButton, toolbar.firstChild);
        });
    }

    addFloatingButton() {
        // Check if extension is enabled
        if (this.config.extensionEnabled === false) {
            return;
        }
        
        // Remove existing floating button if any
        const existingFloatBtn = document.querySelector('.xmatic-float-btn');
        if (existingFloatBtn) {
            existingFloatBtn.remove();
        }
        
        // Create floating button using the SVG directly
        const floatSvgUrl = chrome.runtime.getURL('src/assets/float.svg');
        
        fetch(floatSvgUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(svgContent => {
                // Create the SVG element directly
                const floatBtn = document.createElement('div');
                floatBtn.className = 'xmatic-float-btn';
                floatBtn.title = 'Create AI Tweet with xMatic';
                floatBtn.setAttribute('data-xmatic-active', 'true');
                floatBtn.setAttribute('data-xmatic-id', `float-${Date.now()}`);
                
                // Set the SVG as the button content
                floatBtn.innerHTML = svgContent;
                
                // Add click event
                const clickHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Dispatch custom event for main content script to handle
                    floatBtn.dispatchEvent(new CustomEvent('xmatic-float-click', { bubbles: true }));
                };

                floatBtn.addEventListener('click', clickHandler);
                floatBtn._xmaticHandlers = { click: clickHandler };
                
                // Add to body
                document.body.appendChild(floatBtn);
            })
            .catch(error => {
                console.error('xMatic: Failed to load float.svg:', error);
                
                // Create fallback button with plus icon
                const floatBtn = document.createElement('div');
                floatBtn.className = 'xmatic-float-btn';
                floatBtn.title = 'Create AI Tweet with xMatic';
                floatBtn.setAttribute('data-xmatic-active', 'true');
                floatBtn.setAttribute('data-xmatic-id', `float-${Date.now()}`);
                
                // Fallback to a simple plus icon
                floatBtn.innerHTML = `
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                `;
                
                // Add click event
                const clickHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Dispatch custom event for main content script to handle
                    floatBtn.dispatchEvent(new CustomEvent('xmatic-float-click', { bubbles: true }));
                };

                floatBtn.addEventListener('click', clickHandler);
                floatBtn._xmaticHandlers = { click: clickHandler };
                
                // Add to body
                document.body.appendChild(floatBtn);
            });
    }

    removeAllAIButtons() {
        const aiButtons = document.querySelectorAll('.xmatic-ai-btn');
        aiButtons.forEach(button => {
            // Remove event handlers
            if (button._xmaticHandlers) {
                if (button._xmaticHandlers.click) {
                    button.removeEventListener('click', button._xmaticHandlers.click);
                }
                if (button._xmaticHandlers.keydown) {
                    button.removeEventListener('keydown', button._xmaticHandlers.keydown);
                }
            }
            button.remove();
        });
        
        // Remove enhanced class from toolbars
        const toolbars = document.querySelectorAll('.xmatic-enhanced');
        toolbars.forEach(toolbar => {
            toolbar.classList.remove('xmatic-enhanced');
        });
    }

    removeFloatingButton() {
        const floatBtn = document.querySelector('.xmatic-float-btn');
        if (floatBtn) {
            // Remove event handlers
            if (floatBtn._xmaticHandlers && floatBtn._xmaticHandlers.click) {
                floatBtn.removeEventListener('click', floatBtn._xmaticHandlers.click);
            }
            floatBtn.remove();
        }
    }

    cleanupOrphanedButtons() {
        // Remove ALL existing AI buttons to prevent duplicates and ghost effects
        const allAIButtons = document.querySelectorAll('.xmatic-ai-btn, [class*="xmatic"], [data-xmatic-active], [data-xmatic-id]');
        
        allAIButtons.forEach((element, index) => {
            // Remove event handlers if they exist
            if (element._xmaticHandlers) {
                Object.values(element._xmaticHandlers).forEach(handler => {
                    if (handler) {
                        element.removeEventListener('click', handler);
                        element.removeEventListener('keydown', handler);
                    }
                });
            }
            element.remove();
        });

        // Remove the enhanced class from all toolbars to reset state
        const enhancedToolbars = document.querySelectorAll('[data-testid="toolBar"].xmatic-enhanced');
        enhancedToolbars.forEach(toolbar => {
            toolbar.classList.remove('xmatic-enhanced');
        });

        // Nuclear option: remove our hover color from ALL elements
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            if (computedStyle.backgroundColor === 'rgb(239, 245, 253)') {
                element.style.setProperty('background-color', 'transparent', 'important');
            }
        });
    }

    // Method to show loading state on AI button
    showAILoading() {
        const aiBtn = document.querySelector('.xmatic-ai-btn');
        if (aiBtn) {
            aiBtn.innerHTML = this.timeSvg;
            aiBtn.style.backgroundColor = 'rgba(255, 140, 0, 0.1)';
            aiBtn.style.color = 'rgb(255, 140, 0)';
        }
    }

    // Method to reset AI button to normal state
    resetAIButton() {
        const aiBtn = document.querySelector('.xmatic-ai-btn');
        if (aiBtn) {
            aiBtn.innerHTML = this.robotSvg;
            aiBtn.style.backgroundColor = 'transparent';
            aiBtn.style.color = 'rgb(83, 100, 113)';
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
