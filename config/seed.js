const connection = require('./mongoConnection')
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { ObjectId } = require('mongodb')


const setup = async () => {
    const db = await connection.connectToDb()
    try {
        await db.collection('users').drop()
        await db.collection('events').drop()
    } catch (e) {
        // collections do not exist yet
    }
    console.log("Start seeding...\n")

    const userCollection = await db.collection('users')
    const eventCollection = await db.collection('events')


    // seed users
    const password = 'tester'
    const saltRounds = 10
    const users = {
        johnny: {
            _id: uuidv4(),
            email: 'jwong9@stevens.edu',
            password: await bcrypt.hash(password, saltRounds),
            firstName: 'Johnny',
            lastName: 'Wong',
            phone: '+13472889457',
            venmo: 'Johnny-Wong-35',
            address: {
                _id: uuidv4(),
                address: '603 Adams St',
                city: 'Hoboken',
                state: 'NJ',
                zipcode: '07030',
            },
            driver: true,
            passenger: true,
            history: [],
        },
        jordan: {
            _id: uuidv4(),
            email: 'jwang203@stevens.edu',
            password: await bcrypt.hash(password, saltRounds),
            firstName: 'Jordan',
            lastName: 'Wang',
            phone: '2012009104',
            venmo: 'Johnny-Wong-35',
            address: {
                _id: uuidv4(),
                address: '603 Adams St',
                city: 'Hoboken',
                state: 'NJ',
                zipcode: '07030',
            },
            driver: true,
            passenger: true,
            history: [],
        },
        sophia: {
            _id: uuidv4(),
            email: 'szuo1@stevens.edu',
            password: await bcrypt.hash(password, saltRounds),
            firstName: 'Sophia',
            lastName: 'Zuo',
            phone: '2012020661',
            venmo: 'Johnny-Wong-35',
            address: {
                _id: uuidv4(),
                address: '603 Adams St',
                city: 'Hoboken',
                state: 'NJ',
                zipcode: '07030',
            },
            driver: true,
            passenger: true,
            history: [],
        },
        nikky: {
            _id: uuidv4(),
            email: 'nsoriano@stevens.edu',
            password: await bcrypt.hash(password, saltRounds),
            firstName: 'Nicholas',
            lastName: 'Soriano',
            phone: '2012009104',
            venmo: 'Johnny-Wong-35',
            address: {
                _id: uuidv4(),
                address: '603 Adams St',
                city: 'Hoboken',
                state: 'NJ',
                zipcode: '07030',
            },
            driver: true,
            passenger: true,
            history: [],
        },
        roland: {
            _id: uuidv4(),
            email: 'rtumboko@stevens.edu',
            password: await bcrypt.hash(password, saltRounds),
            firstName: 'Roland',
            lastName: 'Tumbokon',
            phone: '2012009104',
            venmo: 'Johnny-Wong-35',
            address: {
                _id: uuidv4(),
                address: '603 Adams St',
                city: 'Hoboken',
                state: 'NJ',
                zipcode: '07030',
            },
            driver: true,
            passenger: true,
            history: [],
        },
        tester: {
            _id: uuidv4(),
            email: 'tester@gmail.com',
            password: await bcrypt.hash(password, saltRounds),
            firstName: 'Not',
            lastName: 'Driver',
            phone: '2012009104',
            venmo: 'Johnny-Wong-35',
            address: {
                _id: uuidv4(),
                address: '603 Adams St',
                city: 'Hoboken',
                state: 'NJ',
                zipcode: '07030',
            },
            driver: false,
            passenger: true,
            history: [],
        },

    }

    // seed events
    const seedEvents = [
        {
            "_id": uuidv4(),
            "name": "Jordan Wang's Dance Party",
            "date": "05/10/2022",
            "startTime": "13:30:00",
            "host": users.jordan.email,
            "description": "Everyone is invited to dance to WAP and Twice songs with me!",
            "capacity": 40,
            "private": false,
            "password": "",
            "carpools": [],
            "destination": {
                "_id": uuidv4(),
                "address": "422 Monroe St",
                "city": "Hoboken",
                "state": "NJ",
                "zipcode": "07030"
            }
        },
        {
            "_id": uuidv4(),
            "name": "Sophia Zuo's Track Meet",
            "date": "05/11/2022",
            "startTime": "09:30:00",
            "host": users.sophia.email,
            "description": "Come watch me run fast",
            "capacity": 69,
            "private": false,
            "password": "",
            "carpools": [],
            "destination": {
                "_id": uuidv4(),
                "address": "Weehawken Public Playground",
                "city": "Weehawken",
                "state": "NJ",
                "zipcode": "07086"
            }
        },
        {
            "_id": uuidv4(),
            "name": "Johnny's Mango Taste Test Party",
            "date": "05/15/2022",
            "startTime": "16:00:00",
            "host": users.johnny.email,
            "description": "Come drink alcohol with me to celebrate my 21st birthday 4 months late",
            "capacity": 15,
            "private": true,
            "password": await bcrypt.hash(password, saltRounds),
            "carpools": [],
            "destination": users.johnny.address
        },
        {
            "_id": uuidv4(),
            "name": "Patrick Hill's Dance Recital",
            "date": "06/01/2022",
            "startTime": "12:30:00",
            "host": "phill123@stevens.edu",
            "description": "Everyone is invited to dance to old rock songs with me!",
            "capacity": 25,
            "private": false,
            "password": "",
            "carpools": [],
            "destination": {
                "_id": uuidv4(),
                "address": "1600 Park Ave",
                "city": "Hoboken",
                "state": "NJ",
                "zipcode": "07030"
            }
        }
    ]

    await userCollection.insertMany(Object.values(users))
    await eventCollection.insertMany(seedEvents)
    console.log('Done seeding...\n')
    process.exit()
}

setup()


exports = module.exports = {setup}