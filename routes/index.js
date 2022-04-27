const authRouter = require('./auth')
const profileRouter = require('./profile')
const eventRouter = require('./events')
const poolRouter = require('./pool')
// const poolRouter = require('./history')

const constructorMethod = (app) => {
    app.use('/', authRouter)
    app.use('/profile', profileRouter)
    app.use('/events', eventRouter)
    app.use('/pool', poolRouter) //change this to make more sense like '/events/pool'?
    // app.use('/history', historyRouter)
    app.use('*', (req, res) => {
        return res.status(404).json({ error: 'Route not found' });
    });
};

module.exports = constructorMethod;