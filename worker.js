import { transform } from '@proskomma/hallomai';

self.onmessage = async function(e) {
    const { inputFileContent, step } = e.data;

    const startTime = performance.now();
    let result;
    if (step === 'usfmToUsx') {
        result = transform(inputFileContent, 'usfm', 'usx');
    } else if (step === 'usxToJson') {
        result = transform(inputFileContent, 'usx', 'json');
    } else if (step === 'jsonToUsfm') {
        result = transform(inputFileContent, 'json', 'usfm');
    }
    const endTime = performance.now();
    const conversionTime = endTime - startTime;

    self.postMessage({ step, result, conversionTime });
};
