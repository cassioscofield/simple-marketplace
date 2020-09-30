const NODE_ENV = process.env.NODE_ENV;
console.log('NODE_ENV', NODE_ENV);

module.exports = {
  "db": {
    "name": "db",
    "connector": "memory",
    "file": NODE_ENV === 'test' ? '': 'database.json'
  }
};
