// Load quotes from local storage if available
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "Be the change you wish to see in the world.", category: "Inspiration" },
    { text: "Stay hungry, stay foolish.", category: "Success" },
    { text: "Innovation distinguishes between a leader and a follower.", category: "Leadership" },
    { text: "The only way to do great work is to love what you do.", category: "Success" }
];

// Function to save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Save the last viewed quote to session storage
function saveLastViewedQuote(quote) {
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// Load the last viewed quote from session storage
function loadLastViewedQuote() {
    const lastQuote = sessionStorage.getItem('lastViewedQuote');
    if (lastQuote) {
        return JSON.parse(lastQuote);
    }
    return null;
}

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    createCategoryFilter();
    createAddQuoteForm();
    createExportButton();
    createImportFileInput();
    showRandomQuote();

    document.getElementById('newQuote').addEventListener('click', () => {
        showRandomQuote();
    });

    const lastQuote = loadLastViewedQuote();
    if (lastQuote) {
        const quoteDisplay = document.getElementById('quoteDisplay');
        quoteDisplay.innerHTML = '';

        const quoteText = document.createElement('p');
        quoteText.className = 'quote-text';
        quoteText.textContent = `"${lastQuote.text}"`;

        const quoteCategory = document.createElement('p');
        quoteCategory.className = 'quote-category';
        quoteCategory.textContent = `Category: ${lastQuote.category}`;

        quoteDisplay.appendChild(quoteText);
        quoteDisplay.appendChild(quoteCategory);
    }
});

function createCategoryFilter() {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container';

    const select = document.createElement('select');
    select.id = 'categoryFilter';

    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = 'All Categories';
    select.appendChild(allOption);

    const categories = [...new Set(quotes.map(quote => quote.category))];

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });

    select.addEventListener('change', () => {
        showRandomQuote();
    });

    const label = document.createElement('label');
    label.textContent = 'Filter by category: ';
    label.setAttribute('for', 'categoryFilter');

    filterContainer.appendChild(label);
    filterContainer.appendChild(select);

    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.parentNode.insertBefore(filterContainer, quoteDisplay);
}

function createAddQuoteForm() {
    const formContainer = document.createElement('div');
    formContainer.className = 'add-quote-form';

    const quoteInput = document.createElement('input');
    quoteInput.type = 'text';
    quoteInput.id = 'newQuoteText';
    quoteInput.placeholder = 'Enter a new quote';

    const categoryInput = document.createElement('input');
    categoryInput.type = 'text';
    categoryInput.id = 'newQuoteCategory';
    categoryInput.placeholder = 'Enter a category';

    const addButton = document.createElement('button');
    addButton.textContent = 'Add Quote';
    addButton.addEventListener('click', addQuote);

    formContainer.appendChild(createFormGroup('Quote:', quoteInput));
    formContainer.appendChild(createFormGroup('Category:', categoryInput));
    formContainer.appendChild(addButton);

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

    const filteredQuotes = selectedCategory
        ? quotes.filter(quote => quote.category === selectedCategory)
        : quotes;

    if (filteredQuotes.length === 0) {
        quoteDisplay.textContent = 'No quotes available for this category';
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const selectedQuote = filteredQuotes[randomIndex];

    saveLastViewedQuote(selectedQuote);

    quoteDisplay.innerHTML = '';

    const quoteText = document.createElement('p');
    quoteText.className = 'quote-text';
    quoteText.textContent = `"${selectedQuote.text}"`;

    const quoteCategory = document.createElement('p');
    quoteCategory.className = 'quote-category';
    quoteCategory.textContent = `Category: ${selectedQuote.category}`;

    quoteDisplay.appendChild(quoteText);
    quoteDisplay.appendChild(quoteCategory);
}

function addQuote() {
    const quoteText = document.getElementById('newQuoteText');
    const quoteCategory = document.getElementById('newQuoteCategory');

    if (!quoteText.value || !quoteCategory.value) {
        alert('Please fill in both the quote and category fields');
        return;
    }

    quotes.push({
        text: quoteText.value,
        category: quoteCategory.value
    });

    saveQuotes();

    quoteText.value = '';
    quoteCategory.value = '';

    const select = document.getElementById('categoryFilter');
    const categories = [...new Set(quotes.map(quote => quote.category))];

    while (select.childNodes.length > 1) {
        select.removeChild(select.lastChild);
    }

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });

    showRandomQuote();

    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = 'Quote added successfully';
    document.body.appendChild(successMessage);

    setTimeout(() => {
        successMessage.remove();
    }, 2000);
}

// Function to export quotes to a JSON file
function exportQuotes() {
    const dataStr = JSON.stringify(quotes);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quotes.json';
    link.click();
    URL.revokeObjectURL(url);
}

// Add export button to the page
function createExportButton() {
    const exportButton = document.createElement('button');
    exportButton.textContent = 'Export Quotes';
    exportButton.addEventListener('click', exportQuotes);
    document.body.appendChild(exportButton);
}

// Function to import quotes from a JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        saveQuotes();
        alert('Quotes imported successfully!');
        showRandomQuote();
    };
    fileReader.readAsText(event.target.files[0]);
}

// Add import file input to the page
function createImportFileInput() {
    const importFileInput = document.createElement('input');
    importFileInput.type = 'file';
    importFileInput.id = 'importFile';
    importFileInput.accept = '.json';
    importFileInput.addEventListener('change', importFromJsonFile);
    document.body.appendChild(importFileInput);
}