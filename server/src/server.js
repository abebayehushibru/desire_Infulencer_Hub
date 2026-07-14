import app from './app.js';
import { ENV } from './config/env.js';

// Import db to trigger connection check on startup
import './config/db.js';

app.listen(ENV.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${ENV.PORT} [${ENV.NODE_ENV}]`);
});
