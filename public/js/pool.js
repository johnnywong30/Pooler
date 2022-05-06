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
    const createComments = (comment) => {
        const commentContainer = $(DOM.div, { 'class': 'comment-container' })
        const detailContainer = $(DOM.span, { 'class': 'comment-detail-container' })
        const commentUser = $(DOM.span, { 'class': 'comment-user' }).text(comment.from)
        const commentDescription = $(DOM.span, { 'class': 'comment-description' }).text(comment.details)
        if (comment.from === user) {
            const removeButton = $(DOM.span, { 'class': 'fa-solid fa-xmark'})
            removeButton.on('click', async (e) => {
                e.preventDefault()
                try {
                    // insert remove button shit here
                    const commentId = comment._id

                } catch (error) {
                    console.log(error)
                }
            })
            commentContainer.append(removeButton)
        }
        detailContainer.append([commentUser, commentDescription])
        commentContainer.prepend(detailContainer)
        return commentContainer
    }
    const populateComments = (comments) => {
        commentList.empty()
        for (const comment of comments) {
            const newComment = createComments(comment)
            commentList.append(newComment)
        }
    }

    let createCommentForm = $('#create-comment-form')
    let createCommentDescription = $('createCommentDescription')
    createCommentForm.on('submit', async (e) => {
        e.preventDefault()
        try {
            let description = checkString(createCommentDescription.value)
            
        } catch (error) {
            console.log(error)
        }
    })
    // populate comments
    populateComments(comments)
})(window.jQuery);
