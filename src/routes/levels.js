const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../auth/auth");
const db = require("../database/db");
const discord = require("../bot");
const themes = "./configs/theme.json";
const jsonfile = require("jsonfile");

router.get("/levels", ensureAuthenticated, async (req, res) => {
  const guildId = req.query.guildId;
  const [levels] = await db.query(
    "SELECT * FROM levels_data Where guild_id = ?",
    [guildId]
  );
  const client = await discord.getClient();
  const theme = await jsonfile.readFileSync(themes);
  var countQuery =
    "SELECT COUNT(*) as count FROM levels_data WHERE guild_id = ?";
  const params = [guildId];
  const page = parseInt(req.query.page) || 1;
  const limit = 25;
  const offset = (page - 1) * limit;

  params.push(limit, offset);
  const [[{ count }]] = await db.query(
    countQuery,
    [guildId],
    function (err, result, next) {
      if (err) {
        console.error("❌ Route error:", err.message);
        err.status = 500;
        next(err); // Forward to your global 500 handler
      }
      return result;
    }
  );

  const totalPages = Math.ceil(count / limit);

  res.render("home/levels", {
    profile: req.user,
    client: client,
    theme: theme,
    levels: levels,
    guildId,
    currentPage: page,
    totalPages,
  });
});

router.post("/levels/settings/:id", ensureAuthenticated, async(req, res, next) => {
const guildId = req.params.id
try{
res.redirect(`/levels-settings?guildId=${guildId}`);
} catch (error) {
  console.error("❌ Route error:", error.message);
  error.status = 500;
  next(error);
}
})

module.exports = router;
