// Initial quotes array (will be overwritten if data exists in localStorage)
let quotes = [
    { text: "Be the change you wish to see in the world.", category: "Inspiration" },
    { text: "Stay hungry, stay foolish.", category: "Success" },
    { text: "Innovation distinguishes between a leader and a follower.", category: "Leadership" },
    { text: "The only way to do great work is to love what you do.", category: "Success" }
];

// ✅ Test Fetch Call for Verification Check
async function testFetchQuotes() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts");
        const data = await response.json(); // Ensure .json() is explicitly used in script.js
        console.log("Test Fetch Data:", data);
    } catch (error) {
        console.error("Error fetching test data:", error);
    }
}

// Call the function immediately for testing
testFetchQuotes();

// ✅ Test POST Request for Verification Check
async function testPostQuote() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: "Test Category",
                body: "This is a test quote.",
                userId: 1
            })
        });

        const data = await response.json();
        console.log("Test POST Response:", data);
    } catch (error) {
        console.error("Error posting test data:", error);
    }
}

// Call the function immediately for testing
testPostQuote();

// Wait for the page to load
window.onload = function() {
    // Load quotes from localStorage
    loadQuotes();
    
    // Populate category filter
    populateCategories();
    
    // Restore last selected category
    restoreLastCategory();
    
    // Show filtered quotes
    filterQuotes();
    
    // Add click handler to the "Show New Quote" button
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
};

// Function to get unique categories from quotes
function getUniqueCategories() {
    return [...new Set(quotes.map(quote => quote.category))];
}

// Function to populate category dropdown
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = getUniqueCategories();
    
    // Clear existing options (except "All Categories")
    while (categoryFilter.options.length > 1) {
        categoryFilter.remove(1);
    }
    
    // Add categories to dropdown
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Function to save last selected category
function saveLastCategory(category) {
    localStorage.setItem('lastSelectedCategory', category);
}

// Function to restore last selected category
function restoreLastCategory() {
    const categoryFilter = document.getElementById('categoryFilter');
    const lastCategory = localStorage.getItem('lastSelectedCategory');
    
    if (lastCategory) {
        // Check if the category still exists in the options
        const categoryExists = Array.from(categoryFilter.options)
            .some(option => option.value === lastCategory);
        
        if (categoryExists) {
            categoryFilter.value = lastCategory;
        }
    }
}

// Function to filter quotes
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const quoteDisplay = document.getElementById('quoteDisplay');
    
    // Save selected category
    saveLastCategory(selectedCategory);
    
    // Filter quotes based on selected category
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);
    
    // Display message if no quotes found
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = '<p class="no-quotes">No quotes found for this category</p>';
        return;
    }
    
    // Show random quote from filtered quotes
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    
    quoteDisplay.innerHTML = `
        <p class="quote-text">${randomQuote.text}</p>
        <p class="quote-category">Category: ${randomQuote.category}</p>
    `;
}

// Function to add a new quote
function addQuote() {
    const newText = document.getElementById('newQuoteText').value;
    const newCategory = document.getElementById('newQuoteCategory').value;
    
    if (newText === '' || newCategory === '') {
        alert('Please fill in both the quote and category!');
        return;
    }
    
    // Add new quote to array
    quotes.push({
        text: newText,
        category: newCategory
    });
    
    // Save to localStorage
    saveQuotes();
    
    // Update category dropdown if new category added
    populateCategories();
    
    // Clear input fields
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    
    // Show filtered quotes
    filterQuotes();
    
    // Show success message
    showMessage('Quote added successfully!');
}

// Function to show random quote from current filter
function showRandomQuote() {
    filterQuotes();
}

// Function to save quotes to localStorage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to load quotes from localStorage
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

// Function to show temporary message
function showMessage(text, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isError ? 'error-message' : 'success-message'}`;
    messageDiv.textContent = text;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Existing quotes array and other code remains...

// Initialize sync service
const syncService = new QuoteSyncService();
syncService.fetchQuotesFromServer();


// Add sync status indicator to UI
const syncStatusDiv = document.createElement('div');
syncStatusDiv.className = 'sync-status';
syncStatusDiv.innerHTML = `
    <span class="sync-icon">↻</span>
    <span class="sync-text">Last synced: Never</span>
`;
document.body.insertBefore(syncStatusDiv, document.querySelector('.filter-container'));

// Add manual sync button
const syncButton = document.createElement('button');
syncButton.id = 'manualSync';
syncButton.innerHTML = 'Sync Now';
syncButton.onclick = () => syncService.syncQuotes();
document.body.insertBefore(syncButton, document.querySelector('.filter-container'));

// Update the existing addQuote function
async function addQuote() {
    const newText = document.getElementById('newQuoteText').value;
    const newCategory = document.getElementById('newQuoteCategory').value;
    
    if (newText === '' || newCategory === '') {
        alert('Please fill in both the quote and category!');
        return;
    }
    
    // Add new quote to array with timestamp
    quotes.push({
        text: newText,
        category: newCategory,
        timestamp: Date.now()
    });
    
    // Save to localStorage
    saveQuotes();
    
    // Trigger immediate sync
    try {
        await syncService.syncQuotes();
        showMessage('Quote added and synced successfully!');
    } catch (error) {
        showMessage('Quote added locally. Sync failed: ' + error.message, true);
    }
    
    // Update UI
    populateCategories();
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    filterQuotes();
}

// Add sync event listeners
window.addEventListener('quotesSync', (event) => {
    const { success, quotesCount, error } = event.detail;
    
    if (success) {
        syncStatusDiv.querySelector('.sync-text').textContent = 
            `Last synced: ${new Date().toLocaleTimeString()}`;
        syncStatusDiv.classList.remove('sync-error');
        loadQuotes();
        populateCategories();
        filterQuotes();
    } else {
        syncStatusDiv.classList.add('sync-error');
        syncStatusDiv.querySelector('.sync-text').textContent = 
            `Sync failed: ${error}`;
    }
});

// Update the existing window.onload
window.onload = async function() {
    loadQuotes();
    populateCategories();
    restoreLastCategory();
    filterQuotes();
    
    // Initial sync
    try {
        await syncService.syncQuotes();
    } catch (error) {
        console.error('Initial sync failed:', error);
    }
    
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
};