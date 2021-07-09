const path = require('path');

module.exports = {
    mode: 'production',
    entry: './view/js/Client.js',
    output: {
        filename: 'Client.js',
        path: path.join(__dirname, 'view', 'dist'),
    },
    optimization: {
        minimize: true,
    },    
};