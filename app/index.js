const express = require('express');
const app = express();
const http = require('http')
const path = require('path')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const validator = require('express-validator')
const session = require('express-session')
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose')
const flash = require('connect-flash')
const passport = require('passport')
const redis = require('redis');

module.exports = class Application {

    constructor() {

        this.setupExpress();
        this.setMongoConnection();
        this.setConfig();
        this.setRouters();
        this.setRedis();

    }

    setupExpress() {

        const server = http.createServer(app)

        server.listen(3000, () => {
            console.log(' listening on port 3000 ')
        })
    }

    setMongoConnection() {

        mongoose.Promise = global.Promise;
        mongoose.connect('mongodb://localhost/exchange', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        });

    }

    setConfig() {

        app.use(express.static('public'))
        app.set('view engine', 'ejs')
        app.set('views', path.resolve('./resourse/views'))
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
        // app.use(validator());
        app.use(session({
            secret: 'foo',
            store: MongoStore.create({mongoUrl: 'mongodb://localhost/exchange'})
        }));
        app.use(cookieParser('mysecretkey'))
        app.use(flash());


    }

    setRedis() {
        const client = redis.createClient({
            host: '127.0.0.1',
            port: 6379,
        //    password: ''
        });

        client.on('error', err => {
            console.log('Error ' + err);
        });
    }

    setRouters() {
        app.use(require('./routes'))
    }


}