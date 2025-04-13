module.exports = (client) => {
  const { ActivityType } = require('discord.js');
    const statuses = [
        {
          name: 'Getoto',
          type: ActivityType.Streaming,
        },
        {
          name: 'Getoto',
          type: ActivityType.Playing,
        },
        {
          name: 'Getoto',
          type: ActivityType.Watching,
        },
        {
          name: 'Getoto',
          type: ActivityType.Listening,
        },
    ];    
    setInterval(() => {
        let random = Math.floor(Math.random() * statuses.length);
        client.user.setActivity(statuses[random]);
      }, 10000);
}