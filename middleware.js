const UseAuthentication = function(req, res, next)
{
    const authHeader = req.headers['authorization'];

    if (process.env.ACCESS_TOKEN == null) res.status(500).json({error: 'You must first set ACCESS_TOKEN in .env'})
    else if (authHeader === process.env.ACCESS_TOKEN) {
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
}

module.exports = {
    UseAuthentication
}