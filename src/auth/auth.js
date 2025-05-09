module.exports = {
    ensureAuthenticated: function(req, res, next) {
      if (req.isAuthenticated && req.isAuthenticated()) return next();
  res.redirect('/login');
    },
    forwardAuthenticated: function(req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      }
      res.redirect('/home');      
    }
};