// Background script for Twitter Growth Tool
console.log('Twitter Growth Tool: Background script loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Twitter Growth Tool: Extension installed/updated');
});

// Handle messages from content script if needed
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Twitter Growth Tool: Message received:', request);
  
  if (request.action === 'getConfig') {
    chrome.storage.sync.get(['openaiKey', 'style'], (result) => {
      console.log('Twitter Growth Tool: Sending config:', result);
      sendResponse(result);
    });
    return true;
  }
});

// Log when content script connects
chrome.runtime.onConnect.addListener((port) => {
  console.log('Twitter Growth Tool: Content script connected');
});