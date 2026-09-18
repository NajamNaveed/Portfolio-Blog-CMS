const AnalyticsEvent = require('../models/AnalyticsEvent');
const { ALLOWED_EVENTS } = AnalyticsEvent;
const asyncHandler = require('../utils/asyncHandler');

const trackEvent = asyncHandler(async (req, res) => {
  const { event, path, meta } = req.body || {};

  // Tracking must never break the page it's called from — invalid
  // payloads are silently accepted-and-ignored rather than erroring.
  if (typeof event !== 'string' || !ALLOWED_EVENTS.includes(event)) {
    return res.status(204).end();
  }

  await AnalyticsEvent.create({
    event,
    path: typeof path === 'string' ? path.slice(0, 200) : '',
    meta: typeof meta === 'string' ? meta.slice(0, 200) : '',
  });

  res.status(204).end();
});

const getSummary = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totals, daily] = await Promise.all([
    AnalyticsEvent.aggregate([{ $group: { _id: '$event', count: { $sum: 1 } } }]),
    AnalyticsEvent.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { event: '$event', day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.day': 1 } },
    ]),
  ]);

  const totalsByEvent = totals.reduce((acc, t) => ({ ...acc, [t._id]: t.count }), {});

  res.status(200).json({ success: true, totalsByEvent, daily, allowedEvents: ALLOWED_EVENTS });
});

module.exports = { trackEvent, getSummary };
