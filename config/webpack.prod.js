const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.base');

// const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const fs = require('fs');
// const lessToJs = require('less-vars-to-js');

// const theme = lessToJs(
// 	fs.readFileSync(path.join(__dirname, '../src/styles/theme.less'), 'utf8')
// );

process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

module.exports = merge(common, {
	mode: 'production',
	devtool: false,
	output: {
		filename: '[name].bundle.js',
		chunkFilename: '[name].chunk.js'
	},
	module: {
		rules: [
			{
				test: /\.(css|less)$/,
				exclude: /antdTheme/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							esModule: true
						}
					},
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
	optimization: {
		runtimeChunk: 'single',
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					parallel: true, // 开启多进程压缩
					cache: true, // 开启缓存(压缩过的不压缩)
					output: {
						comments: false
					}
				}
			}),
			new OptimizeCSSAssetsPlugin({
				cssProcessor: require('cssnano'),
				cssProcessorOptions: {
					discardComments: { removeAll: true }
				}
			})
		],
		splitChunks: {
			chunks: 'all',
		}
	},
	plugins: [
		new CleanWebpackPlugin(),
		new MiniCssExtractPlugin({
			filename: '[name].css',
			chunkFilename: '[id].css'
		}),
	]
});
