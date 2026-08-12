import app from './app';
import { ENV } from './config/env';

app.listen(Number(ENV.PORT), '0.0.0.0', () => {
  console.log(`==================================================`);
  console.log(` ProcessifyERP Backend Server Listening on Port ${ENV.PORT}`);
  console.log(` Health Check: http://localhost:${ENV.PORT}/health`);
  console.log(`==================================================`);
});
