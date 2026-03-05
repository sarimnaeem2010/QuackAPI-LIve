import 'dotenv/config';
import { sendDeviceDisconnectNotification } from './server/email';

sendDeviceDisconnectNotification('sarimnaeem2010@gmail.com', 'Sarim', 'My Phone')
  .then(() => console.log('✅ Email sent!'))
  .catch((err: Error) => console.error('❌ Failed:', err.message));
