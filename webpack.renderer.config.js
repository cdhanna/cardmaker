const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')


plugins.push(new MiniCssExtractPlugin({
  filename: 'css/mystyles.css'
}));

rules.push({
  test: /\.scss$/,
  use: [
      MiniCssExtractPlugin.loader,
      {
        loader: 'css-loader'
      },
      {
        loader: 'sass-loader',
        options: {
          sourceMap: true,
          // options...
        }
      }
    ]
});

module.exports = {
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css']
  },
};
