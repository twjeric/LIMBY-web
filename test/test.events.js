// Set test env
process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();

var config = require('../config.json');
var events = require('../routes/events');
var app = require('../app');

// Test login route before testing events route
// test.login after finished should create an session cookie
require("./test.login");

chai.use(chaiHttp);

describe('Events route', () => {
    beforeEach(function(done) {
        done();
      });
    
      afterEach(function(done) {
        done();
    });

    // Test that the server renders events page with an user logged in
    describe('Test1: GET /events', () => {
        it('it should render events page', (done) => {
        chai.request(app)
            .get('/events')
            .end((err, res) => {
                res.redirects.length.should.equal(0);
                res.status.should.equal(200);
                res.type.should.equal('text/html');
                res.text.should.contain('<title>Events</title>');
                done();
            });
        });
    });

    // Test that the server renders redirects to login page after deleting the cookie
    describe('Test2: GET /events', () => {
        it('it should redirects to login page after deleting the cookie', (done) => {
        chai.request(app)
            .get('/events')
            .end((err, res) => {
                res.clearCookie(config.jwtCookie);
                res.redirects.length.should.equal(1);
                // The status should be 401 Unauthorized since the cookie is deleted
                res.status.should.equal(401);
                res.type.should.equal('text/html');
                res.text.should.contain('<title>Login</title>');
                done();
            });
        });
    });    
});