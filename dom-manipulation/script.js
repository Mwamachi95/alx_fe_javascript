// Initial quotes data structure
let quotes = [
    { text: "Be the change you wish to see in the world.", category: "Inspiration" },
    { text: "Stay hungry, stay foolish.", category: "Success" },
    { text: "Innovation distinguishes between a leader and a follower.", category: "Leadership" },
    { text: "The only way to do great work is to love what you do.", category: "Success" }
];

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create category filter dropdown
    createCategoryFilter();
    
    // Create the form for adding new quotes
    createAddQuoteForm();
    
    // Display initial random quote
    showRandomQuote();
    
    // Add event listener to "Show New Quote" button
    document.getElementById('newQuote').addEventListener('click', () => {
        showRandomQuote();
    });
});

function createCategoryFilter() {
    // Create container for filter
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container';
    
    // Create select element
    const select = document.createElement('select');
    select.id = 'categoryFilter';
    
    // Add "All Categories" option
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = 'All Categories';
    select.appendChild(allOption);
    
    // Get unique categories
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
    
    // Add change event listener
    select.addEventListener('change', () => {
        showRandomQuote();
    });
    
    // Add label
    const label = document.createElement('label');
    label.textContent = 'Filter by category: ';
    label.setAttribute('for', 'categoryFilter');
    
    filterContainer.appendChild(label);
    filterContainer.appendChild(select);
    
    // Insert filter before quote display
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.parentNode.insertBefore(filterContainer, quoteDisplay);
}

function createAddQuoteForm() {
    // Create form container
    const formContainer = document.createElement('div');
    formContainer.className = 'add-quote-form';
    
    // Create form elements
    const quoteInput = document.createElement('input');
    quoteInput.type = 'text';
    quoteInput.id = 'newQuoteText';
    quoteInput.placeholder = 'Enter a new quote';
    
    const categoryInput = document.createElement('input');
    categoryInput.type = 'text';
    categoryInput.id = 'newQuoteCategory';
    categoryInput.placeholder = 'Enter quote category';
    
    const addButton = document.createElement('button');
    addButton.textContent = 'Add Quote';
    addButton.addEventListener('click', addQuote);
    
    // Add elements to form container
    formContainer.appendChild(createFormGroup('Quote:', quoteInput));
    formContainer.appendChild(createFormGroup('Category:', categoryInput));
    formContainer.appendChild(addButton);
    
    // Add form to document
    document.body.appendChild(formContainer);
}

function createFormGroup(labelText, inputElement) {
    const group = document.createElement('div');
    group.className = 'form-group';
    
    const label = document.createElement('label');
    label.textContent = labelText;
    
    group.appendChild(label);
    group.appendChild(inputElement);
    
    return group;
}

function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    const selectedCategory = document.getElementById('categoryFilter').value;
    
    // Filter quotes by selected category
    const filteredQuotes = selectedCategory
        ? quotes.filter(quote => quote.category === selectedCategory)
        : quotes;
    
    if (filteredQuotes.length === 0) {
        quoteDisplay.textContent = 'No quotes available for this category';
        return;
    }
    
    // Select random quote
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const selectedQuote = filteredQuotes[randomIndex];
    
    // Clear previous content
    quoteDisplay.innerHTML = '';
    
    // Create and style quote elements
    const quoteText = document.createElement('p');
    quoteText.className = 'quote-text';
    quoteText.textContent = `"${selectedQuote.text}"`;
    
    const quoteCategory = document.createElement('p');
    quoteCategory.className = 'quote-category';
    quoteCategory.textContent = `Category: ${selectedQuote.category}`;
    
    // Add elements to display
    quoteDisplay.appendChild(quoteText);
    quoteDisplay.appendChild(quoteCategory);
}

function addQuote() {
    const quoteText = document.getElementById('newQuoteText');
    const quoteCategory = document.getElementById('newQuoteCategory');
    
    // Validate inputs
    if (!quoteText.value || !quoteCategory.value) {
        alert('Please fill in both the quote and category fields');
        return;
    }
    
    // Add new quote to array
    quotes.push({
        text: quoteText.value,
        category: quoteCategory.value
    });
    
    // Clear input fields
    quoteText.value = '';
    quoteCategory.value = '';
    
    // Update category filter
    const select = document.getElementById('categoryFilter');
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Clear existing category options (except "All Categories")
    while (select.childNodes.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    // Add updated categories
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
    
    // Show new quote
    showRandomQuote();
    
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = 'Quote added successfully!';
    document.body.appendChild(successMessage);
    
    // Remove success message after 2 seconds
    setTimeout(() => {
        successMessage.remove();
    }, 2000);
}
