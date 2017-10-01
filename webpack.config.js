const webpack = require('webpack');
const path = require('path');

//const PROD = process.argv.indexOf('-p') !== -1;

module.exports = [{
	context: __dirname,
	entry: {
		index: ['babel-polyfill', './src/index.js']
	},
	output: {
		filename: './build/[name].js',
		chunkFilename: './build/[id].js',
		sourceMapFilename : '[file].map',
        //publicPath: PROD ? '/piano' : '/local/piano',
	},
	resolve : {
		modules : ['node_modules']
    },
	module: {
		rules: [
			{
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
				}
			}
		]
	},
	devtool : 'source-map',
}];
