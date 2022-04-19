const emailValidator = require('email-validator')
const { v4: uuidv4, validate } = require('uuid');
const { phone } = require('phone')
const { ObjectId } = require('mongodb')
const US_States = require('../const/USStates.json')

module.exports = {
  checkString(str, fieldName = 'input', additionalCheck = str => true) {
    if (! str) throw `${fieldName} does not exist`
    if (typeof str !== 'string') throw `${fieldName} is not a string`
    const trimmed = str.trim()
    if (trimmed.length < 1) throw `${fieldName} cannot be empty spaces`
    if (! additionalCheck(trimmed)) throw `${fieldName} is invalid`
    return trimmed
  },
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
    return this.checkString(firstName, 'First Name')
  },
  checkLastName(lastName) {
    return this.checkString(lastName, 'Last Name')
  },
  checkPhone(phoneNum) {
    const validate = phone(phoneNum)
    if (! validate.isValid) throw `Phone number is invalid`
    return validate.phoneNumber
  },
  checkVenmo(venmo) {
    return this.checkString(venmo, 'Venmo username')
  },
  checkStreet(street) {
    return this.checkString(street, 'Street')
  },
  checkCity(city) {
    return this.checkString(city, 'City')
  },
  checkState(state) {
    const curr = this.checkString(state, 'State')
    if (US_States.state === undefined) throw `${state} does not exist in the United States`
    return state
  },
  checkZipcode(zipcode) {
    return this.checkString(zipcode, 'Zipcode', (str) => {
      return str.length === 5
    })
  },
  checkAddress(address) {
    if (! address) throw `Address does not exist`
    const validatedAddress = {
      _id: uuidv4(),
      address: this.checkStreet(address.street),
      city: this.checkCity(address.city),
      state: this.checkState(address.state),
      zipcode: this.checkZipcode(address.zipcode)
    }
    return validatedAddress
  },
  checkIsDriver(isDriver) {
    if (! isDriver || typeof isDriver !== 'boolean') throw `isDriver does not exist`
    return isDriver
  },
  //date validation modified from jordan's lab 8
  //https://stackoverflow.com/questions/11591854/format-date-to-mm-dd-yyyy-in-javascript
  checkDate(date) {
    if (!date) throw `Error: date ${date} must be supplied`; 
    //check if date is in acceptable format
    date = new Date(date);
    // https://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript
    if (date instanceof Date && isNaN(date.getTime())) { throw `Error: invalid date ${date}`; }
    let year = date.getFullYear();
    let month = (1 + date.getMonth()).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
    return month + '/' + day + '/' + year;
  },
  // checks if the time is in military format
  checkTime(time) {
    if (!time) throw `Error: time must be supplied`
    //modified from https://www.geeksforgeeks.org/how-to-validate-time-in-24-hour-format-using-regular-expression/
    const regex = "([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]"
    time = time.match(regex)
    if (!time) throw `Error: ${time} is not in a valid military time format`
    return time
  },
  checkCapacity(capacity) {
    if (!capacity) throw `Error: capacity must be supplied`
    if (typeof capacity !== 'number' || isNaN(capacity)) throw `Error: ${capacity} must be a number`
    if (capacity < 1) throw `Error: cannot have capacity ${capacity} < 1`
    return capacity
  },
  checkId(id) {
    if (!id) throw `Error: id must be supplied`
    if (!validate(id)) throw `Error: ${id} is not a valid uuid`
    return id
  }
}