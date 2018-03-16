// Set test env
process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();

var logout = require('../routes/logout');
var app = require('../app');

chai.use(chaiHttp);

describe('Device route', () => {
    beforeEach(function(done) {
        done();
      });
    
      afterEach(function(done) {
        done();
    });

    // Test if the server renders a page with perch info
    describe('Test1: GET /device', () => {
        it('it should renders a page with perch info', (done) => {
        chai.request(app)
            .get('/device')
            .end((err, res) => {
                res.redirects.length.should.equal(0);
                res.status.should.equal(200);
                res.type.should.equal('text/html');
                res.text.should.contain('<title>Device</title>');
                done();
            });
        });
    });
});