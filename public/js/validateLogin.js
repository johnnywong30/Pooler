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


let errorDiv = document.getElementById('client-error')
let loginForm = document.getElementById('login-form')
let email = document.getElementById('email')
let password = document.getElementById('password')

const inputs = [email, password] 
for (const element of inputs) {
    element.required = false
}

const submittable = {
    email: false,
    password: false,
}

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

password.addEventListener('change', (e) => {
    e.preventDefault()
    const input = e.target.value 
    try {
        const checked = checkPassword(input)
        if (checked) {
            submittable.password = true
            resolveError()
        }
    } catch (e) {
        createError(e)
        submittable.password = false
    }
})

loginForm.addEventListener('submit', (e) => {
    try {
        for (const [key, value] of Object.entries(submittable)) {
            if (! value) throw `${key.charAt(0).toUpperCase() + key.slice(1)} is invalid`
        }
    } catch (error) {
        e.preventDefault()
        createError(error) 
    }
})