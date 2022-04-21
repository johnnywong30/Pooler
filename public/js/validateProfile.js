const US_States = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AS": "American Samoa",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "DC": "District Of Columbia",
    "FM": "Federated States Of Micronesia",
    "FL": "Florida",
    "GA": "Georgia",
    "GU": "Guam",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MH": "Marshall Islands",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "MP": "Northern Mariana Islands",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PW": "Palau",
    "PA": "Pennsylvania",
    "PR": "Puerto Rico",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VI": "Virgin Islands",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming"
}
//taken from validateRegister
const checkString = (str, fieldName = 'input', additionalCheck = str => true) => {
    if (!str) throw `${fieldName} is required`
    if (typeof str !== 'string') throw `${fieldName} is not a string`
    const trimmed = str.trim()
    if (trimmed.length < 1) throw `${fieldName} cannot be empty spaces`
    if (!additionalCheck(trimmed)) throw `${fieldName} is invalid`
    return trimmed
}

const checkEmail = (email) => {
    return checkString(email, 'Email', (email) => {
        // simple regex source: https://stackoverflow.com/a/4964766
        return /^\S+@\S+\.\S+$/.test(email)
    })
}
const checkPassword = (password) => {
    return checkString(password, 'Password', (password) => {
        // regex source: https://stackoverflow.com/a/16334856
        const regex = /^\S*$/
        if (!regex.test(password)) throw 'password cannot contain spaces'
        if (password.length < 6) throw 'password must be at least 6 characters long'
        return true
    })
}

const checkFirstName = (firstName) => {
    return checkString(firstName, 'First Name')
}

const checkLastName = (lastName) => {
    return checkString(lastName, 'Last Name')
}

const checkPhone = (phone) => {
    return checkString(phone, 'Phone Number', (phone) => {
        // Source: https://stackoverflow.com/a/16702965
        const regex = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/
        if (!regex.test(phone)) throw 'phone number is invalid'
        return true
    })
}

const checkVenmo = (venmo) => {
    return checkString(venmo, 'Venmo')
}

const checkStreet = (street) => {
    return checkString(street, 'Street')
}

const checkCity = (city) => {
    return checkString(city, 'City')
}

const checkState = (state) => {
    return checkString(state, 'State', (state) => {
        if (US_States[state] === undefined) throw `${state} does not exist in the United States`
        return true
    })
}

const checkZipcode = (zipcode) => {
    return checkString(zipcode, 'Zipcode', (str) => {
        return str.length === 5 && /^\d+$/.test(str)
    })
}

let errorDiv = document.getElementById('client-error')
let editProfileForm = document.getElementById('edit-profile-form')
let email = document.getElementById('email')
let firstName = document.getElementById('firstName')
let lastName = document.getElementById('lastName')
let phone = document.getElementById('phone')
let venmo = document.getElementById('venmo')
let street = document.getElementById('street')
let city = document.getElementById('city')
let zipcode = document.getElementById('zipcode')
let state = document.getElementById('state')
let editBtn = document.getElementById('editBtn')
let saveChangesBtn = document.getElementById('saveChangesBtn')

let list = document.querySelectorAll('.edit-field')
// https://stackoverflow.com/questions/53350019/how-to-use-map-in-nodelist-in-javascript
let editables = Array.from(list).map(elem => elem)

let contentEditable = false;

// reference https://codepen.io/Shokeen/pen/XXggZr for editable fields
editBtn.addEventListener('click', (e) => {
    e.preventDefault()
    if (!contentEditable) {
        contentEditable = !contentEditable
        editables.map((element) => element.disabled = 'false')
        editBtn.disabled = true
        saveChangesBtn.disabled = false
    }
})

const createError = (error) => {
    // in case error had another error in it already; clear all children
    errorDiv.replaceChildren()
    errorDiv.hidden = false
    let col = document.createElement('div')
    col.className = 'col-12 d-flex align-items-center mb-3'
    let alert = document.createElement('div')
    alert.className = 'alert alert-danger alert-dismissible fade show'
    alert.innerHTML = `Error: ${error}`
    col.appendChild(alert)
    errorDiv.appendChild(col)
}

const resolveError = () => {
    errorDiv.replaceChildren()
    errorDiv.hidden = true
}

email.addEventListener('change', (e) => {
    e.preventDefault()
    const input = e.target.value 
    try {
        const checked = checkEmail(input)
        if (checked) {
            submittable.email = true
            resolveError()
        }
    } catch (e) {
        createError(e)
        submittable.email = false
    }
})

firstName.addEventListener('change', (e) => {
    e.preventDefault()
    const input = e.target.value 
    try {
        const checked = checkFirstName(input)
        if (checked) {
            submittable.firstName = true
            resolveError()
        }
    } catch (e) {
        createError(e)
        submittable.firstName = false
    }
})

lastName.addEventListener('change', (e) => {
    e.preventDefault()
    const input = e.target.value 
    try {
        const checked = checkLastName(input)
        if (checked) {
            submittable.lastName = true
            resolveError()
        }
    } catch (e) {
        createError(e)
        submittable.lastName = false
    }
})

phone.addEventListener('change', (e) => {
    e.preventDefault()
    const input = e.target.value 
    try {
        const checked = checkPhone(input)
        if (checked) {
            submittable.phone = true
            resolveError()
        }
    } catch (e) {
        createError(e)
        submittable.phone = false
    }
})

venmo.addEventListener('change', (e) => {
    e.preventDefault()
    const input = e.target.value 
    try {
        const checked = checkVenmo(input)
        if (checked) {
            submittable.venmo = true
            resolveError()
        }
    } catch (e) {
        createError(e)
        submittable.venmo = false
    }
})

street.addEventListener('change', (e) => {
    e.preventDefault()
    const input = e.target.value 
    try {
        const checked = checkStreet(input)
        if (checked) {
            submittable.street = true
            resolveError()
        }
    } catch (e) {
        createError(e)
        submittable.street = false
    }
})

city.addEventListener('change', (e) => {
    e.preventDefault()
    const input = e.target.value 
    try {
        const checked = checkCity(input)
        if (checked) {
            submittable.city = true
            resolveError()
        }
    } catch (e) {
        createError(e)
        submittable.city = false
    }
})

zipcode.addEventListener('change', (e) => {
    e.preventDefault()
    const input = e.target.value 
    try {
        const checked = checkZipcode(input)
        if (checked) {
            submittable.zipcode = true
            resolveError()
        }
    } catch (e) {
        createError(e)
        submittable.zipcode = false
    }
})

state.addEventListener('change', (e) => {
    e.preventDefault()
    const input = e.target.value 
    try {
        const checked = checkState(input)
        if (checked) {
            submittable.state = true
            resolveError()
        }
    } catch (e) {
        createError(e)
        submittable.state = false
    }
})

editProfileForm.addEventListener('submit', (e) => {
    try {
        for (const [key, value] of Object.entries(submittable)) {
            if (! value) throw `${key.charAt(0).toUpperCase() + key.slice(1)} is invalid. Please fill out the form thoroughly.`
        }
    } catch (error) {
        e.preventDefault()
        createError(error) 
    }
})