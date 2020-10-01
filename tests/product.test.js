const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect;
let app;
let productId = 1;
let storeId = 1;

describe('Product', function () {
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

    describe('GET /api/products', function () {
        it('responds with an empty json array', function (done) {
            chai.request(app).get('/api/products')
                .end((err, res) => {
                    expect(res.body).to.be.an('array');
                    expect(res.status).to.equal(200);
                    expect(res.body.length).to.equal(0);
                    done(err);
                });
        });
    });

    describe('POST /api/products', function () {
        it('should respond with productId', function (done) {
            chai.request(app)
                .post('/api/Products')
                .send({
                    'name': 'product-one',
                    'price': 50,
                    'storeId': storeId
                })
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body).to.contain.key('productId');
                    expect(res.body.name).to.equal('product-one');
                    expect(res.body.price).to.equal(50);
                    expect(res.body.storeId).to.equal(storeId);
                    productId = res.body.productId;
                    done(err);
                });
        });
    });

    describe('POST /api/products validation errors', function () {
        it('responds reject product without price', function (done) {
            chai.request(app)
                .post('/api/Products')
                .send({
                    'name': 'product-one',
                    'storeId': storeId
                })
                .end((err, res) => {
                    expect(res.status).to.equal(422);
                    expect(res.body.error.name).to.equal('ValidationError');
                    done(err);
                });
        });
        it('responds reject product without name', function (done) {
            chai.request(app)
                .post('/api/Products')
                .send({
                    'price': 9,
                    'storeId': storeId
                })
                .end((err, res) => {
                    expect(res.status).to.equal(422);
                    expect(res.body.error.name).to.equal('ValidationError');
                    done(err);
                });
        });
        it('responds reject product without storeId', function (done) {
            chai.request(app)
                .post('/api/Products')
                .send({
                    'price': 10,
                    'name': 'product-one'
                })
                .end((err, res) => {
                    expect(res.status).to.equal(422);
                    expect(res.body.error.name).to.equal('ValidationError');
                    done(err);
                });
        });
    });


    describe('PUT /api/products/{id}', function () {
        it('should respond with productId and changed price', function (done) {
            chai.request(app)
                .put('/api/Products/' + productId)
                .send({
                    'name': 'product-one-two',
                    'price': 100,
                    'storeId': storeId
                })
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.productId).to.equal(productId);
                    expect(res.body.name).to.equal('product-one-two');
                    expect(res.body.price).to.equal(100);
                    expect(res.body.storeId).to.equal(storeId);
                    done(err);
                });
        });
        it('should respond with 404 if productId is not found', function (done) {
            chai.request(app)
                .put('/api/Products/9')
                .send({
                    'name': 'product-nine',
                    'price': 100,
                    'storeId': 9
                })
                .end((err, res) => {
                    expect(res.status).to.equal(404);
                    done();
                });
        });
    });

    describe('GET /api/products', function () {
        it('responds with json array with one element', function (done) {
            chai.request(app).get('/api/products')
                .end((err, res) => {
                    expect(res.body).to.be.an('array');
                    expect(res.status).to.equal(200);
                    expect(res.body.length).to.equal(1);
                    expect(res.body[0].productId).to.equal(productId);
                    expect(res.body[0].storeId).to.equal(storeId);
                    expect(res.body[0].name).to.equal('product-one-two');
                    expect(res.body[0].price).to.equal(100);
                    done(err);
                });
        });
    });

    describe('DELETE /api/products', function () {
        it('responds with 200 when using delete method', function (done) {
            chai.request(app).delete('/api/products/' + productId)
                .end((err, res) => {
                    expect(res.body).to.be.an('object');
                    expect(res.status).to.equal(200);
                    expect(res.body.count).to.equal(1);
                    done(err);
                });
        });
        it('deleted products should not be returned in GET /api/products', function (done) {
            chai.request(app).get('/api/products')
                .end((err, res) => {
                    expect(res.body).to.be.an('array');
                    expect(res.status).to.equal(200);
                    expect(res.body.length).to.equal(0);
                    done(err);
                });
        });
    });

});
