const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const fontsOptions = {
	limit: 8192,
	mimetype: 'application/font-woff',
	name: 'fonts/[name].[ext]'
};

module.exports = {
	context: path.resolve(__dirname, '../'),
	resolve: {
		extensions: ['.js', '.jsx']
	},
	entry: {
		app: path.resolve(__dirname, '../src')
	},
	output: {
		path: path.resolve(__dirname, '../build')
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)?$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			},
			{
				test: /\.(png|jpg|gif)$/,
				use: [
					{
						loader: 'url-loader',
						options: {
							limit: 8192,
							name: 'images/[name].[ext]'
						}
					}
				]
			},
			{
				test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				use: [
					{
						loader: 'url-loader',
						options: fontsOptions
					}
				]
			},
			{
				test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				use: [
					{
						loader: 'file-loader',
						options: fontsOptions
					}
				]
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'Magnet',
			meta: {
				viewport:
					'width=device-width, initial-scale=1, shrink-to-fit=no'
			}
		})
	]
};
