const video = document.getElementById("camera");
const recognizedText = document.getElementById("recognizedText");
const translatedText = document.getElementById("translatedText");

// Accéder à la caméra arrière
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(error => {
        console.error("Erreur lors de l'accès à la caméra :", error);
    });

// Fonction pour capturer l'image et effectuer l'OCR
document.getElementById("captureButton").addEventListener("click", () => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Utiliser Tesseract pour effectuer l'OCR sur l'image capturée
    Tesseract.recognize(
        canvas,
        'ita', // Spécifier la langue italienne pour l'OCR
        {
            logger: m => console.log(m)
        }
    ).then(({ data: { text } }) => {
        recognizedText.value = text;
    });
});

// Fonction pour lire le texte détecté
document.getElementById("speakButton").addEventListener("click", () => {
    const text = recognizedText.value;
    if (text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'it-IT';
        speechSynthesis.speak(utterance);
    } else {
        alert("Aucun texte détecté.");
    }
});

// Fonction pour traduire le texte avec LibreTranslate
async function translateText(text, targetLang) {
    try {
        const response = await fetch('https://libretranslate.de/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                q: text,
                source: "it",
                target: targetLang,
                format: "text"
            })
        });
        const data = await response.json();
        return data.translatedText;
    } catch (error) {
        console.error("Erreur de traduction :", error);
        return "Erreur lors de la traduction.";
    }
}

// Gestion du bouton de traduction
document.getElementById("translateLanguage").addEventListener("change", async () => {
    const text = recognizedText.value;
    const targetLang = document.getElementById("translateLanguage").value;
    if (text) {
        const translated = await translateText(text, targetLang);
        translatedText.value = translated;
    }
});
