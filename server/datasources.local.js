const NODE_ENV = process.env.NODE_ENV;
console.log('NODE_ENV', NODE_ENV);

const DB_PRODUCTION = {
  "connector": "mysql",
  "name": "db",
  "host": process.env.DB_HOST || "localhost",
  "port": process.env.DB_PORT || 3306,
  "database": process.env.DB_DATABASE || "marketplace",
  "username": process.env.DB_USERNAME || "myuser",
  "password": process.env.DB_PASSWORD || "mypassword",
  "connectionLimit": process.env.DB_CONNECTIONS || 3
};

const DB_DEVELOPMENT = {
  "name": "db",
  "connector": "memory",
  "file": process.env.DB_FILE || "database.json"
};

const DB_TEST = {
  "name": "db",
  "connector": "memory"
};

let db = DB_TEST;
if (process.env.NODE_ENV === 'development') {
  db = DB_DEVELOPMENT;
} else if (process.env.NODE_ENV === 'test') {
  db = DB_TEST;
} else {
  db = DB_PRODUCTION;
}

module.exports = {
  "db": db
};
