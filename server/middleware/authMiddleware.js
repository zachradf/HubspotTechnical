module.exports.ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    console.log('req above error', req)
    res.status(401).send('Unauthorized');
  }
};
