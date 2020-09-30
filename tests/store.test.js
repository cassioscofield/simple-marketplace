const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect;
let app;

describe('Store', function () {
    before(function () {
        app = require('./../server/server.js');
    });
    describe('GET /stores', function () {
        it('responds with an empty json array', function (done) {
            chai.request(app).get('/api/stores')
                .end((err, res) => {
                    expect(res.body).to.be.an('array');
                    expect(res.status).to.equal(200);
                    expect(res.body.length).to.equal(0);
                    done(err);
                });
        });
    });

    describe('POST /stores', function () {
        it('should respond with storeId and default fees', function (done) {
            chai.request(app)
                .post('/api/Stores')
                .send({
                    'name': 'store-one'
                })
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.storeId).to.equal(1);
                    expect(res.body.marketplaceFee).to.equal(0.09);
                    expect(res.body.paymentFee).to.equal(0.01);
                    expect(res.body.name).to.equal('store-one');
                    done(err);
                });
        });
    });
    describe('PUT /stores/{id}', function () {
        it('should accept change on fees', function (done) {
            chai.request(app)
                .put('/api/stores/1')
                .send({
                    'name': 'store-one-two',
                    'marketplaceFee': 0.08,
                    'paymentFee': 0.02,
                })
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.storeId).to.equal(1);
                    expect(res.body.marketplaceFee).to.equal(0.08);
                    expect(res.body.paymentFee).to.equal(0.02);
                    expect(res.body.name).to.equal('store-one-two');
                    done(err);
                });
        });
    });

    describe('GET /stores', function () {
        it('responds with json array with one element', function (done) {
            chai.request(app).get('/api/stores')
                .end((err, res) => {
                    expect(res.body).to.be.an('array');
                    expect(res.status).to.equal(200);
                    expect(res.body.length).to.equal(1);
                    expect(res.body[0].storeId).to.equal(1);
                    expect(res.body[0].marketplaceFee).to.equal(0.08);
                    expect(res.body[0].paymentFee).to.equal(0.02);
                    expect(res.body[0].name).to.equal('store-one-two');
                    done(err);
                });
        });
    });

});
