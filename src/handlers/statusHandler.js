const db = require('../database/db');
const { ActivityType } = require('discord.js')

async function setStatus(client){
if (!client || !client.isReady()) return;
var query = "SELECT * FROM activity WHERE client_id = ?;"
const clientId = client.user.id;
const [results] =
await db.query(query, [clientId], function(err, result) {
  if(err) {
    console.log(err)
    return;
  }
  if(result.enabled == 0) return;
  return result;
})

const result = results?.[0];
const name = result.name || 'your status here';
const rawType = result.type?.trim().toUpperCase() || 'PLAYING';

const validTypes = {
  PLAYING: ActivityType.Playing,
  WATCHING: ActivityType.Watching,
  LISTENING: ActivityType.Listening,
  COMPETING: ActivityType.Competing,
  STREAMING: ActivityType.Streaming
};

const activityType = validTypes[rawType];

if (!activityType) {
  console.warn(`Invalid activity type "${result.type}". Defaulting to PLAYING.`);
  client.user.setActivity(name, { type: ActivityType.Playing });
} else {
  client.user.setActivity(name, { type: activityType });
}

console.log(`✅ Status set to: ${rawType} ${name}`);
}

module.exports = setStatus;
