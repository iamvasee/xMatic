// Sidebar Component JavaScript
class Sidebar {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.contentSections = document.querySelectorAll('.content-section');
        this.init();
    }

    init() {
        this.bindEvents();
        this.setActiveSection('configuration'); // Default to Settings
    }

    bindEvents() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute('data-section');
                this.navigateToSection(sectionId);
            });
        });

        // Listen for section refresh events
        document.addEventListener('sectionRefresh', (e) => {
            this.handleSectionRefresh(e.detail.sectionId);
        });
    }

    navigateToSection(sectionId) {
        // Hide all sections
        this.contentSections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Remove active class from all nav links
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Show selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Update active nav link
        const activeNavLink = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeNavLink) {
            activeNavLink.classList.add('active');
        }
        
        // Update page title
        this.updatePageTitle(sectionId);
        
        // Close mobile menu on mobile
        if (window.innerWidth <= 1024) {
            this.closeMobileMenu();
        }
    }

    setActiveSection(sectionId) {
        this.navigateToSection(sectionId);
    }

    updatePageTitle(sectionId) {
        const sectionTitles = {
            'configuration': 'Settings',
            'keys': 'API Keys'
        };
        
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle && sectionTitles[sectionId]) {
            pageTitle.textContent = sectionTitles[sectionId];
        }
    }

    handleSectionRefresh(sectionId) {
        // Handle section-specific refresh logic
        console.log(`Refreshing section: ${sectionId}`);
        
        // You can add specific refresh logic for each section here
        switch (sectionId) {
            case 'configuration':
                // Refresh settings section
                break;
            case 'keys':
                // Refresh keys section
                break;
        }
    }

    closeMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.remove('open');
        }
    }

    openMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.add('open');
        }
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sidebar;
} else {
    window.Sidebar = Sidebar;
}
