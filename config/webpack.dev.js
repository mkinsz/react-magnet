const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.base');
const fs = require('fs');
// const lessToJs = require('less-vars-to-js');

process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

// const theme = lessToJs(
// 	fs.readFileSync(path.join(__dirname, '../src/styles/theme.less'), 'utf8')
// );

module.exports = merge(common, {
	mode: 'development',
	devtool: 'eval-source-map',
	output: {
		filename: '[name].bundle.js',
		sourceMapFilename: '[name].bundle.map'
	},
	devServer: {
		// 设置生成的 Bundle 的前缀路径
		publicPath: '/',
		// assets 中资源文件默认应该还使用 assets
		contentBase: path.resolve(__dirname, '../public'),
		host: 'localhost',
		port: 8080,
		hot: true,
		open: false,
		https: false,
		compress: true,
		disableHostCheck: true,
		historyApiFallback: true,
		quiet: false,
	},
	module: {
		rules: [
			{
				test: /\.(css|less)$/,
				use: [
					{ loader: 'style-loader' },
					{ loader: 'css-loader' },
					{
						loader: 'less-loader',
						options: {
							// modifyVars: theme,
							javascriptEnabled: true
						}
					}
				]
			}
		]
	},
	resolve: {
		alias: {
			'react-dom': '@hot-loader/react-dom'
		}
	},
	plugins: [
		// 在控制台中输出可读的模块名
		new webpack.NamedModulesPlugin()
	]
});