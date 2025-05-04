<h1 align="center">
    <br>
    <p>Discord BOT Dashboard - V2</p>
    
[![Github all releases](https://img.shields.io/github/downloads/Vasilew69/DBD2/total.svg?style=for-the-badge)](https://GitHub.com/Vasilew69/DBD2/releases/) [![GitHub release](https://img.shields.io/github/release/Vasilew69/DBD2.svg?style=for-the-badge)](https://GitHub.com/Vasilew69/DBD2/releases/) [![GitHub issues](https://img.shields.io/github/issues/Vasilew69/DBD2.svg?style=for-the-badge)](https://GitHub.com/Vasilew69/DBD2/issues/) [![DiscordServer](https://img.shields.io/discord/587842272167723028?label=Discord%20Server&logo=Discord&colorB=5865F2&style=for-the-badge&logoColor=white)](https://discord.com/invite/w7B5nKB) ![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/vasilew69/DBD2/runner.yml?branch=main&style=for-the-badge)




</h1>

# 📚 About
Discord bot

# Dashboard Preview:
<img src="./content/dashprev.JPG">

#### ⌚ Installing Requirements
Download the latest version from [Releases](https://github.com/Vasilew69/DBD2/releases), open up the root directory and run the following command.
```bash
npm install
```

#### 🖥️ Setting up BOT
Rename ``.env.default`` to ``.env`` and open up the file, this can be found found in the **configs** folder and input the required fields. 

You need to aquire the YTT Token using npx --no discord-player-youtubei command in the /src folder. For the
Google Oauth2.0 you need to create a new project in the [Google Developer Console](https://console.developers.google.com/).
After you have created the project, you need to create a new OAuth2.0 client in the [OAuth2.0](https://console.developers.google.com/apis/credentials) section. 
You can use the following information to configure your OAuth2.0 client:
- **Application type**: Web Application
- **Authorized redirect URIs**: `http://localhost:3000/auth/callback`.

For the Github OAuth2.0 you need to create a new application in the [GitHub Developer Settings](https://github.com/settings/developers). 
After you have created the application, you need to create a new OAuth2.0 client in the [OAuth2.0](https://github.com/settings/applications) section. 
Than you need to Generate a new OAuth2.0 client secret
```env
token=BOTToken
clientId=BOTClientID
API=STEAMAPI
KEY=STEAMKEY
FKEY=FACEIT DEV KEY
YTT= YTT
clientSecret=BotSecret
callbackURL=yourcallback url
Admin=AdminID
port=Port
prefix=/
host=DBHOST
user=DBUSER
password=DBPASS
database=DBASE
googleClientId=Google Client ID
googleSecret=Google Client Secret
googleCallbackURL=Google Callback URL
githubClientId=GitHub Client ID
githubSecret=GitHub Client Secret
githubCallbackURL=GitHub Callback URL
```
Make sure to enable both "Privileged Intents" on the [**Discord Developer Dashboard**](https://discord.com/developers). This is to fix errors  with "Kick / Ban" Commands!

#### 📡 Starting the application 
Open up the root directory and run the following command.
```bash
node index.js
```
You should now be able to access the dashboard at **http://localhost:3000**.

## 🧰 Features
A list of some of the features that are included in Discord BOT Dashboard V2
* 🔐 **Authentication** - Discord BOT Dashboard is locked with a secure authentication method that only allows users who are added into the config file to access the dashboard.
* 🔒 **Security** - Discord BOT Dashboard ensures that your application is secure.
* 💎 **Modern UI** - Discord BOT Dashboard is built with a modern UI to ensure its ease of use for anyone.
* 🖥️ **Open Source** - Discord BOT Dashboard is an open source project meaning anyone can contribute to make it even better.
* 🔌 **Stability** - Running your application using Discord BOT Dashboard ensures that it is stable and you wont have any errors.
* ⏲️ **24/7 Uptime** - Running you application using Discord BOT Dashboard allows you to have 24/7 uptime.
* ⛏️ **Multiple Tools** - Discord BOT Dashboard is packed with multiple tools that are easy to use.
* 🔌 **Plugins** - Develop and share plugins that can be imported into your project.

## 💡 Contribute
If you would like to contribute to the project please open a PR (Pull Request) clearly showing your changes.

## 🔒 Requirements
* [Node.JS](https://nodejs.org/en/) (v12.3.1 or later)

## 📞 Issues
If you have any issues feel free to open an issue

</br>
