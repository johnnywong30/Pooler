const express = require('express');
const app = express();
const static = express.static(__dirname + '/public');
const exphbs = require('express-handlebars');
const session = require('express-session');

const configRoutes = require('./routes');
const connection = require('./config/mongoConnection');

const appName = "Pooler"
const port = 3000

app.use('/public', static)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(session({
    name: 'AuthCookie',
    secret: '9y$B&E)H@McQfTjWnZr4t7w!z%C*F-JaNdRgUkXp2s5v8x/A?D(G+KbPeShVmYq3t6w9z$B&E)H@McQfTjWnZr4u7x!A%D*F-JaNdRgUkXp2s5v8y/B?E(H+KbPeShVm',
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
            address: street,
            city: city,
            state: state,
            zipcode: zipcode
        }
        const { isDriver } = req.body
        req.body.isDriver = isDriver === undefined ? false : true
        console.log(req.body)
        next()
    }
  })


// Authentication middleware

// Logging middleware


app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }))
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

