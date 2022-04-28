const connection = require('./mongoConnection')
const data = require('../data/')
const { ObjectId } = require('mongodb')
const users = data.users
const events = data.events

const setup = async () => {
    const db = await connection.connectToDb()
    await db.dropDatabase()
    
    /*          CREATING USERS
     * createUser(email, password, firstName, lastName, phone, venmo, address, isDriver)
     */
    try {
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

    try {
        await users.createUser(
            "jwang203@stevens.edu", 
            "notmypass",
            "Jordan", 
            "Wang", 
            "9192341667", 
            "big-wang-69", 
            {
                address: "422 Monroe St",
                city: "Hoboken",
                state: "NJ",
                zipcode: "07030"
            }, 
            true)
    } catch (e) {
        console.log(e);
    }

    try {
        await users.createUser(
            "zuo12@stevens.edu", 
            "ilovedogs12",
            "Sophia", 
            "Zuo", 
            "9127341337", 
            "sophia.zuo", 
            {
                address: "500 Adams St",
                city: "Hoboken",
                state: "NJ",
                zipcode: "07030"
            }, 
            false)
    } catch (e) {
        console.log(e);
    }

    try {
        await users.createUser(
            "wong@stevens.edu", 
            "hunter13",
            "Johnny", 
            "Wong", 
            "9074140327", 
            "stevensfrisbeeclub", 
            {
                address: "612 Washington St",
                city: "Hoboken",
                state: "NJ",
                zipcode: "07030"
            }, 
            false)
    } catch (e) {
        console.log(e);
    }

    try {
        await users.createUser(
            "nsoriano11@stevens.edu", 
            "takenaf",
            "Nicholas", 
            "Soriano", 
            "5631120300", 
            "rubysnailsalon", 
            {
                address: "333 River St",
                city: "Hoboken",
                state: "NJ",
                zipcode: "07030"
            }, 
            false)
    } catch (e) {
        console.log(e);
    }

    try {
        await users.createUser(
            "rtumboko@stevens.edu", 
            "password1",
            "Roland", 
            "Tumbokon", 
            "9084995818", 
            "rolandtumbokon", 
            {
                address: "123 N Union Ave",
                city: "Cranford",
                state: "NJ",
                zipcode: "07016"
            }, 
            false)
    } catch (e) {
        console.log(e);
    }

    /*                  CREATING EVENTS
     * createEvent(_name, _date, _startTime, _host, _description, _capacity, _destination, _private, _password = '')
    */ 

    try {
        await events.createEvent(
            "Jordan Wang's Dance Party", 
            "04/01/2022",
            "13:30", 
            "jwang203@stevens.edu", 
            "Everyone is invited to dance to WAP and Twice songs with me!", 
            40,
            {
                address: "422 Monroe St",
                city: "Hoboken",
                state: "NJ",
                zipcode: "07030"
            }, 
            true,
            "jaanav")
    } catch (e) {
        console.log(e);
    }

    try {
        await events.createEvent(
            "Patrick Hill's Dance Recital", 
            "July 1",
            "02:05", 
            "zuo12@stevens.edu", 
            "Dancing in the Hills! Patrick Hill and his lovely wife are teaching us the roomba. Be there or be square!", 
            12,
            {
                address: "EAS 320",
                city: "Hoboken",
                state: "NJ",
                zipcode: "07030"
            }, 
            false,
            "")
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