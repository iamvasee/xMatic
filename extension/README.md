# xMatic Web App - Component Architecture

## 🏗️ **Component Structure**

The xMatic web app has been refactored into a modular, component-based architecture for better maintainability and scalability.

### 📁 **Directory Structure**

```
extension/
├── components/              # Component directory
│   ├── Header/             # Top header component
│   │   ├── Header.html     # Header HTML structure
│   │   ├── Header.css      # Header-specific styles
│   │   └── Header.js       # Header functionality
│   ├── Sidebar/            # Sidebar navigation component
│   │   ├── Sidebar.html    # Sidebar HTML structure
│   │   ├── Sidebar.css     # Sidebar-specific styles
│   │   └── Sidebar.js      # Sidebar functionality
│   ├── SettingsSection/    # Settings configuration component
│   │   ├── SettingsSection.html
│   │   ├── SettingsSection.css
│   │   └── SettingsSection.js
│   ├── KeysSection/        # API keys management component
│   │   ├── KeysSection.html
│   │   ├── KeysSection.css
│   │   └── KeysSection.js
│   └── shared/             # Shared components (future use)
│       ├── Button/
│       ├── Card/
│       ├── FormInput/
│       └── StatusMessage/
├── styles/                  # Organized CSS
│   ├── base.css            # Global styles, variables, reset
│   ├── layout.css          # Grid, flexbox, positioning
│   └── components.css      # Shared component styles
├── scripts/                 # Organized JavaScript
│   └── app.js              # Main application logic
├── webapp.html             # Main HTML file (simplified)
└── webapp.js               # Legacy file (can be removed)
```

## 🔧 **How Components Work**

### **Component Loading System**
The main app (`scripts/app.js`) automatically loads all components on initialization:

1. **HTML Loading**: Fetches component HTML files
2. **CSS Injection**: Injects component styles into the document head
3. **JavaScript Execution**: Executes component JavaScript code
4. **Component Initialization**: Creates component instances and binds events

### **Component Communication**
Components communicate through:
- **Custom Events**: For cross-component communication
- **Shared State**: Managed by the main app class
- **DOM Events**: Standard browser events for user interactions

## 📱 **Available Components**

### **Header Component**
- **Purpose**: Top navigation bar with mobile menu and refresh button
- **Features**: 
  - Mobile menu toggle
  - Page title display
  - Refresh button for current section
- **Usage**: Automatically loaded and initialized

### **Sidebar Component**
- **Purpose**: Left navigation sidebar with logo and menu
- **Features**:
  - Navigation between sections
  - Logo display
  - User info footer
  - Mobile responsiveness
- **Usage**: Automatically loaded and initialized

### **Settings Section Component**
- **Purpose**: AI response style and model configuration
- **Features**:
  - Response style selection (Professional, Casual, Sarcastic, etc.)
  - Custom style input
  - AI model selection (GPT-4, GPT-4 Turbo, GPT-3.5 Turbo)
  - Style preview
  - Configuration saving
- **Usage**: Automatically loaded and initialized

### **Keys Section Component**
- **Purpose**: API key management and connection testing
- **Features**:
  - OpenAI API key input
  - Connection testing
  - Configuration saving
  - Status messages
- **Usage**: Automatically loaded and initialized

## 🎨 **Styling System**

### **CSS Organization**
- **Base CSS**: Global variables, reset, typography
- **Layout CSS**: Grid, flexbox, positioning, responsive design
- **Components CSS**: Shared component styles (buttons, cards, forms)

### **CSS Variables**
The app uses CSS custom properties for consistent theming:
```css
:root {
    --primary: #3b82f6;
    --background: #ffffff;
    --foreground: #0f172a;
    --spacing-lg: 1rem;
    --radius: 0.5rem;
    /* ... more variables */
}
```

### **Dark Mode Support**
Automatic dark mode detection with `prefers-color-scheme: dark`

## 🚀 **Adding New Components**

### **1. Create Component Directory**
```bash
mkdir components/NewComponent
```

### **2. Create Component Files**
```bash
touch components/NewComponent/NewComponent.html
touch components/NewComponent/NewComponent.css
touch components/NewComponent/NewComponent.js
```

### **3. Update Main App**
In `scripts/app.js`, add:
```javascript
// Load NewComponent
await this.loadComponent('NewComponent');

// Initialize NewComponent
case 'NewComponent':
    this.initializeNewComponent();
    break;
```

### **4. Component Template**
```javascript
// NewComponent.js
class NewComponent {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Event binding logic
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NewComponent;
} else {
    window.NewComponent = NewComponent;
}
```

## 🔄 **Component Lifecycle**

1. **Loading**: HTML, CSS, and JS are fetched and injected
2. **Initialization**: Component class is instantiated
3. **Event Binding**: Event listeners are attached
4. **State Management**: Component state is initialized
5. **Cleanup**: Event listeners are removed on component destruction

## 📱 **Responsive Design**

All components are built with mobile-first responsive design:
- **Desktop**: Full sidebar layout
- **Tablet**: Collapsible sidebar
- **Mobile**: Overlay sidebar with hamburger menu

## 🧪 **Testing Components**

Components can be tested individually by:
1. Loading the component HTML directly
2. Including the component CSS and JS
3. Testing component functionality in isolation

## 🔧 **Troubleshooting**

### **Common Issues**
- **Component not loading**: Check file paths and network requests
- **Styles not applying**: Verify CSS injection in browser dev tools
- **JavaScript errors**: Check component JS syntax and dependencies

### **Debug Mode**
Enable debug logging in the main app:
```javascript
// In app.js
this.debug = true;
```

## 📚 **Future Enhancements**

- **Component Registry**: Centralized component management
- **Lazy Loading**: Load components on demand
- **State Management**: Centralized state store
- **Component Testing**: Unit and integration tests
- **TypeScript**: Type safety for component interfaces

---

For questions or contributions, please refer to the main project README.
