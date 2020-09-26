const mongoose = require('mongoose');

const dbURI = 'mongodb://localhost/test';
mongoose.connect(dbURI, { useNewUrlParser: true });

// // create a connection for a second database
// const dbURIlog = 'mongodb://localhost/Loc8rLog';
// const logDB = mongoose.createConnection(dbURIlog); 

/* Console message  */
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to ' + dbURI);
});

mongoose.connection.on('error', err => {
    console.log('Mongoose connection error:', err);
});
mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

/* function to close connection */
const gracefulShutdown = (msg, callback) => {
    mongoose.connection.close(() => {
        console.log(`Mongoose disconnected through ${msg}`);
        callback();
    });
};
/* event when close connection */
process.once('SIGUSR2', () => {
    gracefulShutdown('nodemon restart', () => {
        process.kill(process.pid, 'SIGUSR2');
    });
});
process.on('SIGINT', () => {
    gracefulShutdown('app termination', () => {
        process.exit(0);
    });
});
process.on('SIGTERM', () => {
    gracefulShutdown('Heroku app shutdown', () => {
        process.exit(0);
    });
});

// BRING IN YOUR SCHEMAS & MODELS
require('./users');
require('./salt');



