const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect;
let app = require('./../server/server.js');

describe('Server', function () {
    describe('GET /', function () {
        it('responds with 200, for started and uptime', function (done) {
            chai.request(app).get('/')
                .end((err, res) => {
                    expect(res.body).to.be.an('object');
                    expect(res.status).to.equal(200);
                    expect(res.body).have.property('started');
                    expect(res.body).have.property('uptime');
                    done(err);
                });
        });
    });
    describe('GET /explorer', function () {
        it('responds with 200, for the API swagger', function (done) {
            chai.request(app).get('/')
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    done(err);
                });
        });
    });
});
