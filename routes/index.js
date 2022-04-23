const authRouter = require('./auth')
const eventRouter = require('./events')

const constructorMethod = (app) => {
    app.use('/', authRouter)

    app.use('/events', eventRouter)
    app.use('*', (req, res) => {
        return res.status(404).json({ error: 'Route not found' });
    });
};

module.exports = constructorMethod;