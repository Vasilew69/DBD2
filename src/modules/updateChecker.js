const request = require('request');
const chalk = require('chalk');
const semver = require('semver');
const localVersion = require('../configs/version.json');

function checkForUpdates() {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      url: 'http://localhost:3001/version',
      headers: {
        'User-Agent': 'Discord-Bot-Dashboard',
        useQueryString: true
      }
    };

    request(options, function (error, response, body) {
      let updateAvailable = false;
      let updateType = null;
      let verL = null;
      const isBetaTester = semver.prerelease(localVersion.ver) !== null;

      try {
        const jsonparsed = JSON.parse(body);
        verL = jsonparsed.ver;

        if (semver.valid(verL) && semver.valid(localVersion.ver) && semver.gt(verL, localVersion.ver)) {
          updateAvailable = true;
          updateType = semver.diff(localVersion.ver, verL);
        }

        if (updateAvailable) {
          console.log(chalk.yellow(`⚠️  Update available (${updateType}): ${localVersion.ver} → ${verL}`));
          if (isBetaTester) {
            console.log(chalk.blue(`ℹ️  You are running a pre-release version.`));
          }
        } else {
          console.log(chalk.green(`✅ You are using the latest version (${localVersion.ver}).`));
        }

        resolve({
          Latestversion: verL,
          Currentversion: localVersion.ver,
          updateAvailable,
          updateType,
          isBetaTester
        });

      } catch (e) {
        console.log(chalk.red("Failed to check for updates. You may continue using this version."));
        resolve({
          Latestversion: localVersion.ver,
          Currentversion: localVersion.ver,
          updateAvailable: false,
          updateType: null,
          isBetaTester
        });
      }
    });
  });
}

module.exports = checkForUpdates;