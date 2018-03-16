// Set test env
process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();

var login = require('../routes/login');
var config = require('../config.json');
var testData = require('./testData.json');

var app = require('../app');

// Test register route before testing login route
// test.register after finished should create an user in db for login test
require("./test.register");

chai.use(chaiHttp);

describe('Login route', () => {
    beforeEach(function(done) {
        done();
      });
    
      afterEach(function(done) {
        done();
    });

    // Test get login page without jwt cookie
    describe('Test1: GET /login', () => {
        it('it should render the login page without any existing jwt cookie', (done) => {
        chai.request(app)
            .get('/login')
            .end((err, res) => {
                // res.clearCookie(config.jwtCookie, { path: '/' });
                res.redirects.length.should.equal(0);
                res.status.should.equal(200);
                res.type.should.equal('text/html');
                res.text.should.contain('<title>Login</title>');
                done();
            });
        });
    });

    // Test login with fake user
    describe('Test2: GET /login?fakeUser', () => {
        it('it should render login page with 401 error status when fake user login', (done) => {
        var fakeUserQuery = '/login?email=' + testData.fakeParticleAct.email + '&password=' + testData.fakeParticleAct.password;
        chai.request(app)
            .get(fakeUserQuery)
            .end((err, res) => {
                res.redirects.length.should.equal(0);
                res.status.should.equal(401);
                res.type.should.equal('text/html');
                res.text.should.contain('<title>Login</title>');
                done();
            });
        });
    });

    // Test login with real user created by test.register
    describe('Test3: GET /login?realUser', () => {
        it('it should redirect to events page when real user login', (done) => {
        var realUserQuery = '/login?email=' + testData.realParticleAct.email + '&password=' + testData.realParticleAct.password;
        chai.request(app)
            .get(realUserQuery)
            .end((err, res) => {
                res.redirects.length.should.equal(1);
                res.status.should.equal(200);
                res.type.should.equal('text/html');
                res.text.should.contain('<title>Events</title>');
                done();
            });
        });
    });

    // Test get login page with jwt cookie
    describe('Test4: GET /login', () => {
        it('it should redirect to events page with existing jwt cookie created by test3', (done) => {
        chai.request(app)
            .get('/login')
            .end((err, res) => {
                res.redirects.length.should.equal(1);
                res.status.should.equal(200);
                res.type.should.equal('text/html');
                res.text.should.contain('<title>Events</title>');
                done();
            });
        });
    });
});