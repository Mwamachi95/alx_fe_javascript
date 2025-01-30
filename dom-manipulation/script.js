// Initial quotes array (will be overwritten if data exists in localStorage)
let quotes = [
    { text: "Be the change you wish to see in the world.", category: "Inspiration" },
    { text: "Stay hungry, stay foolish.", category: "Success" },
    { text: "Innovation distinguishes between a leader and a follower.", category: "Leadership" },
    { text: "The only way to do great work is to love what you do.", category: "Success" }
];

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