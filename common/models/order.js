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

  async function calculateFeesAndRevenue(ctx, next) {

    let product = await app.models.Product.findById(ctx.instance.productId);
    if (!product) {
      var error = new Error('product not found in database');
      error.status = 422;
      next(error);
      return;
    }
    let store = await app.models.Store.findById(product.storeId);

    ctx.instance.amountPaid = product.price;
    ctx.instance.paymentFee = (store.paymentFee * product.price).toFixed(2);
    ctx.instance.marketplaceFee = (store.marketplaceFee * product.price).toFixed(2);
    ctx.instance.storeRevenue = (product.price - ctx.instance.paymentFee - ctx.instance.marketplaceFee).toFixed(2);
    ctx.instance.storeId = store.storeId;

    next();
    
  }

  Order.observe('before save', function (ctx, next) {
    if (!ctx.instance.productId) {
      var error = new Error('productId can`t be blank');
      error.status = 400;
      next(error);
      return;
    }
    try {
      calculateFeesAndRevenue(ctx, next);
    } catch (e) {
      next(e);
    }
  });

};
