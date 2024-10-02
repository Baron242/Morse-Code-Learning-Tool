const morseCodeMap = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
    '9': '----.', '0': '-----', ' ': '/'
};

let lastMorseCode = '';
let answerVisible = false;

// Get speed from the slider
function getSpeed() {
    return parseFloat(document.getElementById('speed-range').value);
}

// Play morse code sound
function playMorseCode(morseString) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const speed = getSpeed();
    const dotLength = 0.1 / speed;
    const dashLength = dotLength * 3;
    const gapBetweenSymbols = dotLength;
    let currentTime = audioCtx.currentTime;

    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, currentTime);

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();

    morseString.split('').forEach(symbol => {
        if (symbol === '.') {
            gainNode.gain.setValueAtTime(1, currentTime);
            currentTime += dotLength;
            gainNode.gain.setValueAtTime(0, currentTime);
            currentTime += gapBetweenSymbols;
        } else if (symbol === '-') {
            gainNode.gain.setValueAtTime(1, currentTime);
            currentTime += dashLength;
            gainNode.gain.setValueAtTime(0, currentTime);
            currentTime += gapBetweenSymbols;
        } else if (symbol === ' ') {
            currentTime += dashLength;
        }
    });

    oscillator.stop(currentTime + gapBetweenSymbols);
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
const morseItems = document.querySelectorAll('.morse-item button');
morseItems.forEach((button, index) => {
    const letter = Object.keys(morseCodeMap)[index];
    const morseCode = morseCodeMap[letter];

    button.addEventListener('click', () => playMorseCode(morseCode));
});

// Practice Mode
let score = 0;
const practiceOutput = document.getElementById('practice-output');
const practiceInput = document.getElementById('practice-input');
const practiceScore = document.getElementById('practice-score');

// Start practice mode
document.getElementById('start-practice-btn').addEventListener('click', () => {
    const randomLetter = Object.keys(morseCodeMap)[Math.floor(Math.random() * 36)];
    const morseForLetter = morseCodeMap[randomLetter];

    practiceOutput.textContent = `Morse for: ${randomLetter}`;
    practiceOutput.classList.add('hidden');

    lastMorseCode = morseForLetter;
    document.getElementById('rehear-btn').disabled = false;
    document.getElementById('toggle-answer-btn').style.display = 'block';
    document.getElementById('toggle-answer-btn').textContent = 'Show Answer';

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
    document.getElementById('start-practice-btn').click();
});

// Rehear functionality
document.getElementById('rehear-btn').addEventListener('click', () => {
    if (lastMorseCode) {
        playMorseCode(lastMorseCode);
    }
});

// Toggle answer visibility
document.getElementById('toggle-answer-btn').addEventListener('click', () => {
    const answerButton = document.getElementById('toggle-answer-btn');
    const practiceText = document.getElementById('practice-output');

    if (answerVisible) {
        practiceText.classList.add('hidden');
        answerButton.textContent = 'Show Answer';
    } else {
        practiceText.classList.remove('hidden');
        answerButton.textContent = 'Hide Answer';
    }

    answerVisible = !answerVisible;
});

// Speed control
const speedRange = document.getElementById('speed-range');
const speedLabel = document.getElementById('speed-label');

speedRange.addEventListener('input', (e) => {
    speedLabel.textContent = e.target.value;
});
