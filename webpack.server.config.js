const nodeExternals = require('webpack-node-externals');
const path = require('path');

module.exports = {
    mode: 'development',
    target: 'node', 
    externals: [nodeExternals()], 
    entry: { 
        server: ['./app.js'] 
    }, 
    output: { 
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, './build'), 
    }
}