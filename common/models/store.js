// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

module.exports = function(Store) {
  // Disabling unused remote methods not used
  Store.disableRemoteMethodByName('upsert');
  Store.disableRemoteMethodByName('prototype.updateAttributes');
  Store.disableRemoteMethodByName('exists');
  Store.disableRemoteMethodByName('createChangeStream');
  Store.disableRemoteMethodByName('findOne');
  Store.disableRemoteMethodByName('replaceOrCreate');
  Store.disableRemoteMethodByName('updateAll');
  Store.disableRemoteMethodByName('count');
  Store.disableRemoteMethodByName('upsertWithWhere');

  // Model validations
  Store.validatesUniquenessOf('name', {
    message: 'is not unique',
  });
  Store.validatesInclusionOf('status', {
    in: ['active', 'inactive'],
    message: 'is not allowed',
  });

  // Implementing soft-delete
  Store.on('attached', function() {
    Store.deleteById = function(id, undefined, callback) {
      Store.updateAll({storeId: id}, {
        status: 'inactive',
      }, callback);
    };
  });

  // Filtering only active stores by default
  Store.beforeRemote('find', function(ctx, modelInstance, next) {
    if (!ctx.args.filter) {
      ctx.args.filter = {
        where: {
          status: 'active',
        },
      };
    }
    next();
  });
};
