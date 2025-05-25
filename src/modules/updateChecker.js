const request = require('request');
const chalk = require('chalk');
const semver = require('semver');
const localVersion = require('../configs/version.json');

function checkForUpdates() {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            url: 'http://dbdbotss.ddns.net:3001//version', // Changed URL
            headers: {
                'User-Agent': 'Discord-Bot-Dashboard',
                useQueryString: true
            }
        };

        request(options, function (error, response, body) {
            let updateAvailable = false;
            let updateType = null;
            let latestVersion = null;
            const isBetaTester = semver.prerelease(localVersion.ver) !== null;
            let localSemver = null;
            if (localVersion.ver && semver.valid(localVersion.ver)) {
                localSemver = localVersion.ver;
            }

            try {
                const jsonparsed = JSON.parse(body);
                let remoteStableVersion = jsonparsed.latestStable;
                let remoteDevVersion = jsonparsed.latestDev;

                if (isBetaTester && remoteDevVersion) {
                    latestVersion = remoteDevVersion;
                    // For beta, we can just check if the remote dev hash is different
                    updateAvailable = remoteDevVersion !== (localVersion.devHash || localVersion.ver); // Assuming you might store dev hash locally
                    if (updateAvailable) {
                        updateType = 'dev'; // Or some other identifier
                    }
                } else if (remoteStableVersion && localSemver && semver.valid(remoteStableVersion)) {
                    latestVersion = remoteStableVersion;
                    if (semver.gt(remoteStableVersion, localSemver)) {
                        updateAvailable = true;
                        updateType = semver.diff(localSemver, remoteStableVersion);
                    }
                }

                if (updateAvailable) {
                    console.log(chalk.yellow(`⚠️  Update available (${updateType}): ${localVersion.ver} → ${latestVersion}`));
                    if (isBetaTester) {
                        console.log(chalk.blue(`ℹ️  You are running a pre-release version.`));
                    }
                } else {
                    console.log(chalk.green(`✅ You are using the latest version (${localVersion.ver}${isBetaTester ? ' (beta)' : ''}).`));
                }

                resolve({
                    Latestversion: latestVersion || localVersion.ver,
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