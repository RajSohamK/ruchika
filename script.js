// Morse code variable
let morseCodeResult = '';

// Check if the Morse code dictionary is already defined
if (typeof morse_code_dict === 'undefined') {
    // Morse code dictionary
    var morse_code_dict = {
        'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
        'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
        'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
        'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
        'Y': '-.--', 'Z': '--..',
        '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
        '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
        ' ': ' ', '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--',
        ':': '---...', ';': '-.-.-.', '+': '.-.-.', '-': '-....-', '=': '-...-',
        '/': '-..-.', '"': '.-..-.', "'": '.----.', '(': '-.--.', ')': '-.--.-',
        '&': '.-...', '$': '...-..-', '@': '.--.-.'
    };
}

// Function to encode text to Morse code
function text_to_morse(text) {
    text = text.toUpperCase();
    let morse_code = '';
    for (let char of text) {
        if (char in morse_code_dict) {
            if (char === ' ') {
                morse_code += morse_code_dict[char];
            } else {
                morse_code += morse_code_dict[char] + ' ';
            }
        }
    }
    return morse_code.trim();
}

// Function to decode Morse code to text
function morse_to_text(morse_code) {
    morse_code = morse_code.split(' ');
    let text = '';
    for (let code of morse_code) {
        for (let char in morse_code_dict) {
            if (code === morse_code_dict[char]) {
                text += char;
                break;
            }
        }
        if (code === '') {
            text += ' ';
        }
    }
    return text;
}

// Example usage for encoding
function encodeText() {
    const textToEncode = document.getElementById("inputText").value;
    morseCodeResult = text_to_morse(textToEncode);
    document.getElementById("outputMorse").innerHTML = "Morse Code: " + morseCodeResult;
}

// Example usage for decoding
function decodeMorse() {
    const morseToDecode = document.getElementById("inputMorse").value;
    const decodedTextResult = morse_to_text(morseToDecode);
    document.getElementById("outputText").innerHTML = "Decoded Text: " + decodedTextResult;
}

// Function to scan Morse code from an image
function scanImage() {
    const inputImage = document.getElementById("inputImage").files[0];
    const qrOutput = document.getElementById('qrOutput');

    if (inputImage) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const image = new Image();
            image.src = e.target.result;

            image.onload = function () {
                Tesseract.recognize(
                    image,
                    'eng',
                    { logger: info => console.log(info) }
                ).then(({ data: { text } }) => {
                    morseCodeResult = text_to_morse(text.trim());
                    qrOutput.innerHTML = "Morse Code from Image: " + morseCodeResult;
                });
            };
        };

        reader.readAsDataURL(inputImage);
    } else {
        alert("Please select an image.");
    }
}

// Function to start QR code scanner
function startScanner() {
    const video = document.getElementById('video');
    const qrOutput = document.getElementById('qrOutput');
    const switchCameraBtn = document.getElementById('switchCameraBtn');
    const toggleCameraBtn = document.getElementById('toggleCameraBtn');

    let currentCameraIndex = 0;
    let videoSources = [];

    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            videoSources = devices.filter(device => device.kind === 'videoinput');

            if (videoSources.length === 0) {
                console.error('No video devices found.');
                return;
            }

            if (videoSources.length > 1) {
                switchCameraBtn.style.display = 'inline-block';
                toggleCameraBtn.style.display = 'inline-block';
            }

            // Start with the default camera
            startCamera(videoSources[currentCameraIndex].deviceId);
        })
        .catch(err => console.error('Error enumerating video devices:', err));

    switchCameraBtn.onclick = function () {
        // Check if there are available cameras
        if (videoSources.length > 1) {
            currentCameraIndex = (currentCameraIndex + 1) % videoSources.length;
            startCamera(videoSources[currentCameraIndex].deviceId);
        }
    };

    function startCamera(deviceId) {
        navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: deviceId } }
        })
            .then((stream) => {
                video.srcObject = stream;

                const codeReader = new ZXing.BrowserQRCodeReader();
                codeReader.decodeFromVideoDevice(deviceId, 'video', (result, err) => {
                    if (result) {
                        morseCodeResult = result.text.trim();
                        const decodedTextResult = morse_to_text(morseCodeResult);
                        qrOutput.innerHTML = "Decoded Text from QR: " + decodedTextResult;
                        // Close the camera after scanning
                        stream.getTracks().forEach(track => track.stop());
                    }
                    if (err) {
                        console.error(err);
                    }
                });
            })
            .catch((err) => {
                console.error(err);
            });
    }
}

// Function to toggle camera (front/back)
function toggleCamera() {
    const video = document.getElementById('video');
    const toggleCameraBtn = document.getElementById('toggleCameraBtn');
    const switchCameraBtn = document.getElementById('switchCameraBtn');

    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            const videoSources = devices.filter(device => device.kind === 'videoinput');
            if (videoSources.length > 1) {
                const facingMode = videoSources[0].facingMode;
                const newFacingMode = (facingMode === 'user') ? 'environment' : 'user';
                toggleCameraBtn.innerHTML = `Toggle Camera (${newFacingMode})`;

                video.srcObject.getTracks().forEach(track => track.stop());
                startCamera({ facingMode: newFacingMode });
            }
        })
        .catch(err => console.error('Error enumerating video devices:', err));
}

// Copy Morse code function
function copyMorseCode() {
    navigator.clipboard.writeText(morseCodeResult).then(function () {
        alert("Morse Code copied to clipboard!");
    }).catch(function (err) {
        console.error('Unable to copy Morse Code', err);
    });
}

// Paste Morse code function
function pasteMorseCode() {
    navigator.clipboard.readText().then(function (text) {
        document.getElementById("inputMorse").value = text;
    }).catch(function (err) {
        console.error('Unable to paste Morse Code', err);
    });
}