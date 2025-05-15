const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../auth/auth");
const { getClient } = require("../bot");
const db = require("../database/db");
const themes = './configs/theme.json';
const jsonfile = require('jsonfile')

router.get("/activity", ensureAuthenticated, async (req, res, next) => {
  const client = await getClient();
  try{
    const clientId = client.user.id;
    const success = req.query.success ? "✅ Status saved!" : null;
  const theme = jsonfile.readFileSync(themes);
  var query = "SELECT * FROM activity WHERE client_id = ?";

  const [activity] = await db.query(query, [clientId], function(err, result, next) {
    if(err){
        console.error("❌ Route error:", err.message);
        err.status = 500;
        next(err); // Forward to your global 500 handler
    }
    return result;
  });

  const savedActivity = activity[0] || {};

  res.render("home/activity", {
    client: client,
    profile: req.user,
    theme: theme,
    activity: savedActivity,
    success,
    clientId
  })
} catch(error){
    console.error("❌ Route error:", error.message);
        error.status = 500;
        next(error);
}
});

router.post("/activity/save", ensureAuthenticated, async (req, res, next) => {
    try{
        const { activity_name, activity_type, clientId } = req.body;
        const Aenabled = req.body.activityEnabled ? 1 : 0;
        await db.execute(
          `UPDATE activity SET name = ?, type = ?, enabled = ? WHERE client_id = ? `,
          [ activity_name || null, activity_type, Aenabled, clientId]
        );
        res.redirect("/activity?success=true")
    }catch (error) {
        console.error("❌ Route error:", error.message);
        error.status = 500;
        next(error);
    }
})

module.exports = router;