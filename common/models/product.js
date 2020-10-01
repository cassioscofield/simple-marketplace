// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

module.exports = function(Product) {

  // Disabling unused remote methods not used
  Product.disableRemoteMethodByName('upsert');
  Product.disableRemoteMethodByName('prototype.updateAttributes');
  Product.disableRemoteMethodByName('exists');
  Product.disableRemoteMethodByName('createChangeStream');
  Product.disableRemoteMethodByName('findOne');
  Product.disableRemoteMethodByName('replaceOrCreate');
  Product.disableRemoteMethodByName('updateAll');
  Product.disableRemoteMethodByName('count');
  Product.disableRemoteMethodByName('upsertWithWhere');

  // Model validations
  Product.validatesInclusionOf('status', {
    in: ['active', 'inactive'],
    message: 'is not allowed'
  });
  Product.validatesPresenceOf('storeId');

  // Implementing soft-delete
  Product.on('attached', function () {
    Product.deleteById = function (id, undefined, callback) {
      Product.updateAll({ productId: id }, {
        status: 'inactive',
      }, callback);
    };
  });

  // Filtering only active active by default
  Product.beforeRemote('find', function(ctx, modelInstance, next) {
    if (!ctx.args.filter) {
      ctx.args.filter = {
        where: {
          status: 'active'
        }
      };
    }
    next();
  });

};
