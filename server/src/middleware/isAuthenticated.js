export const isAuthenticated = (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).send('Not authenticated');
    }
    next();
  };
  