var server = require('./server');
var ds = server.dataSources.db;
console.log('ds', ds);
var lbTables = [
  'Store',
  'Product',
  'Order',
  'User',
  'AccessToken',
  'ACL',
  'RoleMapping',
  'Role'
];
ds.autoupdate(lbTables, function(err) {
  if (err) throw err;
  console.log('Loopback tables autoupdated in ', ds.adapter.name);
  ds.disconnect();
});