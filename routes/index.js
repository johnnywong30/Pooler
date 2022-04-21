const authRouter = require('./auth')
const profileRouter = require('./profile')

const constructorMethod = (app) => {
    app.use('/', authRouter)
    app.use('/', profileRouter)
    
    app.use('*', (req, res) => {
        return res.status(404).json({ error: 'Route not found' });
    });
};

module.exports = constructorMethod;