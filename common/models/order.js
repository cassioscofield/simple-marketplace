// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
var app = require('../../server/server');

module.exports = function(Order) {

  // Disabling unused remote methods not used
  Order.disableRemoteMethodByName('upsert');
  Order.disableRemoteMethodByName('prototype.updateAttributes');
  Order.disableRemoteMethodByName('exists');
  Order.disableRemoteMethodByName('createChangeStream');
  Order.disableRemoteMethodByName('findOne');
  Order.disableRemoteMethodByName('replaceOrCreate');
  Order.disableRemoteMethodByName('updateAll');
  Order.disableRemoteMethodByName('replaceById');
  Order.disableRemoteMethodByName('count');
  Order.disableRemoteMethodByName('upsertWithWhere');

  // Model validations
  Order.validatesPresenceOf('productId');
  Order.validatesInclusionOf('status', {
    in: ['active', 'cancelled'],
    message: 'is not allowed'
  });

  // Implementing soft-delete
  Order.on('attached', function () {
    Order.deleteById = function (id, undefined, callback) {
      Order.updateAll({ orderId: id }, {
        status: 'cancelled',
      }, callback);
    };
  });

  // Filtering only not cancelled orders by default
  Order.beforeRemote('find', function(ctx, modelInstance, next) {
    if (!ctx.args.filter) {
      ctx.args.filter = {
        where: {
          status: { neq: 'cancelled'}
        }
      };
    }
    next();
  });

  function calculateFeesAndRevenue (instance, product, store) {
    instance.paymentFee = (store.paymentFee * product.price).toFixed(2);
    instance.marketplaceFee = (store.marketplaceFee * product.price).toFixed(2);
    instance.storeRevenue = (product.price - instance.paymentFee - instance.marketplaceFee).toFixed(2);
  }

  function addProductInformationToOrder(instance, product, store) {
    if (product.status !== 'active') {
      throw new Error('cannot purchase an inactive product');
    }
    instance.amountPaid = product.price;
    instance.productName = product.name;
    instance.storeId = store.storeId;
  }

  async function addProductStoreAndFeeInformationToOrder(ctx, next) {

    let product = await app.models.Product.findById(ctx.instance.productId);
    if (!product) {
      var error = new Error('product not found in database');
      error.status = 422;
      next(error);
      return;
    }
    let store = await app.models.Store.findById(product.storeId);

    try {
      addProductInformationToOrder(ctx.instance, product, store);
      calculateFeesAndRevenue(ctx.instance, product, store);
      next();
    } catch (error) {
      error.status = 400;
      next(error);
    }

    
  }

  Order.observe('before save', function (ctx, next) {

    // Before Update
    if (!ctx.instance) {
      next();
      return;
    }

    // Before Create
    if (!ctx.instance.productId) {
      var error = new Error('productId can`t be blank');
      error.status = 400;
      next(error);
      return;
    }
    try {
      addProductStoreAndFeeInformationToOrder(ctx, next);
    } catch (e) {
      next(e);
    }
  });

};
