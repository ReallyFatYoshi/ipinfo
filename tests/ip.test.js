import app from '../app.js';

const supertest = require('supertest');
const request = supertest(app);

describe('[GET] /:ip', () => {
  it('Valid ip test.', async () => {
    return request.get('/127.0.0.1').expect(200);
  });

  it('Invalid ip.', async () => {
    return request.get('/01.0.0.0').expect(400);
  });
});