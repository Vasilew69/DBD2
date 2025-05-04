const chalk = require("chalk");
const vers = require("../configs/version.json");
const client = require('../bot');
const figlet = require('figlet');
const lolcatjs = require('lolcatjs');
const dotenv = require('dotenv')
dotenv.config({ path: './configs/.env'})

module.exports = (client) => {

    // Создание баннера
    const banner = figlet.textSync('Discord BOT Dashboard V2', {
        font: 'Small',
        horizontalLayout: 'default',
        width: 1000,
        whitespaceBreak: true
    });
    lolcatjs.fromString(banner);

    // Логирование информации о запуске
    console.log(chalk.bold.green('Launched Successfully...'));
    console.log(chalk.magenta('Version:'), chalk.cyan(`${vers.ver}`));
    console.log(chalk.magenta('Made by:'), chalk.cyan('Vasilew'));
    console.log(chalk.magenta('Prefix:'), chalk.cyan(`${process.env['prefix']}\n`));

    // Проверка, что клиент и user определены
    if (client.user) {
        console.log(chalk.green(chalk.bold(`${client.user.username}`), `is online!`));
    } else {
        console.error(chalk.red('Error: Client user is undefined.'));
    }

    console.log(chalk.green(chalk.bold(`Dashboard:`), `http://localhost:` + process.env['port']));
    console.log(chalk.green(chalk.bold("✅ Commands saved with categories!")));
}