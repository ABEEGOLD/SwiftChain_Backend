import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from './src/app';

(async () => {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  try {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Debug User',
      email: 'debug@example.com',
      password: 'SecurePass123!',
    });
    console.log('register status', res.status);
    console.log('register body', JSON.stringify(res.body, null, 2));

    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'debug@example.com',
      password: 'SecurePass123!',
    });
    console.log('login status', loginRes.status);
    console.log('login body', JSON.stringify(loginRes.body, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    await mongoServer.stop();
  }
})();
