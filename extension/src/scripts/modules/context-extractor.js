// xMatic - Context Extractor
class ContextExtractor {
    constructor() {
        // Initialize any context-specific configurations
    }

    // Extract context from the current tweet
    getContext() {
        const tweetElement = document.querySelector('[data-testid="tweet"]');
        
        if (!tweetElement) {
            return this.getEmptyContext();
        }

        return {
            mainTweet: this.extractTweetText(tweetElement),
            authorName: this.extractAuthorName(tweetElement),
            engagementData: this.extractEngagementData(tweetElement)
        };
    }

    // Extract the main tweet text content
    extractTweetText(tweetElement) {
        const textElement = tweetElement.querySelector('[data-testid="tweetText"]');
        return textElement ? textElement.textContent.trim() : '';
    }

    // Extract author information (display name only, no username)
    extractAuthorName(tweetElement) {
        const authorElement = tweetElement.querySelector('[data-testid="User-Name"]');
        
        if (!authorElement) {
            return '';
        }

        const nameElement = authorElement.querySelector('span');
        return nameElement ? nameElement.textContent.trim() : '';
    }

    // Extract engagement metrics from the tweet
    extractEngagementData(tweetElement) {
        const engagementData = {};

        try {
            // Extract likes count
            engagementData.likes = this.extractMetric(tweetElement, 'like');
            
            // Extract retweets count
            engagementData.retweets = this.extractMetric(tweetElement, 'retweet');
            
            // Extract replies count
            engagementData.replies = this.extractMetric(tweetElement, 'reply');
            
            // Extract quote tweets count
            engagementData.quotes = this.extractMetric(tweetElement, 'quote');

        } catch (error) {
            // Silently handle engagement data extraction errors
            console.warn('xMatic: Failed to extract some engagement metrics:', error);
        }

        return engagementData;
    }

    // Extract a specific metric from engagement buttons
    extractMetric(tweetElement, metricType) {
        const button = tweetElement.querySelector(`[data-testid="${metricType}"]`);
        if (!button) {
            return 0;
        }

        const ariaLabel = button.getAttribute('aria-label') || '';
        const match = ariaLabel.match(/(\d+)/);
        
        return match ? parseInt(match[1]) : 0;
    }

    // Get empty context when no tweet is found
    getEmptyContext() {
        return {
            mainTweet: '',
            authorName: '',
            engagementData: {
                likes: 0,
                retweets: 0,
                replies: 0,
                quotes: 0
            }
        };
    }

    // Check if we're on a valid tweet page
    isValidTweetPage() {
        return !!document.querySelector('[data-testid="tweet"]');
    }

    // Get tweet URL for context
    getTweetUrl() {
        const tweetElement = document.querySelector('[data-testid="tweet"]');
        if (!tweetElement) {
            return null;
        }

        // Try to find the tweet link
        const linkElement = tweetElement.querySelector('a[href*="/status/"]');
        return linkElement ? linkElement.href : null;
    }

    // Get tweet timestamp if available
    getTweetTimestamp() {
        const timeElement = document.querySelector('time');
        if (!timeElement) {
            return null;
        }

        return {
            text: timeElement.textContent,
            datetime: timeElement.getAttribute('datetime')
        };
    }

    // Get additional context like hashtags, mentions
    getAdditionalContext(tweetElement) {
        if (!tweetElement) {
            return {};
        }

        const textElement = tweetElement.querySelector('[data-testid="tweetText"]');
        if (!textElement) {
            return {};
        }

        const text = textElement.textContent;
        
        return {
            hashtags: this.extractHashtags(text),
            mentions: this.extractMentions(text),
            links: this.extractLinks(text),
            media: this.hasMedia(tweetElement)
        };
    }

    // Extract hashtags from tweet text
    extractHashtags(text) {
        const hashtagRegex = /#\w+/g;
        return text.match(hashtagRegex) || [];
    }

    // Extract mentions from tweet text
    extractMentions(text) {
        const mentionRegex = /@\w+/g;
        return text.match(mentionRegex) || [];
    }

    // Extract links from tweet text
    extractLinks(text) {
        const urlRegex = /https?:\/\/[^\s]+/g;
        return text.match(urlRegex) || [];
    }

    // Check if tweet has media (images, videos)
    hasMedia(tweetElement) {
        return !!tweetElement.querySelector('[data-testid="tweetPhoto"], [data-testid="videoPlayer"]');
    }

    // Get comprehensive context including additional data
    getComprehensiveContext() {
        const tweetElement = document.querySelector('[data-testid="tweet"]');
        
        if (!tweetElement) {
            return this.getEmptyContext();
        }

        const baseContext = this.getContext();
        const additionalContext = this.getAdditionalContext(tweetElement);

        return {
            ...baseContext,
            ...additionalContext,
            url: this.getTweetUrl(),
            timestamp: this.getTweetTimestamp(),
            hasMedia: additionalContext.media
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContextExtractor;
}
