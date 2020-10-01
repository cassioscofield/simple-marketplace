const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect;
let app = require('./../server/server.js');
const product = require('../common/models/product.js');

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

    describe('GET /api/orders - empty', function () {
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
        let storeId, productId, orderId, orderDate;
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
                    expect(res.body.productId).to.equal(productId);
                    expect(res.body.storeId).to.equal(storeId);
                    expect(res.body.amountPaid).to.equal(50);
                    expect(res.body.marketplaceFee).to.equal(4.5);
                    expect(res.body.paymentFee).to.equal(0.5);
                    expect(res.body).to.contain.key('orderId');
                    orderId = res.body.orderId;
                    expect(res.body).to.contain.key('orderDate');
                    orderDate = res.body.orderDate;
                    expect(res.body.storeRevenue).to.equal(45);
                    done(err);
                });
        });
        it('GET /api/orders - populated', function () {
            it('responds with a json array with the created order', function (done) {
                chai.request(app).get('/api/orders')
                    .end((err, res) => {
                        expect(res.body).to.be.an('array');
                        expect(res.status).to.equal(200);
                        expect(res.body.length).to.equal(1);
                        expect(res.body[0].orderId).to.equal(orderId);
                        expect(res.body[0].storeId).to.equal(storeId);
                        expect(res.body[0].productId).to.equal(productId);
                        expect(res.body[0].amountPaid).to.equal(50);
                        expect(res.body[0].orderDate).to.equal(orderDate);
                        expect(res.body[0].marketplaceFee).to.equal(4.5);
                        expect(res.body[0].paymentFee).to.equal(0.5);
                        done(err);
                    });
            });
        });
        describe('GET /api/orders/{id}', function () {
            it('should find order after its creation', function (done) {
                chai.request(app).get('/api/orders/' + productId)
                    .end((err, res) => {
                        expect(res.status).to.equal(200);
                        expect(res.body.productId).to.equal(productId);
                        expect(res.body.storeId).to.equal(storeId);
                        expect(res.body.amountPaid).to.equal(50);
                        expect(res.body.marketplaceFee).to.equal(4.5);
                        expect(res.body.paymentFee).to.equal(0.5);
                        expect(res.body).to.contain.key('orderId');
                        expect(res.body).to.contain.key('orderDate');
                        expect(res.body.storeRevenue).to.equal(45);
                        done(err);
                    });
            });
            it('should find order after deletion of its product in the store', function (done) {
                chai.request(app).delete('/api/products/' + productId)
                    .end((err, res) => {
                        expect(res.status).to.equal(200);
                        expect(res.body.count).to.equal(1);
                        chai.request(app).get('/api/orders/' + productId)
                            .end((err, res) => {
                                expect(res.status).to.equal(200);
                                expect(res.body.productId).to.equal(productId);
                                expect(res.body.storeId).to.equal(storeId);
                                expect(res.body.amountPaid).to.equal(50);
                                expect(res.body.marketplaceFee).to.equal(4.5);
                                expect(res.body.paymentFee).to.equal(0.5);
                                expect(res.body).to.contain.key('orderId');
                                expect(res.body).to.contain.key('orderDate');
                                expect(res.body.storeRevenue).to.equal(45);
                                done(err);
                            });
                    });
            });
            it('should find order after deletion of the store of the product', function (done) {
                chai.request(app).delete('/api/stores/' + storeId)
                    .end((err, res) => {
                        expect(res.status).to.equal(200);
                        expect(res.body.count).to.equal(1);
                        chai.request(app).get('/api/orders/' + orderId)
                            .end((err, res) => {
                                expect(res.status).to.equal(200);
                                expect(res.body.orderId).to.equal(orderId);
                                expect(res.body.productId).to.equal(productId);
                                expect(res.body.storeId).to.equal(storeId);
                                expect(res.body.orderDate).to.equal(orderDate);
                                expect(res.body.amountPaid).to.equal(50);
                                expect(res.body.marketplaceFee).to.equal(4.5);
                                expect(res.body.paymentFee).to.equal(0.5);
                                expect(res.body.storeRevenue).to.equal(45);
                                done(err);
                            });
                    });
            });
        });
        describe('DELETE /api/orders/{id}', function () {
            it('should be able to delete an order', function (done) {
                chai.request(app).delete('/api/orders/' + orderId)
                    .end((err, res) => {
                        expect(res.status).to.equal(200);
                        expect(res.body.count).to.equal(1);
                        done();
                    });
            });
            it('should find order with cancelled status after its deletion', function (done) {
                chai.request(app).get('/api/orders/' + orderId)
                    .end((err, res) => {
                        expect(res.status).to.equal(200);
                        expect(res.body.status).to.equal('cancelled');
                        done();
                    });
            });
        });
    });

});
