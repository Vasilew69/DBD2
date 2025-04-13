const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../auth/auth');
const { client } = require('../bot');
const jsonfile = require('jsonfile');
const themes = "../src/configs/theme.json";
const { useQueue } = require("discord-player");
const { Player, useTimeline } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');
const { YoutubeiExtractor } = require('discord-player-youtubei');

// Initialize the client.player
client.player = new Player(client, {
    ytdlOptions: {
        quality: 'highestaudio',
        highWaterMark: 1 << 25
    }
});
client.player.extractors.loadMulti(DefaultExtractors)
client.player.extractors.register(YoutubeiExtractor, {})
router.get('/player', ensureAuthenticated, async (req, res) => {
    const guildId = req.query.guildId; // Get guildId from query

    if (!guildId) {
        console.error("❌ Missing guildId parameter");
        const theme = jsonfile.readFileSync(themes);
        return res.status(500).render('home/playererror', {
            profile: req.user,
            client: client,
            theme: theme,
            error: 'Missing guildId'
        });
    }
    if (!client.player) {
        console.error("❌ Player is not initialized");
        const theme = jsonfile.readFileSync(themes);
        return res.status(500).render('home/playererror', {
            profile: req.user,
            client: client,
            theme: theme,
            error: 'Player is not initialized'
        });
    }

    // Ensure the queue exists
    const queue = client.player.nodes.get(guildId);

    if (!queue) {
        const theme = jsonfile.readFileSync(themes);
        console.error("❌ No music queue found");
        return res.status(500).render('home/playererror',{
            profile: req.user,
            client: client,
            theme: theme,
            error: 'No music queue found'
        });
    }
    const queuedata = queue.tracks.toArray();
    const queuemap = queuedata.map((track, index) => ({
        index: index + 1,
        title: track.title,
        author: track.author,
        thumbnail: track.thumbnail
    }));

    // Check if there is a current track in the queue
    const currentTrack = queue.currentTrack;
    if (!currentTrack) {
        const theme = jsonfile.readFileSync(themes);
        console.error("❌ No music playing");
        return res.status(500).render('home/playererror',{
            profile: req.user,
            client: client,
            theme: theme,
            error: 'No music playing'
        });
    }

    try {
        const theme = jsonfile.readFileSync(themes);
        res.render('home/player', {
            profile: req.user,
            client: client,
            theme: theme,
            status: 'Playing',
            track: currentTrack.title,
            artist: currentTrack.author,
            thumbnail: currentTrack.thumbnail,
            duration: currentTrack.duration,
            guildId: guildId,
            queue: queuemap
        });
    } catch (error) {
        console.error("❌ Error reading theme file:", error);
        return res.status(500).json({ error: 'Failed to load theme file' });
    }
});
router.post('/player/pause', ensureAuthenticated, async (req, res) => {
    const guildId = req.body.guildId;

    if (!guildId) {
        return res.status(400).json({ error: 'Missing guildId' });
    }

    const queue = client.player.nodes.get(guildId);

    if (!queue) {
        return res.status(400).json({ error: 'No queue found for this guild' });
    }

    // This is safe now – useTimeline gets the correct context from the queue
    const timeline = useTimeline({ node: queue });

    const wasPaused = timeline.paused;
    if (wasPaused) {
        timeline.resume();
    } else {
        timeline.pause();
    }

    return res.status(200).json({ status: wasPaused ? 'resumed' : 'paused' });
});

router.post('/player/play', ensureAuthenticated, async (req, res) => {
    const guildId = req.body.guildId;

    if (!guildId) {
        return res.status(400).json({ error: 'Missing guildId' });
    }

    const queue = client.player.nodes.get(guildId);

    if (!queue) {
        return res.status(400).json({ error: 'No queue found for this guild' });
    }

    // This is safe now – useTimeline gets the correct context from the queue
    const timeline = useTimeline({ node: queue });

    const wasPaused = timeline.paused;
    if (wasPaused) {
        timeline.resume();
    } else {
        return res.status(400).json({ error: 'the queue wasnt paused'})
    }

    return res.status(200).json({ status: wasPaused ? 'resumed' : 'paused' });
});

router.post('/player/skip', ensureAuthenticated, (req, res) => {
    const guildId = req.body.guildId;
    const queue = client.player.nodes.get(guildId);
    if(!queue) {
        return res.status(400).json({ error: 'No queue runnig'})
    }
    const Queue = useQueue(queue)

    Queue.node.skip()
    return res.status(200).json({ error: 'Done!'})
})

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Logged out');
    res.redirect('/login');
  });

module.exports = router;
