const express = require('express');
const app = express();
const static = express.static(__dirname + '/public');
const exphbs = require('express-handlebars');
const session = require('express-session');
const xss = require('xss')
const hbHelpers = require('./views/helpers')

const configRoutes = require('./routes');
const connection = require('./config/mongoConnection');

const appName = "Pooler"
const port = 3000

app.use('/public', static)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(session({
    name: 'AuthCookie',
    secret: '9y$B&E)H@McQfTjWnZr',
    resave: false,
    saveUninitialized: true
}))

// Middleware here

// Registering middleware
app.use('/register', async (req, res, next) => {
    if (req.session.user || req.method !== 'POST') next()
    if (req.method === 'POST') {
        // Clean up address data to be an object
        const { street, city, state, zipcode } = req.body
        req.body.address = {
            address: xss(street),
            city: xss(city),
            state: xss(state),
            zipcode: xss(zipcode)
        }
        const { isDriver } = req.body
        req.body.isDriver = isDriver === undefined ? false : true
        console.log('middleware')
        console.log(req.body)
        next()
    }
})

// Profile middleware
app.use('/profile', async (req, res, next) => {
    if (req.session.user && req.method === 'POST') {
        // Clean up address data to be an object
        const { street, city, state, zipcode } = req.body
        req.body.address = {
            address: xss(street),
            city: xss(city),
            state: xss(state),
            zipcode: xss(zipcode)
        }
        const { isDriver } = req.body
        req.body.isDriver = isDriver === undefined ? false : true
        // console.log(req.body)
        next()
    }
    else next()
})

app.use('/events', async (req, res, next) => {
    if (req.session.user && req.method === 'POST') {
        // Clean up address data to be an object
        const { private } = req.body
        if (!req.body.destination) {
            const { street, city, state, zipcode } = req.body
            req.body.destination = {
                address: xss(street),
                city: xss(city),
                state: xss(state),
                zipcode: xss(zipcode)
            }
        }
        else {
            const { address, city, state, zipcode } = req.body.destination
            req.body.destination = {
                address: xss(address),
                city: xss(city),
                state: xss(state),
                zipcode: xss(zipcode)
            }
        }
        req.body.private = private === 'true'
        next()
    }
    else next()
})

app.use('/pool', async (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    else next()
})

// Authentication middleware

// Logging middleware

app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main',
    helpers: hbHelpers
}))
app.set('view engine', 'handlebars')

configRoutes(app);

app.listen(port, async () => {
    //  COLOR FOR TEXT
    const db = await connection.connectToDb();
    console.log('\x1b[32m%s\x1b[0m', `*************************************\n${appName} Application Started Smoothly on port ${port}\n`)
    console.log('\x1b[32m%s\x1b[0m', `Your routes will be running on http://localhost:${port}\n*************************************`)

});

// Process killed callback
process.once('SIGUSR2', async () => {
    //  COLOR FOR TEXT
    await connection.closeConnection();
    console.log('Done!');
    console.log('\x1b[31m%s\x1b[0m', `*************************************\nSTOPPING SERVER\n*************************************`)
})

// sigint catch to run process killed callback
process.on('SIGINT', async () => {
    //stop sigint > emit sigusr2 > reinit sigint
    process.emit('SIGUSR2')
    process.exit()
})

