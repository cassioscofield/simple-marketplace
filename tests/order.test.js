const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect;
let app = require('./../server/server.js');

describe('Order', function () {
    describe('GET /api/orders', function () {
        it('responds with an empty json array', function (done) {
            chai.request(app).get('/api/orders')
                .end((err, res) => {
                    expect(res.body).to.be.an('array');
                    expect(res.status).to.equal(200);
                    expect(res.body.length).to.equal(0);
                    done(err);
                });
        });
    });
});
