module.exports = (client) => {
    const statuses = [
        {
          name: 'Getoto',
          type: "STREAMING",
        },
        {
          name: 'Getoto',
          type: "PLAYING",
        },
        {
          name: 'Getoto',
          type: "WATCHING",
        },
        {
          name: 'Getoto',
          type: "LISTENING",
        },
    ];    
    setInterval(() => {
        let random = Math.floor(Math.random() * statuses.length);
        client.user.setActivity(statuses[random]);
      }, 10000);
}