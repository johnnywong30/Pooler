const emailValidator = require('email-validator')
const { v4: uuidv4 } = require('uuid');
const { phone } = require('phone')
const { ObjectId } = require('mongodb')
const US_States = require('../const/USStates.json')

const checkString = (str, fieldName = 'input', additionalCheck = str => true) => {
    if (! str) throw `${fieldName} does not exist`
    if (typeof str !== 'string') throw `${fieldName} is not a string`
    const trimmed = str.trim()
    if (trimmed.length < 1) throw `${fieldName} cannot be empty spaces`
    if (! additionalCheck(trimmed)) throw `${fieldName} is invalid`
    return trimmed
}

module.exports = {
  checkEmail(email) {
    if (!email) throw 'email does not exist'
    if (typeof email !== 'string') throw 'email is not a string'
    const trimmed = email.trim()
    if (trimmed.length < 1) throw 'email cannot be empty spaces'
    if (! emailValidator.validate(trimmed)) throw 'email is invalid'
    return trimmed
  },
  checkPassword(password) {
    if (!password) throw 'password does not exist'
    if (typeof password !== 'string') throw 'password is not a string'
    const trimmed = password.trim()
    if (trimmed.length < 1) throw 'password cannot be empty spaces'
    // regex source: https://stackoverflow.com/a/16334856
    const regex = /^\S*$/
    if (!regex.test(trimmed)) throw 'password cannot contain spaces'
    if (trimmed.length < 6) throw 'password must be at least 6 characters long'
    return trimmed
  },
  checkFirstName(firstName) {
    return checkString(firstName, 'First Name')
  },
  checkLastName(lastName) {
    return checkString(lastName, 'Last Name')
  },
  checkPhone(phoneNum) {
    const validate = phone(phoneNum)
    if (! validate.isValid) throw `Phone number is invalid`
    return validate.phoneNumber
  },
  checkVenmo(venmo) {
    return checkString(venmo, 'Venmo username')
  },
  checkStreet(street) {
    return checkString(street, 'Street')
  },
  checkCity(city) {
    return checkString(city, 'City')
  },
  checkState(state) {
    const curr = checkString(state, 'State')
    if (US_States[state] === undefined) throw `${state} does not exist in the United States`
    return state
  },
  checkZipcode(zipcode) {
    return checkString(zipcode, 'Zipcode', (str) => {
      return str.length === 5 && /^\d+$/.test(str)
    })
  },
  checkAddress(address) {
    if (! address) throw `Address does not exist`
    const validatedAddress = {
      _id: uuidv4(),
      address: module.exports.checkStreet(address.address),
      city: module.exports.checkCity(address.city),
      state: module.exports.checkState(address.state),
      zipcode: module.exports.checkZipcode(address.zipcode)
    }
    return validatedAddress
  },
  checkIsDriver(isDriver) {
    if (isDriver === undefined) throw `isDriver does not exist`
    return isDriver
  }


}