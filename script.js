// DOM Elements
const settingsIcon = document.getElementById('settingsIcon');
const settingsModal = document.getElementById('settingsModal');
const saveSettingsButton = document.getElementById('saveSettings');
const countdownTitleElement = document.getElementById('countdownTitle');
const gridContainer = document.getElementById('gridContainer');
const tabLifespan = document.getElementById('tabLifespan');
const tabEvent = document.getElementById('tabEvent');
const errorMessage = document.getElementById('errorMessage');
const percentageCompleteElement = document.getElementById('percentageComplete');
const daysRemainingElement = document.getElementById('daysRemaining');

// State variables
let countdownInterval;
let millisecondsInterval;
let gridUpdateInterval;
let lastUpdatedSquare = 0;
let currentSettings = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    updateQuote();
    setInterval(updateQuote, 3600000); // Update quote every hour
});

// Event Listeners
settingsIcon.addEventListener('click', () => {
    settingsModal.style.display = 'flex';
    openTab('Lifespan');
});

window.addEventListener('click', (event) => {
    if (event.target === settingsModal) {
        settingsModal.style.display = 'none';
        resetErrorStyles();
    }
});

tabLifespan.addEventListener('click', () => openTab('Lifespan'));
tabEvent.addEventListener('click', () => openTab('Event'));

saveSettingsButton.addEventListener('click', saveSettings);

// Tab Management
function openTab(tabName) {
    const tabcontent = document.getElementsByClassName('tabcontent');
    const tabButtons = document.getElementsByClassName('tab-button');
    
    Array.from(tabcontent).forEach(tab => tab.style.display = 'none');
    Array.from(tabButtons).forEach(button => button.classList.remove('active'));
    
    document.getElementById(tabName).style.display = 'block';
    document.querySelector(`button[id*="${tabName}"]`).classList.add('active');
    
    resetErrorStyles();
}

// Settings Management
function saveSettings() {
    const settings = {};
    let isValid = true;
    
    resetErrorStyles();
    
    if (document.getElementById('Lifespan').style.display === 'block') {
        const dob = document.getElementById('dobInput').value;
        const lifespan = parseInt(document.getElementById('lifespanInput').value);
        
        if (!dob || !lifespan) {
            isValid = false;
            if (!dob) document.getElementById('dobInput').classList.add('error');
            if (!lifespan) document.getElementById('lifespanInput').classList.add('error');
        } else {
            settings.type = 'lifespan';
            settings.dob = new Date(dob).getTime();
            settings.lifespan = lifespan;
            settings.totalSquares = lifespan * 12; // One square per month
        }
    } else {
        const title = document.getElementById('eventTitle').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        if (!title || !startDate || !endDate) {
            isValid = false;
            if (!title) document.getElementById('eventTitle').classList.add('error');
            if (!startDate) document.getElementById('startDate').classList.add('error');
            if (!endDate) document.getElementById('endDate').classList.add('error');
        } else {
            settings.type = 'event';
            settings.title = title;
            settings.startDate = new Date(startDate).getTime();
            settings.endDate = new Date(endDate).getTime();
            
            const months = calculateMonthsBetween(new Date(startDate), new Date(endDate));
            settings.totalSquares = Math.max(months, 12); // Minimum 12 squares
        }
    }
    
    if (!isValid) {
        errorMessage.style.display = 'block';
        return;
    }
    
    clearAllIntervals();
    chrome.storage.sync.set({ settings }, () => {
        settingsModal.style.display = 'none';
        currentSettings = settings;
        initializeCountdown(settings);
    });
}

// Countdown Logic
function initializeCountdown(settings) {
    const now = Date.now();
    const endTime = settings.type === 'lifespan' 
        ? settings.dob + (settings.lifespan * 365.25 * 24 * 60 * 60 * 1000)
        : settings.endDate;
    const startTime = settings.type === 'lifespan' ? settings.dob : settings.startDate;
    
    countdownTitleElement.textContent = settings.type === 'lifespan' 
        ? 'Your Life Journey' 
        : settings.title;
    
    createGrid(settings.totalSquares);
    updateCountdown(endTime, startTime);
    updateProgress(now, startTime, endTime);
    
    countdownInterval = setInterval(() => {
        const currentTime = Date.now();
        updateCountdown(endTime, startTime);
        updateProgress(currentTime, startTime, endTime);
    }, 1000);
}

function updateCountdown(endTime, startTime) {
    const now = Date.now();
    const remaining = endTime - now;
    
    if (remaining <= 0) {
        clearAllIntervals();
        displayComplete();
        return;
    }
    
    const timeUnits = calculateTimeUnits(remaining);
    Object.entries(timeUnits).forEach(([unit, value]) => {
        const element = document.getElementById(unit);
        if (element) {
            element.textContent = String(value).padStart(2, '0');
        }
    });
}

function updateProgress(now, startTime, endTime) {
    const totalDuration = endTime - startTime;
    const elapsed = now - startTime;
    const percentage = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
    const daysLeft = Math.ceil((endTime - now) / (24 * 60 * 60 * 1000));
    
    percentageCompleteElement.textContent = `${percentage.toFixed(1)}%`;
    daysRemainingElement.textContent = daysLeft.toLocaleString();
    
    updateGrid(percentage);
}

// Grid Management
function createGrid(totalSquares) {
    gridContainer.innerHTML = '';
    const screenRatio = window.innerWidth / window.innerHeight;
    const columns = Math.ceil(Math.sqrt(totalSquares * screenRatio));
    const rows = Math.ceil(totalSquares / columns);
    
    gridContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    
    for (let i = 0; i < totalSquares; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        gridContainer.appendChild(square);
    }
}

function updateGrid(percentage) {
    const squares = document.querySelectorAll('.square');
    const completedSquares = Math.floor((percentage / 100) * squares.length);
    
    squares.forEach((square, index) => {
        square.classList.toggle('completed', index < completedSquares);
    });
}

// Utility Functions
function calculateTimeUnits(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor((ms / (1000 * 60 * 60 * 24)) % 30.44);
    const months = Math.floor((ms / (1000 * 60 * 60 * 24 * 30.44)) % 12);
    const years = Math.floor(ms / (1000 * 60 * 60 * 24 * 365.25));
    
    return { years, months, days, hours, minutes, seconds };
}

function calculateMonthsBetween(date1, date2) {
    return (date2.getFullYear() - date1.getFullYear()) * 12 + 
           (date2.getMonth() - date1.getMonth());
}

function displayComplete() {
    countdownTitleElement.textContent = 'Time Complete!';
    document.querySelectorAll('.time-unit span').forEach(span => {
        span.textContent = '00';
    });
    document.querySelectorAll('.square').forEach(square => {
        square.classList.add('completed');
    });
}

function clearAllIntervals() {
    [countdownInterval, millisecondsInterval, gridUpdateInterval].forEach(interval => {
        if (interval) clearInterval(interval);
    });
}

function resetErrorStyles() {
    errorMessage.style.display = 'none';
    document.querySelectorAll('.input-field').forEach(input => {
        input.classList.remove('error');
    });
}

// Load settings on startup
function loadSettings() {
    chrome.storage.sync.get('settings', ({ settings }) => {
        if (settings) {
            currentSettings = settings;
            initializeCountdown(settings);
        } else {
            settingsModal.style.display = 'flex';
            openTab('Lifespan');
        }
    });
}