const connection = require('./mongoConnection')
const { ObjectId } = require('mongodb')


const setup = async () => {
    const db = await connection.connectToDb()
    try {
        await db.collection('users').drop()
        await db.collection('events').drop()
    } catch (e) {
        // collections do not exist yet
    }
    // TODO: write seed file here
    /*
            _     _
           /@\---/@\
         ,'         `.
        |             |
        <`-----------'>
       / `. `-----' ,' \
      /    `-------'    \
     :  |   _______   |  :
     |  `.,'       `.,'  |
    ,`.   \    o    /   ,'.
   /   `.  `.     ,'  ,'   \
 ^^^^----^^^^-----^^^^----^^^^
    */
}

setup()

module.exports = {
    setup: setup
}