// Set test env
process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();

var register = require('../routes/register');
var testData = require('./testData.json');

var app = require('../app');

chai.use(chaiHttp);

describe('Register route', () => {
    beforeEach(function(done) {
        done();
      });
    
      afterEach(function(done) {
        done();
    });

    // Test get register page
    describe('Test1: GET /register', () => {
        it('it should render the register page', (done) => {
        chai.request(app)
            .get('/register')
            .end((err, res) => {
                res.redirects.length.should.equal(0);
                res.status.should.equal(200);
                res.type.should.equal('text/html');
                res.text.should.contain('<title>Register</title>');
                done();
            });
        });
    });

    // Test registering with fake Particle account
    describe('Test2: GET /register?fakeParticleAct', () => {
        it('it should render the register page with 401 error status given unauthorizable Particle account', (done) => {
        var fakeActQuery = '/register?email=' + testData.fakeParticleAct.email + '&password=' + testData.fakeParticleAct.password;
        chai.request(app)
            .get(fakeActQuery)
            .end((err, res) => {
                res.redirects.length.should.equal(0);
                res.status.should.equal(401);
                res.type.should.equal('text/html');
                res.text.should.contain('<title>Register</title>');
                done();
            });
        });
    });

    // Test registering with real Particle account
    describe('Test3: GET /register?realParticleAct', () => {
        it('it should redirect to login page given authorizale Particle account', (done) => {
        var realActQuery = '/register?email=' + testData.realParticleAct.email + '&password=' + testData.realParticleAct.password;
        chai.request(app)
            .get(realActQuery)
            .end((err, res) => {
                res.redirects.length.should.equal(1);
                res.status.should.equal(200);
                res.type.should.equal('text/html');
                res.text.should.contain('<title>Login</title>');
                done();
            });
        });
    });

});