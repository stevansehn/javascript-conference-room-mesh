const {app, peerStats} = require('..//app') 
const supertest = require('supertest')
const request = supertest(app)

it('Gets the test endpoint', async done => {
    // Sends GET Request to /test endpoint
    const response = await request.get('/rooms')
  
    expect(response.body).toBe("stat")
    done()
})