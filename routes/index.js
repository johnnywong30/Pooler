const authRouter = require('./auth')
const eventRouter = require('./event')

const constructorMethod = (app) => {
    app.use('/', authRouter)
    app.use('/event', eventRouter)
    app.use('*', (req, res) => {
        return res.status(404).json({ error: 'Route not found' });
    });
};

module.exports = constructorMethod;