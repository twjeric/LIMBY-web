// Set test env
process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();

var config = require('../config.json');
var testData = require('./testData.json');
var api = require('../routes/api');
var app = require('../app');

// Test login route before testing events route
// test.login after finished should create an session cookie
require("./test.login");

chai.use(chaiHttp);

describe('Api is accessible with token and perform correctly', () => {
    beforeEach(function(done) {
        done();
      });
    
      afterEach(function(done) {
        done();
    });

    // Test POST api/user with wrong Particle credentials
    describe('Test1: POST api/user with wrong Particle credentials', () => {
        it('it should receive response with 400 error status', (done) => {
        chai.request(app)
            .post('/api/user')
            .type('json')
            .send({
              'email': testData.fakeParticleAct.email,
              'password': testData.fakeParticleAct.password,
            })
            .end((err, res) => {
                res.redirects.length.should.equal(0);
                res.status.should.equal(400);
                done();
            });
        });
    });

    // Test POST api/user
    describe('Test2: POST api/user with already-registered Particle credentials', () => {
        it('it should receive response with 400 error status', (done) => {
        chai.request(app)
            .post('/api/user')
            .type('json')
            .send({
              'email': testData.realParticleAct.email,
              'password': testData.realParticleAct.password,
            })
            .end((err, res) => {
                res.redirects.length.should.equal(0);
                res.status.should.equal(400);
                done();
            });
        });
    });

    // Test POST api/auth
    describe('Test3: POST api/auth', () => {
        it('it should receive json response of token', (done) => {
        chai.request(app)
            .post('/api/auth')
            .end((err, res) => {
                res.redirects.length.should.equal(0);
                res.status.should.equal(200);
                res.type.should.equal('json');
                done();
            });
        });
    });    

    // Test GET api/device
    describe('Test4: GET api/device', () => {
        it('it should receive json response of perch info', (done) => {
        chai.request(app)
            .get('/api/device')
            .end((err, res) => {
                res.redirects.length.should.equal(0);
                res.status.should.equal(200);
                res.type.should.equal('json');
                done();
            });
        });
    });  
    
    // Test GET api/past/:start/:end with correct timestamp
    describe('Test5: GET api/past/:start/:end', () => {
        it('it should receive json response of past data', (done) => {
        let now = new Date();
        let end = now.getTime();
        let start = 0;
        chai.request(app)
            .get('/api/past/' + start + '/' + end)
            .end((err, res) => {
                res.redirects.length.should.equal(0);
                res.status.should.equal(200);
                res.type.should.equal('json');
                done();
            });
        });
    }); 
    
    // Test GET api/past/:start/:end with no timestamp
    describe('Test5: GET api/past/:start/:end', () => {
        it('it should receive response with 400 error status', (done) => {
        chai.request(app)
            .get('/api/past')
            .end((err, res) => {
                res.redirects.length.should.equal(0);
                res.status.should.equal(400);
                done();
            });
        });
    }); 

    // Test GET api/past/:start/:end with end < start
    describe('Test5: GET api/past/:start/:end', () => {
        it('it should receive response with 400 error status', (done) => {
        let now = new Date();
        let start = now.getTime()
        let end = start - 1;
        chai.request(app)
            .get('/api/past/' + start + '/' + end)
            .end((err, res) => {
                res.redirects.length.should.equal(0);
                res.status.should.equal(400);
                done();
            });
        });
    }); 
});