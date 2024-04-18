let recognition; // Declare recognition globally
let transcript = '';
let rms;
let sentencesTranscript = [];
let numSentence = 0;
let lastBolded;
let toBeBold= [];
let numOfBold = 0;
let addIntoDictionary = false;
let boldDictionary = {};

class TextSetup {
    constructor() {
        this.findLastWord = function(sentence) {
            const words = sentence.split(" ");

            const lastWord = words[words.length - 1];

            return lastWord;
        };

        this.boldThisWord = function() {
            if (rms > 129) { 
                if (sentencesTranscript.length > 0) {
                    let bolded = this.findLastWord(sentencesTranscript[numSentence - 1]);
                    if (lastBolded !== bolded) {
                        toBeBold[numOfBold] = bolded;
                        lastBolded = bolded;
                        addIntoDictionary = true;
                        console.log("Word to be bolded: " + bolded);
                    }
                }
            }
        };

        this.updateDictionary = function(word) {
            if (!boldDictionary[word]) {
                boldDictionary[word] = [];
            }
            
            boldDictionary[word].push(transcript);

            console.log("All entries for" + word);

            boldDictionary[word].forEach(description => {
                console.log("- " + description);
            });
        };

        this.printSentences = function() {
            const outputDiv = document.getElementById('output');
            let htmlContent = "";

            // get an array of keys words from boldDictionary
            const keys = Object.keys(boldDictionary);

            for (let i = 0; i < keys.length; i++) {
                const word = keys[i];
                const descriptions = boldDictionary[word]; 

                console.log("Current word:", typeof word);

                let a;
                if (word === "undefined") {
                    console.log("hi")
                    a = "other entries";
                } else {
                    a = word;
                    console.log("bye")
                }

                htmlContent += "<u>" + a + "</u>" + "<br>";

                for (let j = 0; j < descriptions.length; j++) {
                    const description = descriptions[j];

                    const descriptionWords = description.split(" ");


                    for (let k = 0; k < descriptionWords.length; k++) {
                        const currentWord = descriptionWords[k];

                        if (currentWord === word) {
                            // if matched add bold tags
                            htmlContent += "<b>" + currentWord + "</b> ";
                        } else {
                            // if not, leave as is
                            htmlContent += currentWord + " ";
                        }
                    }
                    htmlContent += "<br>" + "<br>";
                }
            }

            outputDiv.innerHTML = htmlContent;
        };
    }
}

// Usage
const textSetup = new TextSetup();



function setup() {
    let canvas = createCanvas(1000,200);
    canvas.parent('p5Canvas');
}

function draw() {
    fill('white');
    stroke(0, 0, 255); // Blue color
    strokeWeight(5);
    rect(0, 0, width, height);
    strokeWeight(1);

    if (rms > 129){
        fill('green');
        textSize(50);
        textSetup.boldThisWord();
    }
    else if (rms > 128){
        fill('blue');
        textSize(30);
    }
    else {
        fill('blue');
        textSize(15);
    }

    text(transcript, 20, 40, width, height);
}

click_to_record.addEventListener('click', function () {
    var speech = true;
    startAudioProcessing()
    window.SpeechRecognition = window.webkitSpeechRecognition;

    recognition = new SpeechRecognition();
    recognition.interimResults = true;

    recognition.addEventListener('result', e => {
        transcript = Array.from(e.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
        sentencesTranscript[numSentence] = transcript;
        numSentence++;
        textSetup.printSentences();
    });

    if (speech) {
        recognition.start();
    }

    if (addIntoDictionary === true){
        textSetup.updateDictionary(toBeBold[numOfBold]);
        numOfBold++;
    }
});

// /// had help from stack overflow for this - https://stackoverflow.com/questions/22104036/exporting-intensity-of-audio-in-web-audio-api
function startAudioProcessing() {
    var ac = new AudioContext();
    var an = ac.createAnalyser();
    var source = "";
    var buffer = new Uint8Array(an.fftSize);
    var scriptProcessorNode = ac.createScriptProcessor(16384, 1, 1);
    if (!navigator.getUserMedia)
        navigator.getUserMedia = navigator.getUserMedia || 
            navigator.webkitGetUserMedia || navigator.mozGetUserMedia || 
            navigator.msGetUserMedia;
    if (navigator.getUserMedia) {
        navigator.getUserMedia(
            { audio: true },
            function(stream) {
                source = ac.createMediaStreamSource(stream);
                source.connect(an);
                requestAnimationFrame(f);
            },
            function(e) {
                alert('Error capturing audio.');
            }
        );
    }

    function f() {
        an.getByteTimeDomainData(buffer);
        rms = 0;
        for (var i = 0; i < buffer.length; i++)
            rms += buffer[i] * buffer[i];
        rms /= buffer.length;
        rms = Math.sqrt(rms);
        requestAnimationFrame(f);
    }
};
