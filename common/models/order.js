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
  Order.disableRemoteMethodByName('replaceOrCreate');
  Order.disableRemoteMethodByName('upsertWithWhere');

  async function calculateFeesAndRevenue(ctx, next) {

    let product = await app.models.Product.findById(ctx.instance.productId);
    let store = await app.models.Store.findById(product.storeId);

    ctx.instance.amountPaid = product.price;
    ctx.instance.paymentFee = (store.paymentFee * product.price).toFixed(2);
    ctx.instance.marketplaceFee = (store.marketplaceFee * product.price).toFixed(2);
    ctx.instance.storeRevenue = (product.price - ctx.instance.paymentFee - ctx.instance.marketplaceFee).toFixed(2);
    ctx.instance.storeId = store.storeId;

    next();
    
  }

  Order.observe('before save', function (ctx, next) {
    calculateFeesAndRevenue(ctx, next);
  });

};
