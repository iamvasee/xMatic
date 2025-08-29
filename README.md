# xMatic - Own Key 🚀

> **AI-Powered Twitter/X Content Creation Tool - Use Your Own API Keys for Complete Privacy** - Generate multiple original tweets and engaging replies instantly with OpenAI GPT or Grok AI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/jhgjeaklmjohgmnephiaeiefejdhfnml?color=4285F4&label=Chrome%20Web%20Store&logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/xmatic/jhgjeaklmjohgmnephiaeiefejdhfnml)
[![Product Hunt](https://img.shields.io/badge/Product%20Hunt-FF6154?style=for-the-badge&logo=product-hunt&logoColor=white)](https://www.producthunt.com/products/xmatic)
[![Version](https://img.shields.io/badge/version-2.2.2-blue.svg)](https://github.com/iamvasee/xMatic/releases)
[![GitHub stars](https://img.shields.io/badge/GitHub-stars-yellow.svg?style=social&logo=github)](https://github.com/iamvasee/xMatic/stargazers)

**xMatic - Own Key** is a Chrome extension that adds **AI-powered content creation to Twitter/X** with a key difference: **you use your own API keys for complete privacy and control**. **Version 2.2.2 introduces full temperature and maxTokens control** for fine-tuning AI responses, along with a revolutionary floating panel interface that integrates seamlessly within Twitter's interface. Generate multiple original tweets from context, create engaging replies, manage drafts, and customize AI styles all from a beautiful multi-tab floating panel.

## ✨ Features

- **🪟 Revolutionary Floating Panel Interface** - **NEW in v2.0.0** - Multi-tab interface integrated directly within Twitter
- **🚀 Smart Publish Button System** - **NEW in v2.2.0** - One-click publishing with Twitter intents and interface injection
- **🎯 Temperature & Max Tokens Control** - **NEW in v2.2.2** - Full control over AI response creativity and length
- **🐦 Multiple AI Tweet Generation** - Generate multiple original tweets from context in a single API call
- **💬 AI Reply Generation** - Generate contextual, engaging replies to existing tweets
- **📝 Draft Management System** - Save, edit, and manage multiple AI-generated tweets and replies
- **🤖 Dual AI Provider Support** - Use OpenAI GPT or Grok AI (xAI) for content creation
- **🎨 Advanced Style Customization** - Combine preset styles with custom instructions
- **🧠 Smart Context Analysis** - Extracts tweet content, author info, and engagement metrics
- **🔑 Own Key Approach** - Use your own OpenAI/Grok API keys for complete privacy
- **🔄 Extension Toggle Control** - Enable/disable the extension with a beautiful toggle switch

## 🆕 What's New in v2.2.2

- **🎯 Temperature & Max Tokens Control** - Full control over AI response creativity and length from the AI tab
- **🔧 Enhanced AI Configuration** - User settings now properly applied to all AI API calls
- **📊 Improved Logging** - Clear visibility into which temperature and maxTokens values are being used
- **🛡️ Fallback Protection** - Sensible defaults when settings are missing

## 🆕 What's New in v2.2.0

- **🚀 Smart Publish Button System** - One-click publishing with Twitter intents and interface injection
- **🤖 Interface Injection** - Automatically adds robot button and fixes vanishing Post buttons
- **⏱️ Extended Timeout** - 30-second auto-close for better user experience
- **🔧 Multiple Fallback Methods** - 5 different approaches to ensure reliable Twitter access

## 🆕 What's New in v2.0.0

- **🪟 Complete Floating Panel Interface** - Revolutionary new interface replacing the old popup system
- **📱 Multi-Tab Design** - AI Configuration, Generation, Drafts, and Style tabs for comprehensive control
- **🐦 Multiple AI Tweet Generation** - Generate multiple original tweets from context in a single API call
- **💬 AI Reply Generation** - Generate contextual, engaging replies to existing tweets
- **🎯 Advanced AI Configuration** - Full provider management, model selection, and API testing
- **📝 Draft Management System** - Save, edit, and manage multiple AI-generated tweets and replies
- **🎨 Style Customization Panel** - Advanced style presets with custom instruction combinations
- **🔄 Seamless Integration** - Floating panel that works directly within Twitter's interface
- **📊 Enhanced Context Analysis** - Improved tweet analysis and engagement metrics extraction
- **🛡️ Better Error Handling** - Graceful fallbacks for storage operations and content script communication
- **📁 Project Structure Reorganization** - Clean, logical folder structure following Chrome extension best practices

## 📸 Screenshots

<div align="center">
  <img src="assets/screenshots/App_Store_(iOS) 5.png" alt="Main Interface" width="25%">
  <img src="assets/screenshots/App_Store_(iOS) 6.png" alt="Dark Mode" width="25%">
  <img src="assets/screenshots/App_Store_(iOS) 10.png" alt="Customization" width="25%">
  <img src="assets/screenshots/App_Store_(iOS) 11.png" alt="AI Configuration" width="25%">
</div>

<div align="center">
  <img src="assets/screenshots/App_Store_(iOS) 12.png" alt="Tweet Generation" width="25%">
  <img src="assets/screenshots/App_Store_(iOS) 13.png" alt="Draft Management" width="25%">
  <img src="assets/screenshots/App_Store_(iOS) 14.png" alt="Style Customization" width="25%">
  <img src="assets/screenshots/App_Store_(iOS) 15.png" alt="Floating Panel Interface" width="25%">
</div>

*Comprehensive showcase of xMatic's floating panel interface, AI configuration, tweet generation, draft management, and style customization features*

## 🚀 Quick Start

### Installation

**Option 1: Chrome Web Store** 
1. Visit Chrome Web Store → Search "xMatic - Own Key" → Add to Chrome

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
4. **Start Using**: Go to Twitter → Compose tweet or reply → Click 🤖 button

## 🎯 How It Works

1. **Create content on Twitter/X** - Compose a new tweet or reply to an existing tweet
2. **Click the 🤖 AI button** in the compose toolbar
3. **Floating panel opens** with multiple tabs for different functions:
   - **AI Tab**: Configure providers, models, and test API connections
   - **Generate Tab**: Create multiple AI-powered tweets from context or generate replies with style selection
   - **Drafts Tab**: Manage and edit saved AI-generated content
   - **Style Tab**: Customize content styles and personality
4. **For original tweets**: Input context/ideas and AI generates multiple tweet variations
5. **For replies**: AI analyzes context including tweet content, author, and engagement
6. **Generates contextual content** based on your selected style and content type
7. **Edit if needed** and save to drafts for later use
8. **Publish with one click** - Use the Publish button to open Twitter with your tweet pre-filled

## 🎨 Content Styles

### **Preset Styles:**
- **🎯 Professional** - Business-focused, formal tone
- **😊 Casual & Friendly** - Warm, approachable content  
- **😏 Humorous** - Witty, clever humor
- **🧠 Analytical** - Detailed, thorough analysis
- **⚡ Concise** - Direct, to-the-point
- **🤗 Empathetic** - Encouraging, supportive tone
- **🎨 Creative** - Imaginative, memorable content

### **Custom Instructions:**
Add your own personality traits, requirements, or specific instructions that get combined with the selected base style for truly personalized AI content creation.

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **AI Providers**: OpenAI GPT API, Grok AI (xAI) API
- **Platform**: Chrome Extension (Manifest V3)
- **Storage**: Chrome Storage API (sync + local fallback)
- **Architecture**: Modular design with core, modules, and floating-panel components
- **UI Framework**: Custom floating panel system with tabbed interface
- **Content Types**: Multiple AI-powered tweet generation from context and contextual reply creation
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
│   │   │       ├── generate-tab.js    # Multiple tweet generation and reply interface (498 lines)
│   │   │       ├── drafts-tab.js      # Draft management and publishing system (698 lines)
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

**Total Lines of Code:** 6,200+ lines across all JavaScript and CSS files

## 🔒 Privacy & Security

- **🔐 Zero Data Collection** - No personal data stored or transmitted
- **🏠 Local Storage Only** - All data stays on your device
- **🔑 Own Key Approach** - Use your own OpenAI/Grok API keys for complete privacy
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

**Made with ❤️ by [Vasee](https://iamvasee.com) • [Follow on X](https://x.com/iamvasee) • [Landing Page](https://xmatic.app/)**

[⭐ Star this repo](https://github.com/iamvasee/xMatic/stargazers) • [🐛 Report Bug](https://github.com/iamvasee/xMatic/issues) • [💡 Request Feature](https://github.com/iamvasee/xMatic/issues)

</div>