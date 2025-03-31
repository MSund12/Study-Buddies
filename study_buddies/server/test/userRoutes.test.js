import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';
import TempUser from '../models/TempUser.js';
import bcrypt from 'bcryptjs';

describe('User Routes Tests', () => {
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@yorku.ca',
    password: 'ValidPass123!'
  };

  // Test Registration
  describe('POST /api/users/register', () => {
    it('should create a TempUser with valid data', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send(testUser);

      expect(res.status).toBe(201);

      const tempUser = await TempUser.findOne({ email: testUser.email });
      expect(tempUser).toBeTruthy();
    });
  });

  // Test Verification
  describe('POST /api/users/verify', () => {
    it('should convert valid TempUser to permanent User', async () => {
      const tempUser = await TempUser.create({
        ...testUser,
        password: await bcrypt.hash(testUser.password, 10),
        VerifCode: '123456',
        CodeExpiry: new Date(Date.now() + 3600000)
      });

      const res = await request(app)
        .post('/api/users/verify')
        .send({
          email: testUser.email,
          verificationCode: '123456'
        });

      expect(res.status).toBe(201);

      const permanentUser = await User.findOne({ email: testUser.email });
      expect(permanentUser).toBeTruthy();
    });
  });
});
