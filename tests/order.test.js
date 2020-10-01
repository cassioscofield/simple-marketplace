const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect;
let app = require('./../server/server.js');

describe('Order', function () {
    
    before(function (done) {
        app = require('./../server/server.js');
        app.models.Order.deleteAll().then(orderDelete => {
            app.models.Product.deleteAll().then(productDelete => {
                app.models.Store.deleteAll().then(storeDelete => {
                    // console.log('deleteAll', {orderDelete, productDelete, storeDelete});
                    done();
                });
            });
        });
    });

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

    describe('POST /api/orders validation errors', function () {
        it('responds reject order without productId', function (done) {
            chai.request(app)
                .post('/api/Orders')
                .send({})
                .end((err, res) => {
                    expect(res.status).to.equal(400);
                    expect(res.body.error.message).to.equal('productId can`t be blank');
                    done(err);
                });
        });
        it('responds reject order with invalid productId', function (done) {
            chai.request(app)
                .post('/api/Orders')
                .send({
                    'productId': '9'
                })
                .end((err, res) => {
                    expect(res.body.error.message).to.equal('product not found in database');
                    expect(res.status).to.equal(422);
                    done(err);
                });
        });
    });
    describe('POST /api/orders success', function () {
        let storeId, productId;
        before(function (done) {
            app.models.Store.create({
                name: 'store-one'
            }).then(store => {
                storeId = store.storeId;
                app.models.Product.create({
                    storeId: storeId,
                    name: 'product-one',
                    price: 50
                }).then(product => {
                    productId = product.productId;
                    done();
                });
            });
        });
        it('responds with orderId after creating object', function (done) {
            chai.request(app)
                .post('/api/Orders')
                .send({
                    'productId': productId
                })
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.orderId).to.equal(1);
                    expect(res.body.productId).to.equal(1);
                    expect(res.body.storeId).to.equal(1);
                    expect(res.body.amountPaid).to.equal(50);
                    expect(res.body.marketplaceFee).to.equal(4.5);
                    expect(res.body.paymentFee).to.equal(0.5);
                    expect(res.body).to.contain.key('orderDate');
                    expect(res.body.storeRevenue).to.equal(45);
                    done(err);
                });
        });
    });
});
