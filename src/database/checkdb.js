const dotenv = require("dotenv");
const db = require("./db");
dotenv.config({ path: "./configs/.env" });

async function checkAndCreateDB() {
  const [databases] = await db.query("SHOW DATABASES");
  const dbExists = databases.some((db) => db.Database === process.env.database);

  if (!dbExists) {
    console.log(`🔄 Database ${process.env.database} does not exist, creating...`);
    await connection.query(`CREATE DATABASE \`${process.env.database}\``);
    console.log(`✅ Database ${process.env.database} created.`);
  } else {
    console.log(`✅ Database ${process.env.database} already exists.`);
  }

  const [tables] = await db.query("SHOW TABLES");
  const audit_logtableExists = tables.some(
    (table) => table["Tables_in_" + process.env.database] === "audit_logs"
  );
  if (!audit_logtableExists) {
    console.log(`🔄 Table audit_logs does not exist, creating...`);
    await db.query(`CREATE TABLE ${process.env.database}.audit_logs (
            id int(11) NOT NULL AUTO_INCREMENT,
            guild_id varchar(20) DEFAULT NULL,
            user_id varchar(20) DEFAULT NULL,
            action_type varchar(50) DEFAULT NULL,
            content text DEFAULT NULL,
            arget_id varchar(20) DEFAULT NULL,
            timestamp datetime DEFAULT current_timestamp(),
            AuditInDiscordEnabled int(11) DEFAULT NULL,
            PRIMARY KEY (id)
        )ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 ;`);
  }

  const automod_configtableExists = tables.some(
    (table) => table["Tables_in_" + process.env.database] === "automod_config"
  );
  if (!automod_configtableExists) {
    console.log(`🔄 Table automod_config does not exist, creating...`);
    await db.query(`CREATE TABLE ${process.env.database}.automod_config (
            guild_id varchar(30) NOT NULL,
            excluded_roles text DEFAULT NULL,
            log_channel_id varchar(30) DEFAULT NULL,
            delete_invites tinyint(1) DEFAULT 1,
            delete_ips tinyint(1) DEFAULT 1,
            spam_limit int(11) DEFAULT 5,
            spam_interval int(11) DEFAULT 5000,
            action_on_trigger enum('warn','mute','ban','none') DEFAULT 'warn',
            badWords tinyint(1) DEFAULT NULL,
            antiSpam tinyint(1) DEFAULT NULL,
            excessiveMentions tinyint(1) DEFAULT NULL,
            autoModEnabled tinyint(4) DEFAULT NULL,
            customWords varchar(255) DEFAULT NULL,
            PRIMARY KEY (guild_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ;`);
  }

  const guildTableExists = tables.some(
    (table) => table["Tables_in_" + process.env.database] === "guilds"
  );
  if (!guildTableExists) {
    console.log(`🔄 Table guilds does not exist, creating...`);
    await db.query(`CREATE TABLE ${process.env.database}.guilds (
            id varchar(30) NOT NULL,
            name varchar(100) DEFAULT NULL,
            icon varchar(255) DEFAULT NULL,
            joined_at datetime DEFAULT NULL,
            ownerId varchar(255) DEFAULT NULL,
            bybot varchar(100) DEFAULT NULL,
            created_at datetime DEFAULT NULL,
            membercount int(11) DEFAULT NULL,
            welcomeChannel varchar(255) DEFAULT NULL,
            leaveChannel varchar(255) DEFAULT NULL,
            welcomeRole varchar(255) DEFAULT NULL,
            welcomeMessage text DEFAULT NULL,
            leaveMessage text DEFAULT NULL,
            welcomeEnabled tinyint(1) DEFAULT 0,
            PRIMARY KEY (id)
            )ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ;`);
  }

  const logsTableExists = tables.some(
    (table) => table["Tables_in_" + process.env.database] === "logs"
  );
  if (!logsTableExists) {
    console.log(`🔄 Table logs does not exist, creating...`);
    await db.query(`CREATE TABLE ${process.env.database}.logs (
            id int(11) NOT NULL AUTO_INCREMENT,
            userId varchar(50) DEFAULT NULL,
            username varchar(100) DEFAULT NULL,
            content text DEFAULT NULL,
            type enum('message','command') DEFAULT NULL,
            timestamp datetime DEFAULT current_timestamp(),
            guildname text DEFAULT NULL,
            guildid varchar(30) DEFAULT NULL,
            channelId varchar(50) DEFAULT NULL,
            PRIMARY KEY (id)
            )ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ;`);
  }

  const membersTableExists = tables.some(
    (table) => table["Tables_in_" + process.env.database] === "members"
  );
  if (!membersTableExists) {
    console.log(`🔄 Table members does not exist, creating...`);
    await db.query(`CREATE TABLE ${process.env.database}.members (
            id varchar(30) NOT NULL,
            guild_id varchar(30) NOT NULL,
            username varchar(100) DEFAULT NULL,
            discriminator varchar(10) DEFAULT NULL,
            avatar varchar(255) DEFAULT NULL,
            joined_at datetime DEFAULT NULL,
            guildname varchar(255) DEFAULT NULL,
            PRIMARY KEY (id, guild_id),
            KEY guild_id (guild_id),
            CONSTRAINT members_ibfk_1 FOREIGN KEY (guild_id) REFERENCES guilds (id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ;`);
  }

  const reactionRolesTableExists = tables.some(
    (table) => table["Tables_in_" + process.env.database] === "reaction_roles"
  );
  if (!reactionRolesTableExists) {
    console.log(`🔄 Table reaction_roles does not exist, creating...`);
    await db.query(`CREATE TABLE ${process.env.database}.reaction_roles (
            id int(11) NOT NULL AUTO_INCREMENT,
            guild_id varchar(255) DEFAULT NULL,
            channel_id varchar(255) DEFAULT NULL,
            message_id varchar(255) DEFAULT NULL,
            emoji varchar(255) DEFAULT NULL,
            role_id varchar(255) DEFAULT NULL,
            reactionEnabled tinyint(4) DEFAULT NULL,
            message varchar(255) DEFAULT NULL,
            PRIMARY KEY (id)
            )ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 ;`);
  }

  const activityTableExists = tables.some(
    (table) => table["Tables_in_" + process.env.database] === "activity"
  );
  if (!activityTableExists) {
    console.log(`🔄 table activity does not exist, creating...`);
    await db.query(`CREATE TABLE IF NOT EXISTS  ${process.env.database}.activity (
            client_id varchar(255) DEFAULT NULL,
            type enum('STREAMING','PLAYING','WATCHING','LISTENING') DEFAULT NULL,
            name text DEFAULT NULL,
            enabled int(2) DEFAULT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ;`);
  }

  const sendMessageTableExists = tables.some(
    (table) => table["Tables_in_" + process.env.database] === "sendMessage"
  );
  if (!sendMessageTableExists) {
    console.log(`🔄 table sendMessage does not exist, creating...`);
    await db.query(`CREATE TABLE IF NOT EXISTS ${process.env.database}.sendMessage (
  id int(11) NOT NULL AUTO_INCREMENT,
  guild_id varchar(255) NOT NULL,
  channel_id varchar(255) NOT NULL,
  message text NOT NULL,
  client_id varchar(255) NOT NULL,
  isEmbed tinyint(1) DEFAULT 0,
  embed_title varchar(256) DEFAULT NULL,
  embed_description text DEFAULT NULL,
  embed_color varchar(10) DEFAULT NULL,
  embed_footer varchar(256) DEFAULT NULL,
  embed_author varchar(256) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY guild_id (guild_id,channel_id)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 ;`);
  }

const levelsDataTableExists = tables.some(
    (table) => table["Tables_in_" + process.env.database] === "levels_data"
  );
  if (!levelsDataTableExists) {
    console.log(`🔄 table levels_data does not exist, creating...`);
    await db.query(`CREATE TABLE IF NOT EXISTS levels_data (
  user_id varchar(255) NOT NULL,
  username varchar(255) DEFAULT NULL,
  guild_id varchar(255) NOT NULL,
  xp int(11) NOT NULL DEFAULT 0,
  level int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id,guild_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ;`);
  }

  const levesSettingsTableExists = tables.some(
    (table) => table["Tables_in_" + process.env.database] === "levels_settings"
  );
  if (!levesSettingsTableExists) {
    console.log(`🔄 table levels_settings does not exist, creating...`);
    await db.query(`CREATE TABLE IF NOT EXISTS levels_settings (
  guild_id varchar(255) NOT NULL,
  level_system_enabled tinyint(4) DEFAULT 1,
  xp_per_message int(11) DEFAULT 10,
  level_up_channel varchar(255) DEFAULT NULL,
  custom_level_message text DEFAULT NULL,
  PRIMARY KEY (guild_id) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ;`)
  }

  const levelRolesTableExists = tables.some(
    (table) => table["Tables_in_" + process.env.database] === "level_roles"
  );
  if(!levelRolesTableExists) {
    console.log(`🔄 table level_roles does not exist, creating...`);
    await db.query(`CREATE TABLE level_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guild_id VARCHAR(32) NOT NULL,
    level INT NOT NULL,
    role_id VARCHAR(32) NOT NULL
);`)
  }
}

module.exports = checkAndCreateDB;
