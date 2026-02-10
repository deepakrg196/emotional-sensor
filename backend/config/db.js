const mongoose = require('mongoose');

async function connectDB(uri) {
  if (!uri) {
    console.warn('No MONGO_URI provided. Running in development mode without database.');
    return;
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error', err);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('Continuing in development mode without database.');
    }
  }
}

module.exports = connectDB;
