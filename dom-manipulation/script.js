import { QuoteSyncService } from './syncService.js';

const syncService = new QuoteSyncService();

// Initial quotes array with text and category properties
let quotes = [
    { text: "Be the change you wish to see in the world.", category: "Inspiration" },
    { text: "Stay hungry, stay foolish.", category: "Success" },
    { text: "Innovation distinguishes between a leader and a follower.", category: "Leadership" },
    { text: "The only way to do great work is to love what you do.", category: "Success" }
];


// Test Fetch Call for Verification Check
async function testFetchQuotes() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts");
        const data = await response.json();
        console.log("Test Fetch Data:", data);
    } catch (error) {
        console.error("Error fetching test data:", error);
    }
}

// Test POST Request for Verification Check
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

// Function to display a random quote (renamed from filterQuotes)
function showRandomQuote() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const quoteDisplay = document.getElementById('quoteDisplay');
    
    saveLastCategory(selectedCategory);
    
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);
    
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = '<p class="no-quotes">No quotes found for this category</p>';
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    
    // Save to session storage
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
    
    quoteDisplay.innerHTML = `
        <p class="quote-text">${randomQuote.text}</p>
        <p class="quote-category">Category: ${randomQuote.category}</p>
    `;
}

// Add event listener for "Show New Quote" button
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

// Function to create add quote form
function createAddQuoteForm() {
    const formContainer = document.createElement('div');
    formContainer.className = 'form-container';
    formContainer.innerHTML = `
        <h2>Add a New Quote</h2>
        <div class="input-group">
            <input id="newQuoteText" type="text" placeholder="Enter your quote">
        </div>
        <div class="input-group">
            <input id="newQuoteCategory" type="text" placeholder="Enter category">
        </div>
        <button onclick="addQuote()">Add Quote</button>
    `;
    //document.body.appendChild(formContainer);
    // Find the import/export section by its text content
    const importExportSection = Array.from(document.body.children).find(child => 
        child.textContent.includes("Import/Export Quotes")
    );

    // Insert formContainer before the import/export section
    if (importExportSection) {
        importExportSection.parentNode.insertBefore(formContainer, importExportSection);
    } else {
        document.body.appendChild(formContainer); // Fallback if not found
    }
    
     // Attach event listener to the Add Quote button
     document.getElementById("addQuoteBtn").addEventListener('click', addQuote);
}

// Function to get unique categories
function getUniqueCategories() {
    return [...new Set(quotes.map(quote => quote.category))];
}

// Function to populate category dropdown
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = getUniqueCategories();
    
    while (categoryFilter.options.length > 1) {
        categoryFilter.remove(1);
    }
    
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
        const categoryExists = Array.from(categoryFilter.options)
            .some(option => option.value === lastCategory);
        
        if (categoryExists) {
            categoryFilter.value = lastCategory;
        }
    }
}

document.getElementById("addQuoteBtn").addEventListener('click', addQuote);

// Function to add a new quote
async function addQuote() {
    const newText = document.getElementById('newQuoteText').value;
    const newCategory = document.getElementById('newQuoteCategory').value;
    
    if (!newText || !newCategory) {
        alert('Please fill in both fields');
        return;
    }
    
    const newQuote = {
        text: newText,
        category: newCategory,
        timestamp: Date.now()
    };
    
    quotes.push(newQuote);
    saveQuotes();
    
    try {
        await syncService.syncQuotes();
        showMessage('Quote added and synced successfully!');
    } catch (error) {
        showMessage('Quote added locally. Sync failed: ' + error.message, true);
    }
    
    // Clear inputs and update display
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    populateCategories();
    showRandomQuote();
}

// Function to save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to load quotes from local storage
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

// Function to export quotes to JSON file
function exportToJsonFile() {
    const quotesJson = JSON.stringify(quotes, null, 2);
    const blob = new Blob([quotesJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Function to import quotes from JSON file
function importFromJsonFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            quotes = quotes.concat(importedQuotes);
            saveQuotes();
            populateCategories();
            showRandomQuote();
            showMessage('Quotes imported successfully!');
        } catch (error) {
            showMessage('Error importing quotes: Invalid JSON file', true);
        }
    };
    
    reader.readAsText(file);
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

// Set up sync status
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

// Sync event listeners
window.addEventListener('quotesSync', (event) => {
    const { success, quotesCount, error } = event.detail;
    
    if (success) {
        syncStatusDiv.querySelector('.sync-text').textContent = 
            `Last synced: ${new Date().toLocaleTimeString()}`;
        syncStatusDiv.classList.remove('sync-error');
        loadQuotes();
        populateCategories();
        showRandomQuote();
        showMessage('Quotes synced with server!');
    } else {
        syncStatusDiv.classList.add('sync-error');
        syncStatusDiv.querySelector('.sync-text').textContent = 
            `Sync failed: ${error}`;
    }
});

// Periodic sync check
setInterval(async () => {
    try {
        await syncService.syncQuotes();
        console.log("Periodic sync completed.");
    } catch (error) {
        console.error("Error during periodic sync:", error);
    }
}, 10000);

// Initialize when page loads
window.onload = async function() {
    // Call initial test functions
    testFetchQuotes();
    testPostQuote();
    
    // Load quotes and setup UI
    loadQuotes();
    createAddQuoteForm();
    populateCategories();
    restoreLastCategory();
    showRandomQuote();
    
    // Initial sync
    try {
        await syncService.syncQuotes();
    } catch (error) {
        console.error('Initial sync failed:', error);
    }
    
    // Add event listener for new quote button
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    
    // Load last viewed quote from session storage if exists
    const lastViewedQuote = sessionStorage.getItem('lastViewedQuote');
    if (lastViewedQuote) {
        const quote = JSON.parse(lastViewedQuote);
        document.getElementById('quoteDisplay').innerHTML = `
            <p class="quote-text">${quote.text}</p>
            <p class="quote-category">Category: ${quote.category}</p>
        `;
    }
};