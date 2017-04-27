const path = require('path')
const projectRoot = path.resolve(__dirname, '../')

const webpackConfig = {
  devtool: 'cheap-module-eval-source-map',

  resolve: {
    alias: {
      'src': path.resolve(__dirname, '../src'),
      'vue$': 'vue/dist/vue.common.js'
    }
  },

  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        include: projectRoot,
        exclude: /node_modules/
      }
    ]
  },

  performance: {
    hints: false
  }
}

module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],

    frameworks: ['mocha', 'sinon-chai', 'jquery-chai'],

    files: ['./index.js'],

    reporters: ['spec', 'coverage'],

    coverageReporter: {
      reporters: [
        { type: 'lcov', dir: '../coverage', subdir: '.' },
        { type: 'text-summary', dir: '../coverage', subdir: '.' },
        { type: 'json', dir: '../coverage', subdir: '.' }
      ]
    },

    preprocessors: {
      './index.js': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig,

    webpackMiddleware: {
      noInfo: true
    }
  })
}
