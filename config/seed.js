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

    // Seeding Users
    const userCollection = await db.collection('users')
    await userCollection.insertMany(usersJson)
    
    // Seeding events 
    const eventCollection = await db.collection('events')
    await eventCollection.insertMany(eventsJson)

    console.log('Done seeding database');

    await connection.closeConnection();
}

setup()


exports = module.exports = {setup}