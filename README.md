# Eshop-NOSQL

React and Node.js based eCommerce platform.

## Built with:
* Node.js
* React
* Redux
* Express
* Babel
* WebPack
* MongoDB

## Requirements
* Node.js >= 8
* MongoDB >= 3.2

For the MongoDB configuration it's up to you to set thoses env variables :

DB_HOST || '127.0.0.1';
DB_PORT || 27017;
DB_NAME || 'shop'
DB_USER || '';
DB_PASS || '';


## Installation & Launch
```
npm cache verify
npm install
npm run build
npm run populate
npm run start-all
```

## Installation & Launch with populated database
```
npm cache verify
npm install
npm run build

Stop mongod
Copy the db folder content from the db.zip to /data/db on your disk
Start mongod

npm run start-all
```

API running at http://localhost:3001

Store running at http://localhost:3000

Admin dashboard running at http://localhost:3000/admin
