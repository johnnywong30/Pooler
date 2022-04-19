const { checkEmail, checkPassword, checkFirstName, checkLastName, checkPhone, checkVenmo, checkAddress, checkIsDriver } = require('../misc/validate')
const { users } = require('../config/mongoCollections')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid');
// uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
const saltRounds = 10

module.exports = {
  async createUser(email, password, firstName, lastName, phone, venmo, address, isDriver) {
    // Initial checks
    const _email = checkEmail(email)
    const _pass = checkPassword(password)
    const _firstName = checkFirstName(firstName)
    const _lastName = checkLastName(lastName)
    const _phone = checkPhone(phone)
    const _venmo = checkVenmo(venmo)
    const _address = checkAddress(address)
    const _isDriver = checkIsDriver(isDriver)
    // Check if account exists
    const collection = await users()
    const account = await collection.findOne({ email: email })
    if (account !== null) throw `Account with email ${email} exists already`
    // Create account
    const saltedPass = await bcrypt.hash(_pass, saltRounds)
    const newUser = {
      _id: uuidv4(),
      firstName: _firstName,
      lastName: _lastName,
      email: _email,
      password: saltedPass,
      phone: _phone,
      venmo: _venmo,
      address: _address,
      driver: _isDriver,
      passenger: true,
      history: []
    }
    // Register account 
    const insertInfo = await collection.insertOne(newUser)
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Could not register user'
    // On success
    return {
      userRegistered: true
    }
  },
  async checkUser(email, password) {
    // Initial checks 
    const _email = checkEmail(email)
    const _password = checkPassword(password)
    // Check if account exists
    const collection = await users()
    const account = await collection.findOne({ email: _email });
    if (account === null) throw `Either the username or password is invalid`
    // Authenticate
    let match = false
    try {
      match = await bcrypt.compare(_password, account.password)
    } catch (e) {
      // no op
    }
    // Not authenticated
    if (! match) throw `Either the username or password is invalid`
    return {
      authenticated: true
    }
  }
}
