const { checkId, checkString, checkEmail, checkPassword, checkFirstName, checkLastName, checkPhone, checkVenmo, checkAddress, checkIsDriver } = require("../misc/validate");
const { users } = require("../config/mongoCollections");

module.exports = {
    async createComment(userId, description, timestamp) {

    },
    async getComment(commentId, userId) {

    },
    async deleteComment(commentId, userId) {

    },
    async updateComment(commentId, userId, description, timestamp) {

    }
}