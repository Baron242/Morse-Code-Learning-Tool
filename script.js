const morseCodeMap = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
    '9': '----.', '0': '-----', ' ': '/'
};

let lastMorseCode = ''; // Store the last Morse code sequence
let answerVisible = false; // Track answer visibility state

// Get the speed value from the slider
function getSpeed() {
    return parseFloat(document.getElementById('speed-range').value);
}

// Generate Morse code tone using the Web Audio API
function playMorseCode(morseString) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const speed = getSpeed(); // Get current speed from the slider
    const dotLength = 0.1 / speed;  // Length of a dot in seconds
    const dashLength = dotLength * 3;
    const gapBetweenSymbols = dotLength;
    let currentTime = audioCtx.currentTime;

    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine';  // Tone type, 'sine' is smooth
    oscillator.frequency.setValueAtTime(600, currentTime); // 600Hz tone

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, currentTime); // Start with silence

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();

    morseString.split('').forEach(symbol => {
        if (symbol === '.') {
            gainNode.gain.setValueAtTime(1, currentTime);  // Play tone for dot
            currentTime += dotLength;
            gainNode.gain.setValueAtTime(0, currentTime);  // Silence after dot
            currentTime += gapBetweenSymbols;
        } else if (symbol === '-') {
            gainNode.gain.setValueAtTime(1, currentTime);  // Play tone for dash
            currentTime += dashLength;
            gainNode.gain.setValueAtTime(0, currentTime);  // Silence after dash
            currentTime += gapBetweenSymbols;
        } else if (symbol === ' ') {
            currentTime += dashLength; // Gap between letters
        }
    });

    oscillator.stop(currentTime + gapBetweenSymbols);  // Stop after all tones
}

// Translate text to morse code
document.getElementById('translate-btn').addEventListener('click', () => {
    const textInput = document.getElementById('text-input').value.toUpperCase();
    let morseOutput = '';

    for (let char of textInput) {
        morseOutput += morseCodeMap[char] ? morseCodeMap[char] + ' ' : '';
    }

    document.getElementById('morse-output').textContent = morseOutput.trim();
});

// Generate morse code learning table with play buttons
const morseTableDiv = document.getElementById('morse-table');
morseTableDiv.innerHTML = ''; // Clear existing content

const tableContainer = document.createElement('div');
tableContainer.className = 'morse-table-container';

for (let [letter, code] of Object.entries(morseCodeMap)) {
    const container = document.createElement('div');
    container.className = 'morse-table-item';

    const text = document.createElement('span');
    text.textContent = `${letter}: ${code}`;
    text.className = 'morse-table-text';

    const button = document.createElement('button');
    button.textContent = 'Play';
    button.className = 'morse-table-button';

    button.addEventListener('click', () => playMorseCode(code));

    container.appendChild(text);
    container.appendChild(button);
    tableContainer.appendChild(container);
}

morseTableDiv.appendChild(tableContainer);

// Initially hide the "Hide Answer" button
document.getElementById('toggle-answer-btn').style.display = 'none';

// Practice mode with audio tones
let score = 0;
const practiceOutput = document.getElementById('practice-output');
const practiceInput = document.getElementById('practice-input');
const practiceScore = document.getElementById('practice-score');

// Start practice mode
document.getElementById('start-practice-btn').addEventListener('click', () => {
    const randomLetter = Object.keys(morseCodeMap)[Math.floor(Math.random() * 36)];
    const morseForLetter = morseCodeMap[randomLetter];

    // Update practice text with the letter for Morse code
    practiceOutput.textContent = `Morse for: ${randomLetter}`;

    // Hide the Morse code answer by default
    practiceOutput.classList.add('hidden');

    // Store the last played Morse code
    lastMorseCode = morseForLetter;
    document.getElementById('rehear-btn').disabled = false; // Enable rehear button

    // Display the "Hide Answer" button when practice starts
    document.getElementById('toggle-answer-btn').style.display = 'block';
    document.getElementById('toggle-answer-btn').textContent = 'Show Answer'; // Set initial button text

    // Play the corresponding Morse code tone for the letter
    playMorseCode(morseForLetter);
});

// Submit answer and check correctness
document.getElementById('submit-practice-btn').addEventListener('click', () => {
    const practiceText = practiceInput.value.toUpperCase();
    const currentLetter = practiceOutput.textContent.split(' ')[2];

    if (practiceText === currentLetter) {
        score++;
        practiceScore.textContent = `Score: ${score}`;
    } else {
        alert(`Incorrect! The correct letter was ${currentLetter}`);
    }

    practiceInput.value = '';
    document.getElementById('start-practice-btn').click(); // Start a new practice
});

// Rehear button functionality
document.getElementById('rehear-btn').addEventListener('click', () => {
    if (lastMorseCode) {
        playMorseCode(lastMorseCode); // Replay the last Morse code sequence
    }
});

// Toggle answer visibility
document.getElementById('toggle-answer-btn').addEventListener('click', () => {
    const answerButton = document.getElementById('toggle-answer-btn');
    const practiceText = document.getElementById('practice-output');

    if (answerVisible) {
        practiceText.classList.add('hidden'); // Hide the answer
        answerButton.textContent = 'Show Answer'; // Update button text
    } else {
        practiceText.classList.remove('hidden'); // Show the answer
        answerButton.textContent = 'Hide Answer'; // Update button text
    }

    answerVisible = !answerVisible; // Toggle visibility state
});

// Speed control
const speedRange = document.getElementById('speed-range');
const speedLabel = document.getElementById('speed-label');

speedRange.addEventListener('input', (e) => {
    speedLabel.textContent = e.target.value;
});
