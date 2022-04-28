const connection = require('./mongoConnection')
const data = require('../data/')
const { ObjectId } = require('mongodb')
const users = data.users


const setup = async () => {
    const db = await connection.connectToDb()
    await db.dropDatabase()
    
    /*          CREATING USERS
     * createUser(email, password, firstName, lastName, phone, venmo, address, isDriver)
     */
    try { //
        await users.createUser(
            "email@gmail.com", 
            "password1",
            "Adam", 
            "Smith", 
            "2315232251", 
            "a.smith", 
            {
                address: "406 Jefferson St",
                city: "Hoboken",
                state: "NJ",
                zipcode: "07030"
            }, 
            true)
    } catch (e) {
        console.log(e);
    }





    console.log('Done seeding database');

    await connection.closeConnection();
}

setup()

module.exports = {
    setup: setup
}