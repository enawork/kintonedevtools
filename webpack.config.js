module.exports = {
  mode: 'development',
  entry: './src/main.js',
  devtool: 'inline-cheap-source-map',
  output: {
    path: __dirname + '/public',
    filename: 'main.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/react'
              ]
            }
          }
        ]
      }
    ]
  },
  target: ["web", "es6"],
  watch: true
};