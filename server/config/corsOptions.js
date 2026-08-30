const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: false,
};

module.exports = corsOptions;