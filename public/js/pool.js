(async function ($) {
    const checkString = (str, fieldName = 'input', additionalCheck = str => true) => {
        if (!str) throw `${fieldName} is required`
        if (typeof str !== 'string') throw `${fieldName} is not a string`
        const trimmed = str.trim()
        if (trimmed.length < 1) throw `${fieldName} cannot be empty spaces`
        if (!additionalCheck(trimmed)) throw `${fieldName} is invalid`
        return trimmed
    }
    const DOM = {
        div: '<div></div>',
        span: '<span></span>',
        a: '<a></a>',
        input: '<input/>',
        label: '<label></label>',
    }
    let _poolId = $('#poolId').val()
    let user = $('#userEmail').val()
    let comments = await $.get(`/pool/${_poolId}/comments`)
    let commentList = $('#comments-list')
    let createCommentForm = $('#create-comment-form')
    let createCommentDescription = $('#createCommentDescription')

    let leaveBtn = $('#leave-btn'),
        joinBtn = $('#join-btn')
    
    if (leaveBtn) {
        leaveBtn.on('click', async (e) => {
            e.preventDefault()
            try {
                const response = await $.post(`${_poolId}/leave`)
                if (response.success) {
                    location.reload()
                }
            } catch (e) {
                alert(e)
            }
        })
    }
    if (joinBtn) {
        joinBtn.on('click', async (e) => {
            e.preventDefault()
            try {
                const response = await $.post(`${_poolId}/join`)
                if (response.success) {
                    location.reload()
                }
            } catch (e) {
                alert(e)
            }
        })
    }
        
    let commentError = document.getElementById('comment-error')

    const createError = (div, error) => {
        // in case error had another error in it already; clear all children
        div.replaceChildren()
        div.hidden = false
        const clearButton = document.createElement('span')
        clearButton.className = 'fa-solid fa-xmark'
        clearButton.id = 'close-error'
        const clearError = () => {
            div.replaceChildren()
            div.hidden = true
        }
        clearButton.addEventListener('click', clearError)
        div.innerHTML = `${error}`
        div.appendChild(clearButton)
    }

    const createComments = (comment) => {
        const commentContainer = $(DOM.div, { 'class': 'comment-container' })
        const detailContainer = $(DOM.span, { 'class': 'comment-detail-container' })
        const userIcon = $(DOM.span, { 'class': 'fa fa-user'})
        // <i class="fa fa-user" aria-hidden="true"></i>
        const commentUser = $(DOM.span, { 'class': 'comment-user' }).text(comment.from)
        const commentDescription = $(DOM.span, { 'class': 'comment-description' }).text(comment.details)
        if (comment.from === user) {
            const removeButton = $(DOM.span, { 'class': 'deleteComment fa-solid fa-xmark'})
            removeButton.on('click', async (e) => {
                e.preventDefault()
                try {
                    // insert remove button shit here
                    const commentId = comment._id
                    const reqBody = {
                        commentId: commentId
                    }
                    const response = await $.post(`/pool/${_poolId}/deleteComment`, reqBody)
                    console.log(`response: ${response}`)
                    if (response.success) {
                        comments = await $.get(`/pool/${_poolId}/comments`)
                        populateComments(comments)
                    }
                } catch (error) {
                    createError(commentError, "Unable to remove")
                }
            })
            commentContainer.prepend(removeButton)
        }
        detailContainer.append([userIcon, commentUser, commentDescription])
        commentContainer.append(detailContainer)
        
        return commentContainer
    }
    const populateComments = (comments) => {
        commentList.empty()
        for (const comment of comments) {
            const newComment = createComments(comment)
            commentList.append(newComment)
        }
    }

    createCommentForm.on('submit', async (e) => {
        e.preventDefault()
        try {
            let description = checkString(createCommentDescription.val())
            const reqBody = {
                description: description
            }
            const response = await $.post(`/pool/${_poolId}/createComment`, reqBody)
            if (response.success) {
                createCommentDescription.val('')
                comments = await $.get(`/pool/${_poolId}/comments`)
                populateComments(comments)
            }
        } catch (error) {
            createError(commentError, `Error: ${error}`)
        }
    })
    // populate comments
    populateComments(comments)

    

})(window.jQuery);
