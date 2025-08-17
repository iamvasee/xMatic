// Header Component JavaScript
class Header {
    constructor() {
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.pageTitle = document.querySelector('.page-title');
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => {
                this.refreshCurrentSection();
            });
        }
    }

    toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('open');
        }
    }

    refreshCurrentSection() {
        const activeSection = document.querySelector('.content-section.active');
        if (activeSection) {
            // Trigger a custom event for section refresh
            const event = new CustomEvent('sectionRefresh', {
                detail: { sectionId: activeSection.id }
            });
            document.dispatchEvent(event);
        }
    }

    updatePageTitle(title) {
        if (this.pageTitle) {
            this.pageTitle.textContent = title;
        }
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Header;
} else {
    window.Header = Header;
}
