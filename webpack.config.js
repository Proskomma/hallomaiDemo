const path = require('path');

module.exports = {
    entry: {
        worker: './worker.js',
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'development',
    experiments: {
        asyncWebAssembly: true,
    }
};
