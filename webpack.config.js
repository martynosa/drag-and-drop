const path = require('path');
const CleanPlugin = require('clean-webpack-plugin'); // cleans dist folder before every rebuild

module.exports = {
  mode: 'production',
  entry: './src/app.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  // devtool: 'inline-source-map', // for production
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [new CleanPlugin.CleanWebpackPlugin()],
};
