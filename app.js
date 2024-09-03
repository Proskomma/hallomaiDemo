document.getElementById('fileInput').addEventListener('change', handleFileUpload);
document.getElementById('startBtn').addEventListener('click', startConversion);
document.querySelectorAll('.copy-button').forEach(button => {
    button.addEventListener('click', handleCopy);
});

let inputFileContent = '';
const worker = new Worker('dist/worker.bundle.js'); // Load the bundled Web Worker

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            inputFileContent = e.target.result;
            document.getElementById('startBtn').disabled = false;
        };
        reader.readAsText(file);
    }
}

function updateProgressBar(percentage) {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}%`;
}

function handleCopy(event) {
    const targetId = event.target.getAttribute('data-target');
    const content = document.getElementById(targetId).textContent;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(content)
            .then(() => alert(`Copied ${targetId} to clipboard!`))
            .catch(err => alert('Failed to copy text: ', err));
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            alert(`Copied ${targetId} to clipboard!`);
        } catch (err) {
            alert('Failed to copy text: ', err);
        }
        document.body.removeChild(textArea);
    }
}

async function startConversion() {
    document.body.classList.add('processing');
    updateProgressBar(0);

    let totalConversionTime = 0;

    // const startTime = performance.now();

    worker.onmessage = function(e) {
        const { step, result } = e.data;
        let conversionTime = 0;

        if (step === 'usfmToUsx') {
            conversionTime = e.data.conversionTime;
            totalConversionTime += conversionTime;
            document.getElementById('usxResult').textContent = result;
            document.getElementById('timeUsfmToUsx').textContent = `Time: ${conversionTime.toFixed(2)} ms`;
            simulateProgressBar(33, () => worker.postMessage({ inputFileContent: result, step: 'usxToJson' }));
        } else if (step === 'usxToJson') {
            conversionTime = e.data.conversionTime;
            totalConversionTime += conversionTime;
            document.getElementById('jsonResult').textContent = result;
            document.getElementById('timeUsxToJson').textContent = `Time: ${conversionTime.toFixed(2)} ms`;
            simulateProgressBar(66, () => worker.postMessage({ inputFileContent: result, step: 'jsonToUsfm' }));
        } else if (step === 'jsonToUsfm') {
            conversionTime = e.data.conversionTime;
            totalConversionTime += conversionTime;
            document.getElementById('usfmResult').textContent = result;
            document.getElementById('timeJsonToUsfm').textContent = `Time: ${conversionTime.toFixed(2)} ms`;
            simulateProgressBar(100, () => {
                document.getElementById('totalTime').textContent = `Total Conversion Time: ${totalConversionTime.toFixed(2)} ms`;
                document.body.classList.remove('processing');
            });
        }
    };

    // Start the first conversion
    worker.postMessage({ inputFileContent, step: 'usfmToUsx' });
}

function simulateProgressBar(targetPercentage, callback) {
    let currentPercentage = parseFloat(document.getElementById('progressBar').style.width) || 0;

    function update() {
        if (currentPercentage < targetPercentage) {
            currentPercentage += 1;
            updateProgressBar(currentPercentage);
            setTimeout(update, 10);
        } else {
            callback();
        }
    }

    update();
}
