let serverError = document.getElementById('server-error')
setTimeout(() => {
    if (serverError !== null) {
        serverError.setAttribute('hidden', true) 
        serverError.replaceChildren()
    }
}, 1500)