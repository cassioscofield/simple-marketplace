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
ds.automigrate(lbTables, function(er) {
  if (er) throw er;
  console.log('Loopback tables [' - lbTables - '] created in ', ds.adapter.name);
  ds.disconnect();
});