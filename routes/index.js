const authRouter = require('./auth')
const poolRouter = require('./pool')

const constructorMethod = (app) => {
    app.use('/', authRouter)
    app.use('/pool', poolRouter) //change this to make more sense like '/events/pool'?
    app.use('*', (req, res) => {
        return res.status(404).json({ error: 'Route not found' });
    });
};

module.exports = constructorMethod;