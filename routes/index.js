// const { router } = require('./main')

const constructorMethod = (app) => {
    // app.use('/', router)
    app.use('*', (req, res) => {
        return res.status(404).json({ error: 'Route not found' });
    });
};

module.exports = constructorMethod;