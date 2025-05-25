const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const chalk = require('chalk');
const nodeExternals = require('webpack-node-externals');
const { execSync } = require('child_process');

function getGitCommitHashShort() {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch (error) {
    console.error('Error getting Git commit hash:', error);
    return 'UNKNOWN';
  }
}

function getGitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  } catch (error) {
    console.error('Error getting Git branch:', error);
    return 'UNKNOWN';
  }
}

const commitHashShort = getGitCommitHashShort();
const currentBranch = getGitBranch();

// Function to update a version.json file
function updateVersionFile(filePath, isBot = false) {
  try {
    const versionData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (currentBranch === 'dev' && commitHashShort !== 'UNKNOWN') {
      versionData.ver = commitHashShort;
    }
    fs.writeFileSync(filePath, JSON.stringify(versionData, null, 2), 'utf8');
    console.log(chalk.green(`[Webpack] Updated version in ${filePath} to: ${versionData.ver}`));
  } catch (error) {
    console.error(chalk.red(`[Webpack] Error updating version file: ${error.message}`));
  }
}

module.exports = [
  // Configuration for the Express server
  {
    target: 'node',
    mode: 'development',
    entry: './index.js',
    output: {
      filename: 'server.dev.js',
      path: path.resolve(__dirname, '../build/dev'),
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
      ],
    },
    externals: [nodeExternals()],
    plugins: [
      new webpack.DefinePlugin({
        'process.env.GIT_COMMIT_HASH': JSON.stringify(commitHashShort),
        'process.env.GIT_BRANCH': JSON.stringify(currentBranch),
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
      {
        apply: (compiler) => {
          compiler.hooks.done.tap('UpdateServerVersionFileDev', (stats) => {
            if (!stats.hasErrors()) {
              updateVersionFile(path.resolve(__dirname, '../configs/version.json'));
            }
          });
        },
      },
    ],
    name: 'server-dev',
  },
  // Configuration for the Discord bot
  {
    target: 'node',
    mode: 'development',
    entry: './bot.js',
    output: {
      filename: 'bot.dev.js',
      path: path.resolve(__dirname, '../build/dev'),
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
      ],
    },
    externals: [nodeExternals()],
    plugins: [
      new webpack.DefinePlugin({
        'process.env.GIT_COMMIT_HASH': JSON.stringify(commitHashShort),
        'process.env.GIT_BRANCH': JSON.stringify(currentBranch),
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
      {
        apply: (compiler) => {
          compiler.hooks.done.tap('UpdateBotVersionFileDev', (stats) => {
            if (!stats.hasErrors()) {
              updateVersionFile(path.resolve(__dirname, './configs/version.json'), true);
            }
          });
        },
      },
    ],
    name: 'bot-dev',
  },
  // Production configurations would be similar
];