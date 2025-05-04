const express = require("express");
const { ensureAuthenticated } = require("../auth/auth");
const router = express.Router();
const jsonfile = require("jsonfile");
const themes = "../src/configs/theme.json";
const discord = require("../bot");
const db = require("../database/db");

router.get("/members", ensureAuthenticated, async (req, res, next) => {
  try {
    const client = discord.getClient();
    const guild_id = req.query.guildId;
    const theme = jsonfile.readFileSync(themes);
    const page = parseInt(req.query.page) || 1;
    const limit = 25;
    const offset = (page - 1) * limit;

    var baseQuery = `SELECT * FROM members WHERE guild_id = ${guild_id}`;
    var countQuery = `SELECT COUNT(*) as count FROM members WHERE guild_id = ${guild_id}`;
    const params = [];

    baseQuery += " ORDER BY joined_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    if (!guild_id) {
      throw new Error("Guild id is required");
    }

    const [results] = await db.query(baseQuery, [], function(err, result, next) {
      if(err) {
        console.error("❌ DB error:", err.message);
        err.status = 500;
        return next(err);
      }
      return result;
    });
    const [[{ count }]] = await db.query(countQuery, [], function(err, result, next) {
      if(err) {
        console.error("❌ DB error:", err.message);
        err.status = 500;
        return next(err);
      }
      return result;
  });

    const totalPages = Math.ceil(count / limit);
    const joined_at = new Date(results[0].joined_at);

    res.render("home/members", {
      members: results,
      profile: req.user,
      client: client,
      theme: theme,
      currentPage: page,
      totalPages,
      joinedat: joined_at,
      guildId: guild_id,
    });
  } catch (error) {
    console.error("❌ Route error:", error.message);
    error.status = 500;
    next(error);
  }
});

module.exports = router;