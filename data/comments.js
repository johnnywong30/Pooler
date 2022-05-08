const { checkId, checkString, checkEmail, checkPassword, checkFirstName, checkLastName, checkPhone, checkVenmo, checkAddress, checkIsDriver, checkDateTime } = require("../misc/validate");
const { users, events } = require("../config/mongoCollections");
const moment = require("moment")
const { v4: uuidv4 } = require("uuid");

module.exports = {
    async createComment(eventId, poolId, email, details) {
        let _eventId = checkId(eventId)
        let _poolId = checkId(poolId)
        let _email = checkEmail(email)
        let _details = checkString(details)
        // check if user exists
        const userCollection = await users()
		const account = await userCollection.findOne({ email: _email })
		if (!account) throw `createComment user email ${_email} does not exist.`
        const eventCollection = await events()
        const event = await eventCollection.findOne({_id: _eventId})
        if (!event) throw `createComment event ${_eventId} does not exist.`
        const carpool = event.carpools.find(carpool => carpool._id === _poolId)
        if (!carpool) throw `createComment carpool ${_poolId} does not exist`
        //create comment 
        const format = "MM/DD/YYYY HH:MM:SS"
        const newComment = {
            _id: uuidv4(),
            from: _email,
            details: _details,
            timestamp: moment(new Date()).format(format)
        }
        const updateCarpool = await eventCollection.updateOne(
            {_id: _eventId, "carpools._id": _poolId},
            { $push: {"carpools.$.comments": newComment} }
        )
        if (updateCarpool.modifiedCount === 0) throw `could not createComment successfully`
        return { commentCreated: true }
    },
    async getComment(eventId, poolId, commentId) {
        let _eventId = checkId(eventId)
        let _poolId = checkId(poolId)
        let _commentId = checkId(commentId)
        const eventCollection = await events()
        const event = await eventCollection.findOne({_id: _eventId})
        if (!event) throw `getComment event ${_eventId} does not exist.`
        const carpool = event.carpools.find(carpool => carpool._id === _poolId)
        if (!carpool) throw `getComment carpool ${_poolId} does not exist`
        const comment = carpool.comments.find(comment => comment._id === _commentId)
        if (!comment) throw `getComment comment ${commentId} does not exist`
        return comment
    },
    async getAllComments(eventId, poolId) {
        let _eventId = checkId(eventId)
        let _poolId = checkId(poolId)
        const eventCollection = await events()
        const event = await eventCollection.findOne({_id: _eventId})
        if (!event) throw `getComment event ${_eventId} does not exist.`
        const carpool = event.carpools.find(carpool => carpool._id === _poolId)
        if (!carpool) throw `getComment carpool ${_poolId} does not exist`
        const comments = carpool.comments
        if (!comments) throw `getAllComments could not get comments`
        return comments
    },
    async deleteComment(eventId, poolId, commentId) {
        let _eventId = checkId(eventId)
        let _poolId = checkId(poolId)
        let _commentId = checkId(commentId)
        const eventCollection = await events()
        const event = await eventCollection.findOne({_id: _eventId})
        if (!event) throw `getComment event ${_eventId} does not exist.`
        const carpool = event.carpools.find(carpool => carpool._id === _poolId)
        if (!carpool) throw `getComment carpool ${_poolId} does not exist`
        const comment = carpool.comments.find(comment => comment._id === _commentId)
        if (!comment) throw `getComment comment ${commentId} does not exist`
        const newComments = carpool.comments.filter((x) => x._id !== _commentId)
        const updateCarpool = await eventCollection.updateOne(
            {_id: _eventId, "carpools._id": _poolId},
            { $set: {"carpools.$.comments": newComments} }
        )
        if (updateCarpool.modifiedCount === 0) throw `could not deleteComment successfully`
        return { commentDeleted: true }
    },
    //we don't need to code this, but here if we do
    async updateComment(eventId, poolId, commentId, details) {
        let _eventId = checkId(eventId)
        let _poolId = checkId(poolId)
        let _commentId = checkId(commentId)
        let _details = checkString(details)
        const eventCollection = await events()
        const event = await eventCollection.findOne({_id: _eventId})
        if (!event) throw `getComment event ${_eventId} does not exist.`
        const carpool = event.carpools.find(carpool => carpool._id === _poolId)
        if (!carpool) throw `getComment carpool ${_poolId} does not exist`
        const comment = carpool.comments.find(comment => comment._id === _commentId)
        if (!comment) throw `getComment comment ${commentId} does not exist`
        const format = "MM/DD/YYYY HH:MM:SS"
        const newComment = {
            details: _details,
            timestamp: moment(new Date()).format(format)
        }
        const updateComment = await eventCollection.updateOne(
            {_id: _eventId, "carpools._id": _poolId, "carpool.$.comments._id": _commentId},
            {$set: newComment}
        )
        if (updateComment.modifiedCount === 0) throw `could not updateComment successfully`
        return { updatedComment: true }
    }
}