// xMatic Landing Page - Enhanced Modal Functionality for Screenshots

document.addEventListener('DOMContentLoaded', function() {
    // Initialize modal functionality
    initializeModal();
});

function initializeModal() {
    // Get modal elements
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const captionText = document.getElementById("modalCaption");
    const closeBtn = document.querySelector(".close");
    
    if (!modal || !modalImg || !captionText) {
        console.error('Modal elements not found');
        return;
    }

    // Function to open modal with smooth animation
    function openModal(img) {
        if (!img || !img.src) return;
        
        // Set image and caption
        modalImg.src = img.src;
        modalImg.alt = img.alt || 'Screenshot';
        captionText.innerHTML = img.alt || 'Screenshot';
        
        // Show modal with fade-in effect
        modal.style.display = "flex";
        modal.style.flexDirection = "column";
        modal.style.alignItems = "center";
        modal.style.justifyContent = "center";
        modal.style.opacity = "0";
        
        // Trigger reflow and animate in
        modal.offsetHeight; // Force reflow
        modal.style.opacity = "1";
        modal.style.transition = "opacity 0.3s ease";
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        console.log('Modal opened for:', img.src);
    }

    // Function to close modal with smooth animation
    function closeModal() {
        modal.style.opacity = "0";
        
        setTimeout(() => {
            modal.style.display = "none";
            document.body.style.overflow = 'auto';
        }, 300);
    }

    // Add click handlers to all screenshots
    function setupScreenshotHandlers() {
        const screenshots = document.querySelectorAll('.screenshot');
        screenshots.forEach(screenshot => {
            screenshot.addEventListener('click', function(e) {
                e.preventDefault();
                openModal(this);
            });
            
            // Add hover effect
            screenshot.style.cursor = 'pointer';
            screenshot.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
            
            screenshot.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05)';
                this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            });
            
            screenshot.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = 'none';
            });
        });
        
        console.log('Screenshot handlers set up for', screenshots.length, 'images');
    }

    // Close modal when clicking close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside the image
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });

    // Initialize screenshot handlers
    setupScreenshotHandlers();
    
    // Re-setup handlers if content changes (for dynamic loading)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                setupScreenshotHandlers();
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

