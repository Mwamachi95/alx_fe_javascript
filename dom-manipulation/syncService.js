// syncService.js

class QuoteSyncService {
    constructor(baseUrl = 'https://jsonplaceholder.typicode.com') {
        this.baseUrl = baseUrl;
        this.syncInterval = 30000; // 30 seconds
        this.lastSyncTimestamp = Date.now();
        this.setupAutoSync();
    }

    // Start automatic synchronization
    setupAutoSync() {
        setInterval(() => this.syncQuotes(), this.syncInterval);
    }

    // Fetch quotes from server
    async fetchQuotesFromServer() {
        try {
            const response = await fetch(`${this.baseUrl}/posts`);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const posts = await response.json();
            // Convert posts to quote format
            return posts.slice(0, 10).map(post => ({
                text: post.body.split('\n')[0],
                category: post.title.split(' ')[0],
                serverId: post.id,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.error('Error fetching quotes:', error);
            throw error;
        }
    }

    // Push local quotes to server
    async pushQuotesToServer(quotes) {
        try {
            const promises = quotes
                .filter(quote => !quote.serverId)
                .map(quote => 
                    fetch(`${this.baseUrl}/posts`, {
                        method: 'POST',
                        body: JSON.stringify({
                            title: quote.category,
                            body: quote.text,
                            userId: 1
                        }),
                        headers: {
                            'Content-type': 'application/json; charset=UTF-8'
                        }
                    })
                );
            
            const results = await Promise.allSettled(promises);
            return results.map(result => result.status === 'fulfilled');
        } catch (error) {
            console.error('Error pushing quotes:', error);
            throw error;
        }
    }

    // Merge local and server quotes
    mergeQuotes(localQuotes, serverQuotes) {
        const mergedQuotes = [...localQuotes];
        
        serverQuotes.forEach(serverQuote => {
            const localIndex = mergedQuotes.findIndex(
                local => local.serverId === serverQuote.serverId
            );
            
            if (localIndex === -1) {
                // New quote from server
                mergedQuotes.push(serverQuote);
            } else if (!mergedQuotes[localIndex].timestamp || 
                       serverQuote.timestamp > mergedQuotes[localIndex].timestamp) {
                // Server quote is newer
                mergedQuotes[localIndex] = serverQuote;
            }
        });
        
        return mergedQuotes;
    }

    // Main sync function
    async syncQuotes() {
        try {
            // Get local quotes
            const localQuotes = JSON.parse(localStorage.getItem('quotes') || '[]');
            
            // Fetch server quotes
            const serverQuotes = await this.fetchServerQuotes();
            
            // Push new local quotes to server
            await this.pushQuotesToServer(localQuotes);
            
            // Merge quotes
            const mergedQuotes = this.mergeQuotes(localQuotes, serverQuotes);
            
            // Update local storage
            localStorage.setItem('quotes', JSON.stringify(mergedQuotes));
            
            // Update timestamp
            this.lastSyncTimestamp = Date.now();
            
            // Dispatch event for UI update
            window.dispatchEvent(new CustomEvent('quotesSync', {
                detail: {
                    success: true,
                    quotesCount: mergedQuotes.length
                }
            }));
            
            return mergedQuotes;
        } catch (error) {
            window.dispatchEvent(new CustomEvent('quotesSync', {
                detail: {
                    success: false,
                    error: error.message
                }
            }));
            throw error;
        }
    }
}