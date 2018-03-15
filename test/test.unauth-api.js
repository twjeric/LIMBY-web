// Set test env
process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();

var config = require('../config.json');
var api = require('../routes/api');
var app = require('../app');

chai.use(chaiHttp);

describe('Some api is not accessible without token', () => {
    beforeEach(function(done) {
        done();
      });
    
      afterEach(function(done) {
        done();
    });

    // Test GET api/device not accessible without token
    describe('Test1: GET api/device', () => {
        it('it should receive response with 401 error status', (done) => {
        chai.request(app)
            .get('/api/device')
            .end((err, res) => {
                res.redirects.length.should.equal(0);
                res.status.should.equal(401);
                done();
            });
        });
    });  
    
    // Test GET api/past/:start/:end not accessible without token
    describe('Test2: GET api/past/:start/:end', () => {
        it('it should receive response with 401 error status', (done) => {
        chai.request(app)
            .get('/api/past')
            .end((err, res) => {
                res.redirects.length.should.equal(0);
                res.status.should.equal(401);
                done();
            });
        });
    });  
    
    // Test POST api/start not accessible without token
    describe('Test3: POST api/start', () => {
        it('it should receive response with 401 error status', (done) => {
        chai.request(app)
            .post('/api/start')
            .end((err, res) => {
                res.redirects.length.should.equal(0);
                res.status.should.equal(401);
                done();
            });
        });
    });  
    
    // Test GET api/stream not accessible without token
    describe('Test4: GET api/stream', () => {
        it('it should receive response with 401 error status', (done) => {
        chai.request(app)
            .get('/api/stream')
            .end((err, res) => {
                res.redirects.length.should.equal(0);
                res.status.should.equal(401);
                done();
            });
        });
    });      
});