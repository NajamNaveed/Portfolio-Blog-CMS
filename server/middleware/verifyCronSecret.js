function verifyCronSecret(req, res, next) {
  const expected = process.env.JOB_CRON_SECRET;

  if (!expected) {
    return res.status(500).json({ success: false, message: 'JOB_CRON_SECRET is not configured on the server' });
  }

  const provided = req.get('x-cron-secret');

  if (!provided || provided !== expected) {
    return res.status(401).json({ success: false, message: 'Invalid or missing cron secret' });
  }

  return next();
}

module.exports = { verifyCronSecret };
