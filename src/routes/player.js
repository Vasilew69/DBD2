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
const limiter = require('../index');

// Initialize the client.player
client.player = new Player(client, {
    ytdlOptions: {
        quality: 'highestaudio',
        highWaterMark: 1 << 25
    }
});
client.player.extractors.loadMulti(DefaultExtractors)
client.player.extractors.register(YoutubeiExtractor, {})
router.get('/player', ensureAuthenticated, async (req, res, next) => {
    try {
        const guildId = req.query.guildId;
        const theme = jsonfile.readFileSync(themes);

        if (!guildId) {
            throw new Error("Missing guildId");
        }

        if (!client.player) {
            throw new Error("Player is not initialized");
        }

        const queue = client.player.nodes.get(guildId);

        if (!queue) {
            throw new Error("No music queue found");
        }

        const currentTrack = queue.currentTrack;
        if (!currentTrack) {
            throw new Error("No music playing");
        }

        const queuedata = queue.tracks.toArray();
        const queuemap = queuedata.map((track, index) => ({
            index: index + 1,
            title: track.title,
            author: track.author,
            thumbnail: track.thumbnail
        }));

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
        console.error("❌ Route error:", error.message);
        error.status = 500;
        next(error); // Forward to your global 500 handler
    }
});

router.post('/player/pause', ensureAuthenticated, async (req, res) => {
    try {
    const guildId = req.body.guildId;

    if (!guildId) {
        throw new Error("Missing guildId");
    }

    const queue = client.player.nodes.get(guildId);

    if (!queue) {
        throw new Error("No queue found for this guild");
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
    } catch (error) {
        console.error("❌ Route error:", error.message);
        error.status = 500;
        next(error); // Forward to your global 500 handler
    }
});

router.post('/player/play', ensureAuthenticated, async (req, res) => {
    try {
    const guildId = req.body.guildId;

    if (!guildId) {
        throw new Error('Missing guildId');
    }

    const queue = client.player.nodes.get(guildId);

    if (!queue) {
        throw new Error('No queue found for this guild');
    }

    // This is safe now – useTimeline gets the correct context from the queue
    const timeline = useTimeline({ node: queue });

    const wasPaused = timeline.paused;
    if (wasPaused) {
        timeline.resume();
    } else {
        throw new Error('the queue wasnt paused')
    }

    return res.status(200).json({ status: wasPaused ? 'resumed' : 'paused' });
} catch (error) {
    console.error("❌ Route error:", error.message);
    error.status = 500;
    next(error); // Forward to your global 500 handler
}
});

router.post('/player/skip', ensureAuthenticated, (req, res) => {
    try {
    const guildId = req.body.guildId;
    const queue = client.player.nodes.get(guildId);
    if(!queue) {
        throw new Error('No queue runnig')
    }
    const Queue = useQueue(queue)

    Queue.node.skip()
    return res.status(200).redirect('/player')
} catch (error) {
    console.error("❌ Route error:", error.message);
    error.status = 500;
    next(error); // Forward to your global 500 handler
}
})

router.post('/player/play-selected', ensureAuthenticated, async (req, res, next) => {
    try {
        const { guildId, index } = req.body;
        
        if (!guildId || index === undefined) {
            throw new Error('Missing guildId or index');
        }

        const queue = client.player.nodes.get(guildId);
        if (!queue) {
            throw new Error('No queue found for this guild');
        }

        const trackIndex = Number(index);
        if (isNaN(trackIndex)) {
            throw new Error('Index must be a number');
        }

        // Get all tracks as an array
        const tracks = queue.tracks.toArray();
        
        if (trackIndex < 0 || trackIndex >= tracks.length) {
            throw new Error('Invalid track index');
        }

        // Remove tracks before the selected index using node.remove()
        for (let i = 0; i < trackIndex; i++) {
            queue.node.remove(tracks[i]);
        }

        // Skip to the now-first track (our selected track)
        queue.node.skip();

        // Get updated queue data
        const currentTrack = queue.currentTrack;
        const updatedQueue = queue.tracks.toArray().map((track, idx) => ({
            index: idx + 1,
            title: track.title,
            author: track.author,
            thumbnail: track.thumbnail
        }));

        res.status(200).json({ 
            success: true,
            nowPlaying: {
                title: currentTrack.title,
                author: currentTrack.author,
                thumbnail: currentTrack.thumbnail,
                duration: currentTrack.duration
            },
            queue: updatedQueue
        })

    } catch (error) {
        console.error("❌ Route error:", error.message);
        error.status = 500;
        next(error);
    }
});

module.exports = router;
