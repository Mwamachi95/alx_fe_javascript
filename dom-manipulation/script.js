// Initial quotes array (will be overwritten if data exists in localStorage)
let quotes = [
    { text: "Be the change you wish to see in the world.", category: "Inspiration" },
    { text: "Stay hungry, stay foolish.", category: "Success" }
];

// Wait for the page to load
window.onload = function() {
    // Load quotes from localStorage
    loadQuotes();
    
    // Show initial random quote
    showRandomQuote();
    
    // Add click handler to the "Show New Quote" button
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    
    // Store last viewed quote in sessionStorage whenever a new quote is shown
    document.getElementById('newQuote').addEventListener('click', storeLastViewedQuote);
};

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

// Function to store last viewed quote in sessionStorage
function storeLastViewedQuote() {
    const currentQuote = document.getElementById('quoteDisplay').innerHTML;
    sessionStorage.setItem('lastViewedQuote', currentQuote);
}

// Function to show a random quote
function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    const randomNumber = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomNumber];
    
    quoteDisplay.innerHTML = `
        <p><strong>${randomQuote.text}</strong></p>
        <p>Category: ${randomQuote.category}</p>
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
    
    // Clear input fields
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    
    // Show the new quote
    showRandomQuote();
    
    alert('Quote added successfully!');
}

// Function to export quotes to JSON file
function exportToJson() {
    // Create a Blob containing the quotes data
    const quotesJson = JSON.stringify(quotes, null, 2);
    const blob = new Blob([quotesJson], { type: 'application/json' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'my_quotes.json';
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    // Clean up
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
}

// Function to import quotes from JSON file
function importFromJsonFile(event) {
    const file = event.target.files[0];
    
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                // Parse the JSON file
                const importedQuotes = JSON.parse(e.target.result);
                
                // Validate the imported data
                if (Array.isArray(importedQuotes) && 
                    importedQuotes.every(quote => quote.text && quote.category)) {
                    // Add imported quotes to existing quotes
                    quotes.push(...importedQuotes);
                    
                    // Save to localStorage
                    saveQuotes();
                    
                    // Show success message
                    alert('Quotes imported successfully!');
                    
                    // Show a random quote from the new set
                    showRandomQuote();
                } else {
                    alert('Invalid JSON format. Please ensure the file contains valid quotes.');
                }
            } catch (error) {
                alert('Error reading file: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    }
}