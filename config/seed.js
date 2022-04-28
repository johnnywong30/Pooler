const connection = require('./mongoConnection')
const data = require('../data/')
const { ObjectId } = require('mongodb')
const usersJson = require('./seeds/users.json')
const eventsJson = require('./seeds/events.json')
const usersData = data.users;
const eventsData = data.events;

const setup = async () => {
    const db = await connection.connectToDb()
    await db.dropDatabase()

    const userCollection = await db.collection('users')
    const eventCollection = await db.collection('events')
    
    // Seeding Users
    // createUser(email, password, firstName, lastName, phone, venmo, address, isDriver)

    for (user of usersJson.users) {
        console.log(`Seeding user ${user.firstName} ${user.lastName}`)
        try {
            await usersData.createUser(
                user.email,
                user.password,
                user.firstName,
                user.lastName,
                user.phone,
                user.venmo,
                user.address,
                user.driver
            )
        } catch (e) {
            console.log(e);
        }
    }

    // Seeding events 
    // createEvent(_name, _date, _startTime, _host, _description, _capacity, _destination, _private, _password = '')
    for (event_ of eventsJson.events) {
        console.log(`Seeding event ${event_.name}`)
        try {
            await eventsData.createEvent(
                event_.name,
                event_.date,
                event_.startTime,
                event_.host,
                event_.description,
                event_.capacity,
                event_.destination,
                event_.private,
                event_.password
            )
        } catch (e) {
            console.log(e);
        }
    }

    console.log('Done seeding database');

    await connection.closeConnection();
}

setup()

module.exports = {
    setup: setup
}