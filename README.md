# xMatic 🚀

> **AI-Powered Twitter/X Reply Generator** - Generate engaging, contextual replies instantly with OpenAI GPT or Grok AI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/jhgjeaklmjohgmnephiaeiefejdhfnml?color=4285F4&label=Chrome%20Web%20Store&logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/xmatic/jhgjeaklmjohgmnephiaeiefejdhfnml)
[![Version](https://img.shields.io/badge/version-1.3.2-blue.svg)](https://github.com/iamvasee/xMatic/releases)
[![GitHub stars](https://img.shields.io/github/stars/iamvasee/xMatic?style=social)](https://github.com/iamvasee/xMatic/stargazers)

xMatic is a Chrome extension that adds AI-powered reply generation to Twitter/X. Click the 🤖 button in any reply box to instantly generate contextual, engaging responses using **OpenAI's GPT models** or **Grok AI (xAI)**. Choose your preferred AI provider and customize your response style for the perfect reply every time.

## ✨ Features

- **🤖 Dual AI Provider Support** - Use OpenAI GPT or Grok AI (xAI) for replies
- **🎯 One-Click AI Replies** - Generate responses instantly with a simple button
- **🎨 Advanced Style Customization** - Combine preset styles with custom instructions
- **🧠 Smart Context Analysis** - Extracts tweet content, author info, and engagement metrics
- **🔒 Privacy-First** - Uses your own API keys, no data collection
- **⚡ Seamless Integration** - Works natively within Twitter's interface
- **✏️ Fully Editable** - Generated text can be edited, deleted, or customized
- **📊 Engagement Awareness** - AI considers tweet popularity and author influence
- **🔄 Extension Toggle Control** - Enable/disable the extension with a beautiful toggle switch
- **🪟 Floating Panel Interface** - Advanced multi-tab interface for AI configuration and generation
- **📝 Draft Management** - Save, edit, and manage multiple AI-generated drafts
- **🎭 Style Presets** - Professional, casual, humorous, analytical, and more response styles
- **⚙️ Advanced Settings** - Fine-tune AI behavior, response length, and generation parameters

## 🆕 What's New in v1.3.2

- **🔧 Popup Functionality Fixes** - Resolved popup loading issues and improved toggle functionality
- **🔄 Enhanced Toggle Control** - Better error handling and status management for extension toggle
- **🎯 Improved User Experience** - Toggle automatically disables on non-Twitter pages with helpful messaging
- **🛡️ Better Error Handling** - Graceful fallbacks for storage operations and content script communication
- **📱 Responsive Design** - Enhanced popup interface with proper styling and accessibility
- **📁 Project Structure Reorganization** - Clean, logical folder structure following Chrome extension best practices
- **🗑️ Unused Files Cleanup** - Removed dead code and unused files for better maintainability
- **🔧 Linting Issues Resolution** - Fixed all CSS and TypeScript configuration errors
- **🎯 Better Code Organization** - Separated scripts, styles, UI, and assets into dedicated folders

## 🆕 What's New in v1.3.1

- **⚡ Extension Toggle Control** - Beautiful on/off switch to enable/disable the extension
- **🔄 Dynamic Button Management** - AI buttons appear/disappear based on toggle state
- **♿ Accessibility Improvements** - Better form labeling and ARIA attributes
- **🎨 Code Quality** - Replaced inline styles with proper CSS classes
- **🔧 Linter Compliance** - Fixed all accessibility and code standard warnings

## 📸 Screenshots

<div align="center">
  <img src="assets/screenshots/App_Store_(iOS) 5.png" alt="Main Interface" width="30%">
  <img src="assets/screenshots/App_Store_(iOS) 6.png" alt="Dark Mode" width="30%">
  <img src="assets/screenshots/App_Store_(iOS) 10.png" alt="Customization" width="30%">
</div>

*Light and dark mode support with seamless Twitter/X integration*

## 🚀 Quick Start

### Installation

**Option 1: Chrome Web Store** 
1. Visit Chrome Web Store → Search "xMatic" → Add to Chrome

**Option 2: Manual Installation**
1. Download: `git clone https://github.com/iamvasee/xMatic.git`
2. Open Chrome → `chrome://extensions/` → Enable "Developer mode"
3. Click "Load unpacked" → Select the `extension` folder

### Setup

1. **Choose AI Provider**: Select between OpenAI GPT or Grok AI (xAI)
2. **Get API Key**: 
   - **OpenAI**: Visit [OpenAI Platform](https://platform.openai.com/api-keys) → Create new key
   - **Grok**: Visit [xAI Console](https://console.x.ai) → Generate API key
3. **Configure Extension**: Click xMatic icon → Paste API key → Select model → Save
4. **Start Using**: Go to Twitter → Reply to any tweet → Click 🤖 button

## 🎯 How It Works

1. **Reply to any tweet** on Twitter/X
2. **Click the 🤖 AI button** in the compose toolbar
3. **AI analyzes context** including tweet content, author, and engagement
4. **Generates contextual response** based on your selected style
5. **Edit if needed** and post your reply

## 🎨 Response Styles

### **Preset Styles:**
- **🎯 Professional** - Business-focused, formal tone
- **😊 Casual & Friendly** - Warm, approachable responses  
- **😏 Humorous** - Witty, clever humor
- **🧠 Analytical** - Detailed, thorough analysis
- **⚡ Concise** - Direct, to-the-point
- **🤗 Empathetic** - Encouraging, supportive tone
- **🎨 Creative** - Imaginative, memorable responses

### **Custom Instructions:**
Add your own personality traits, requirements, or specific instructions that get combined with the selected base style for truly personalized AI responses.

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **AI Providers**: OpenAI GPT API, Grok AI (xAI) API
- **Platform**: Chrome Extension (Manifest V3)
- **Storage**: Chrome Storage API (sync + local fallback)
- **Architecture**: Modular design with core, modules, and floating-panel components
- **UI Framework**: Custom floating panel system with tabbed interface
- **Code Organization**: 5,770+ lines across 20+ JavaScript and CSS files

## 📁 Project Structure

```
xMatic/
├── extension/
│   ├── manifest.json              # Extension configuration (74 lines)
│   ├── src/
│   │   ├── scripts/
│   │   │   ├── core/
│   │   │   │   ├── content.js         # Main orchestrator (277 lines)
│   │   │   │   └── background.js      # Service worker (3 lines)
│   │   │   ├── modules/
│   │   │   │   ├── ai-api.js          # AI API handler (290 lines)
│   │   │   │   ├── storage-manager.js # Storage and configuration management (146 lines)
│   │   │   │   ├── context-extractor.js # Tweet context and engagement extraction (190 lines)
│   │   │   │   └── text-insertion-manager.js # Text insertion + Theme management (236 lines)
│   │   │   └── floating-panel/
│   │   │       ├── floating-panel.js   # Main floating panel controller (382 lines)
│   │   │       ├── ai-tab.js          # AI configuration and settings (520 lines)
│   │   │       ├── generate-tab.js    # Reply generation interface (498 lines)
│   │   │       ├── drafts-tab.js      # Draft management system (207 lines)
│   │   │       └── style-tab.js       # Style customization panel (165 lines)
│   │   ├── styles/
│   │   │   ├── styles.css             # Core extension styling (108 lines)
│   │   │   ├── floating-panel.css     # Floating panel styles (486 lines)
│   │   │   └── tabs.css               # Tab interface styling (1,803 lines)
│   │   ├── ui/
│   │   │   ├── popup.html             # Extension popup interface (468 lines)
│   │   │   ├── popup.js               # Popup functionality (170 lines)
│   │   │   └── ui-manager.js          # UI component manager (289 lines)
│   │   └── assets/
│   │       ├── xMatic.png            # Main logo
│   │       ├── xmaticicon.png        # Extension icon
│   │       ├── robot.svg             # AI button icon
│   │       ├── time.svg              # Loading indicator
│   │       └── float.svg             # Floating button icon
│   ├── assets/                       # Screenshots and documentation assets
│   ├── docs/                         # Documentation files
│   └── README.md                     # This file
├── CHANGELOG.md                      # Version history and changes
├── package.json                      # Project dependencies and metadata
└── LICENSE                           # MIT License
```

**Total Lines of Code:** 5,770+ lines across all JavaScript and CSS files

## 🔒 Privacy & Security

- **🔐 Zero Data Collection** - No personal data stored or transmitted
- **🏠 Local Storage Only** - All data stays on your device
- **🔑 BYOK** - Uses your personal API keys for both providers
- **📖 Open Source** - Full code transparency
- **🛡️ No Accidental Tagging** - Smart @ symbol prevention

## 🤝 Contributing

1. **🐛 Bug Reports**: [Create an issue](https://github.com/iamvasee/xMatic/issues)
2. **💡 Feature Requests**: Share your ideas
3. **🔧 Code Contributions**: Submit pull requests
4. **🌟 Spread the Word**: Star the repo and share

## 📋 Requirements

- **Browser**: Chrome 88+ or Chromium-based browsers
- **API**: OpenAI API key OR Grok AI (xAI) API key
- **Account**: Active Twitter/X account

## 🆘 Troubleshooting

- **No AI button**: Refresh Twitter page, check extension is enabled
- **API errors**: Verify API key and account credits for selected provider
- **Text not inserting**: Check browser console for errors
- **Provider switching**: Ensure correct API key is configured for selected provider

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ by [Vasee](https://iamvasee.com)**

[⭐ Star this repo](https://github.com/iamvasee/xMatic/stargazers) • [🐛 Report Bug](https://github.com/iamvasee/xMatic/issues) • [💡 Request Feature](https://github.com/iamvasee/xMatic/issues)

</div>