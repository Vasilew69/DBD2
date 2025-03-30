const { DefaultExtractors } = require("@discord-player/extractor");
const { Player, GuildQueueEvent } = require("discord-player");
const { YoutubeiExtractor } = require("discord-player-youtubei");

module.exports = (client) => {
    const player = new Player(client)

    player.extractors.loadMulti(DefaultExtractors)
	player.extractors.register(YoutubeiExtractor, {})
    player.events.on('playerStart', (queue, track) => {
		// Emitted when the player starts to play a song
		const { channel } = queue.metadata;
		channel.send(`Started playing: **${track.title}**`);
	  });
	   
	  player.events.on('audioTrackAdd', (queue, track) => {
		// Emitted when the player adds a single song to its queue
		const { channel } = queue.metadata;
		channel.send(`Track **${track.title}** queued`);
	  });
	   
	  player.events.on('audioTracksAdd', (queue, track) => {
		// Emitted when the player adds multiple songs to its queue
		const { channel } = queue.metadata;
		channel.send(`Multiple Track's queued`);
	  });
	   
	  player.events.on('playerSkip', (queue, track) => {
		// Emitted when the audio player fails to load the stream for a song
		const { channel } =  queue.metadata;
		channel.send(`Skipping **${track.title}** due to an issue!`);
	  });
	   
	  player.events.on('disconnect', (queue) => {
		// Emitted when the bot leaves the voice channel
		const { channel } = queue.metadata;
		channel.send('Looks like my job here is done, leaving now!');
	  });
	  player.events.on('emptyChannel', (queue) => {
		// Emitted when the voice channel has been empty for the set threshold
		// Bot will automatically leave the voice channel with this event
		const { channel } = queue.metadata;
		channel.send(`Leaving because no vc activity for the past 5 minutes`);
	  });
	  player.events.on('emptyQueue', (queue) => {
		// Emitted when the player queue has finished
		const { channel } = queue.metadata;
		channel.send('Queue finished!');
	  });
	  player.events.on(GuildQueueEvent.PlayerStart, async (queue, track) => {
		// Get the metadata stored on the queue
		const { channel } = queue.metadata;
		// Send a message to the channel
		await channel.send(`Now playing: ${track.title}`);
	  });
	   
	  // Handle the event when a track finishes playing
	  player.events.on(GuildQueueEvent.PlayerFinish, async (queue, track) => {
		// Get the metadata stored on the queue
		const { channel } = queue.metadata;
		// Send a message to the channel
		await channel.send(`Finished playing ${track.title}`);
	  });
}