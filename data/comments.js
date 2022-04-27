const { checkId, checkString, checkEmail, checkPassword, checkFirstName, checkLastName, checkPhone, checkVenmo, checkAddress, checkIsDriver, checkDateTime } = require("../misc/validate");
const { users, events } = require("../config/mongoCollections");
const { v4: uuidv4 } = require("uuid");
const events = require("./events");

module.exports = {
    async createComment(eventId, poolId, email, details) {
        let _eventId = checkId(eventId)
        let _poolId = checkId(poolId)
        let _email = checkEmail(email)
        let _details = checkString(details)
        // check if user exists
        const userCollection = await users();
		const account = await userCollection.findOne({ email: _email })
		if (!account) throw `Error: createComment user email ${_email} does not exist.`;
        const eventCollection = await events();
        const event = await eventCollection.findOne({_id: _eventId})
        if (!event) throw `Error: createComment event ${_eventId} does not exist.`;
        const carpool = event.carpools.find(carpool => carpool._id === _poolId);
        if (!carpool) throw `Error: createComment carpool ${_poolId} does not exist`;
        //create comment 
        const newComment = {
            _id: uuidv4(),
            from: _userId,
            details: _details,
            timestamp: new Date()
        }
        const updateCarpool = await eventCollection.updateOne(
            {_id: _eventId, "carpools._id": _poolId},
            { $push: {"carpool.$.comments": newComment} }
        )
        if (updateCarpool.modifiedCount === 0) throw `Error: could not createComment successfully`
        return { commentCreated: true }
    },
    async getComment(carpoolId, commentId, email) {

    },
    async deleteComment(carpoolId, commentId, email) {

    },
    async updateComment(carpoolId, commentId, email, description) {

    }
}