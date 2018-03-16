// Set test env
process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();

var config = require('../config.json');
var logout = require('../routes/logout');
var app = require('../app');

chai.use(chaiHttp);

describe('Logout route', () => {
    beforeEach(function(done) {
        done();
      });
    
      afterEach(function(done) {
        done();
    });

    // Test that cookie is deleted and user is redirected to login
    describe('Test1: GET /logout', () => {
        it('it should redirect to login', (done) => {
        chai.request(app)
            .get('/register')
            .end((err, res) => {
                expect(res).not.to.have.cookie(config.jwtCookie);
                res.redirects.length.should.equal(1);
                res.status.should.equal(200);
                res.type.should.equal('text/html');
                res.text.should.contain('<title>Login</title>');
                done();
            });
        });
    });
});