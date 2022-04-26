const { checkId, checkString, checkEmail, checkPassword, checkFirstName, checkLastName, checkPhone, checkVenmo, checkAddress, checkIsDriver, checkDateTime } = require("../misc/validate");
const { users } = require("../config/mongoCollections");
const { v4: uuidv4 } = require("uuid");

module.exports = {
    async createComment(carpoolId, email, details) {
        let _carpoolId = checkId(carpoolId)
        let _email = checkEmail(email)
        let _details = checkString(details)
        // check if user exists
        const collection = await users();
		const account = await collection.findOne({ _id: _userId });
		if (account !== null) throw `Error: createComment with id ${_userId} does not exist.`;
        //create comment
        const newComment = {
            _id: uuidv4(),
            from: _userId,
            details: _details
        }
    },
    async getComment(carpoolId, commentId, email) {

    },
    async deleteComment(carpoolId, commentId, email) {

    },
    async updateComment(carpoolId, commentId, email, description) {

    }
}