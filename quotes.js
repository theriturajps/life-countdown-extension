const quotes = [
    "Time is the most valuable thing a man can spend. - Theophrastus",
    "Yesterday is gone. Tomorrow has not yet come. We have only today. - Mother Teresa",
    "The future depends on what you do today. - Mahatma Gandhi",
    "Don't count the days, make the days count. - Muhammad Ali",
    "Time is what we want most, but what we use worst. - William Penn",
    "Lost time is never found again. - Benjamin Franklin",
    "The two most powerful warriors are patience and time. - Leo Tolstoy",
    "Time waits for no one. - Folklore",
    "Life is not measured by the number of breaths we take, but by the moments that take our breath away. - Maya Angelou",
    "Time is free, but it's priceless. - Harvey MacKay",
    "The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb",
    "Time is a created thing. To say 'I don't have time' is to say 'I don't want to'. - Lao Tzu",
    "Time is the wisest counselor of all. - Pericles",
    "Every moment is a fresh beginning. - T.S. Eliot",
    "Your time is limited, don't waste it living someone else's life. - Steve Jobs"
];

function getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
}

// Update quote every hour
function updateQuote() {
    const quoteElement = document.getElementById('motivationalQuote');
    if (quoteElement) {
        quoteElement.textContent = getRandomQuote();
    }
}