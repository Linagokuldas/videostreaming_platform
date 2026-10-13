import { app } from './app';
import { config } from './config';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🎬 REELFLIX Video Streaming & Subscription Backend`);
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log(`📡 Health Check at:   http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
