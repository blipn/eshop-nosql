const settings = require('../src/api/server/lib/settings');
const winston = require('winston');
const MongoClient = require('mongodb').MongoClient;

const mongodbConnection = settings.mongodbServerUrl;
const lastslashindex = mongodbConnection.lastIndexOf('/');
const dbName = mongodbConnection.substring(lastslashindex  + 1);

const RECONNECT_INTERVAL = 1000;
const CONNECT_OPTIONS = {
  reconnectTries: 3600,
  reconnectInterval: RECONNECT_INTERVAL
}

const onClose = () => {
  winston.info('MongoDB connection was closed');
}

const onReconnect = () => {
  winston.info('MongoDB reconnected');
}

const connectWithRetry = () => {
  MongoClient.connect(mongodbConnection, CONNECT_OPTIONS, (err, client) => {
    if(err){
      winston.error('MongoDB connection was failed:', err.message);
      setTimeout(connectWithRetry, RECONNECT_INTERVAL);
    } else {
      const db = client.db(dbName);
      db.on('close', onClose);
      db.on('reconnect', onReconnect);
      
      winston.info('MongoDB connected successfully');
      populate(db, () => {
        client.close();
      });
    }
  });
};

connectWithRetry();

function populate(db, close) {
    db.collection('pages').insertMany([
        {slug: '', meta_title: 'Home', enabled: true, is_system: true},
        {slug: 'checkout', meta_title: 'Checkout', enabled: true, is_system: true},
        {slug: 'checkout-success', meta_title: 'Thank You!', enabled: true, is_system: true},
        {slug: 'cart', meta_title: 'Cart', enabled: true, is_system: true},
        {slug: 'login', meta_title: 'Login', enabled: true, is_system: true},
        {slug: 'logout', meta_title: 'Logout', enabled: true, is_system: true},
        {slug: 'register', meta_title: 'Register', enabled: true, is_system: true},
        {slug: 'account', meta_title: 'Account', enabled: true, is_system: true}
    ]);
    db.collection('tokens').insert({
        is_revoked: false,
        date_created: new Date(),
        expiration: 72,
        name: 'Owner',
        email: 'email@domain.com',
        scopes: ['admin']  
    });
    db.collection('emailSettings').insert({
        host: 'smtp.domain.com',
        port: 465,
        user: '',
        pass: '',
        from_name: 'Store',
        from_address: 'email@domain.com'
    });
    db.collection('settings').insert({
        domain: 'http://localhost:3000',
        logo_file: "goto4ever.png",
        language: 'en',
        currency_code: 'EUR',
        currency_symbol: '€',
        currency_format: '{amount}€',
        thousand_separator: ',',
        decimal_separator: '.',
        decimal_number: 2,
        timezone: 'Europe/Paris',
        date_format: 'D MMMM YYYY',
        time_format: 'HH:mm',
        default_shipping_country: 'FR',
        default_shipping_state: '',
        default_shipping_city: '',
        default_product_sorting: 'stock_status,price,position',
        weight_unit: 'kg',
        length_unit: 'cm',
        hide_billing_address: false
    });
    db.collection('pages').createIndex({ enabled: 1 });
    db.collection('pages').createIndex({ slug: 1 });
    db.collection('productCategories').createIndex({ enabled: 1 });
    db.collection('productCategories').createIndex({ slug: 1 });
    db.collection('products').createIndex({ slug: 1 });
    db.collection('products').createIndex({ enabled: 1 });
    db.collection('products').createIndex({ category_id: 1 });
    db.collection('products').createIndex({ sku: 1 });
    db.collection('products').createIndex({'attributes.name' : 1, 'attributes.value' : 1});
    db.collection('products').createIndex({
        'name': 'text',
        'description': 'text'
    }, { default_language: 'english', name: 'textIndex' });
    db.collection('customers').createIndex({ group_id: 1 });
    db.collection('customers').createIndex({ email: 1 });
    db.collection('customers').createIndex({ mobile: 1 });
    db.collection('customers').createIndex({
        'full_name': 'text',
        'addresses.address1': 'text'
    }, { default_language: 'english', name: 'textIndex' });
    db.collection('orders').createIndex({ draft: 1 });
    db.collection('orders').createIndex({ number: 1 });
    db.collection('orders').createIndex({ customer_id: 1 });
    db.collection('orders').createIndex({ email: 1 });
    db.collection('orders').createIndex({ mobile: 1 });
    db.collection('orders').createIndex({
        'shipping_address.full_name': 'text',
        'shipping_address.address1': 'text'
    }, { default_language: 'english', name: 'textIndex' });

    setTimeout(()=>{
        winston.info('MongoDB database populated');
        close();
    }, 3000);
}