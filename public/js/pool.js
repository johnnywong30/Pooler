(async function ($) {
    const checkString = (str, fieldName = 'input', additionalCheck = str => true) => {
        if (!str) throw `${fieldName} is required`
        if (typeof str !== 'string') throw `${fieldName} is not a string`
        const trimmed = str.trim()
        if (trimmed.length < 1) throw `${fieldName} cannot be empty spaces`
        if (!additionalCheck(trimmed)) throw `${fieldName} is invalid`
        return trimmed
    }

    const checkDate = date => {
        if (!date) throw `date ${date} must be supplied`;
        let data = date.split("-");
        if (data.length !== 3) throw `invalid date ${date}`;
        date = [data[1], data[2], data[0]].join("/");
        date = new Date(date);
        // https://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript
        if (date instanceof Date && isNaN(date.getTime())) {
            throw `invalid date ${date}`;
        }
        let year = date.getFullYear();
        let month = (1 + date.getMonth()).toString().padStart(2, "0");
        let day = date.getDate().toString().padStart(2, "0");
        return month + "/" + day + "/" + year;
    };

    // checks if the time is in military format
    const checkTime = time => {
        if (!time) throw `time must be supplied`;
        //modified from https://www.oreilly.com/library/view/regular-expressions-cookbook/9781449327453/ch04s06.html
        const regex = "^(2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$";
        const _time = time.trim();
        let matches = _time.match(regex);
        if (!matches) throw `${_time} is not in a valid military time format`;
        return _time;
    };
    const checkDateTime = dateTime => {
        // might need to do some conversion
        if (!dateTime) throw `date and time must be supplied`;
        let data = dateTime.split("T");
        if (data.length !== 2) throw `invalid date and time ${dateTime}`;
        data[0] = checkDate(data[0]);
        data[1] = checkTime(`${data[1]}:00`);
        return data.join(" ");
    };

    const checkCapacity = capacity => {
        if (!capacity) throw `capacity must be supplied`;
        const _capacity = Number(capacity);
        if (typeof _capacity !== "number" || isNaN(_capacity)) throw `${_capacity} must be a number`;
        if (_capacity < 1) throw `cannot have capacity ${_capacity} < 1`;
        return _capacity;
    };

    const DOM = {
        div: '<div></div>',
        span: '<span></span>',
        a: '<a></a>',
        input: '<input/>',
        label: '<label></label>',
    }
    let _poolId = $('#poolId').val()
    let _eventId = $('#eventId').val()
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
                    if (response.poolDeleted) {
                        const eventPage = `/events/view/${_eventId}`
                        window.location.href = eventPage
                    }
                    else {
                        location.reload()
                    }
                }
            } catch (err) {
                const { responseJSON } = err
                const { errorMsg } = responseJSON
                alert(errorMsg)
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
            } catch (err) {
                const { responseJSON } = err
                const { errorMsg } = responseJSON
                alert(errorMsg)
            }
        })
    }

    let departureBtn = $('#departure-label'),
        capacityBtn = $('#capacity-label'),
        updateModal = $('#update-modal'),
        updateForm = $('#edit-pool-form'),
        closeModalBtn = $('#edit-close-btn'),
        updateInputDiv = $('#edit-input-container')

    let isTime = 0
    let isCapacity = 0

    const createTimeInput = () => {
        updateInputDiv.empty()
        const input = $(DOM.input, { id: 'edit-time', name: 'departureTime', required: true, type: "datetime-local" })
        const label = $(DOM.label, { for: 'edit-time' }).text('Departure Time')
        updateInputDiv.append([input, label])
        isTime = 1
    }

    const createCapacityInput = () => {
        updateInputDiv.empty()
        const input = $(DOM.input, { id: 'edit-capacity', name: 'capacity', required: true, type: "number" })
        const label = $(DOM.label, { for: 'edit-capacity' }).text('Capacity')
        updateInputDiv.append([input, label])
        isCapacity = 1
    }

    const closeModal = () => {
        updateModal.css({
            opacity: 0,
            visibility: 'hidden'
        })
        isTime = 0
        isCapacity = 0
    }

    const openModal = () => {
        updateModal.css({
            opacity: 1,
            visibility: 'visible'
        })
    }

    closeModalBtn.on('click', (e) => {
        e.preventDefault()
        closeModal()
    })

    departureBtn.on('click', (e) => {
        e.preventDefault()
        openModal()
        createTimeInput()
    })

    capacityBtn.on('click', (e) => {
        e.preventDefault()
        openModal()
        createCapacityInput()
    })



    let commentError = document.getElementById('comment-error')
    let updateError = document.getElementById('edit-pool-error')

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
        const userIcon = $(DOM.span, { 'class': 'fa fa-user' })
        // <i class="fa fa-user" aria-hidden="true"></i>
        const commentUser = $(DOM.span, { 'class': 'comment-user' }).text(comment.from)
        const commentDescription = $(DOM.span, { 'class': 'comment-description' }).text(comment.details)
        if (comment.from === user) {
            const removeButton = $(DOM.span, { 'class': 'deleteComment fa-solid fa-xmark' })
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
            console.log(error)
            createError(commentError, `Error: ${error}`)
        }
    })

    updateForm.on('submit', async (e) => {
        e.preventDefault()
        try {
            let response;
            if (isTime) {
                const input = $('#edit-time')[0].value
                const time = checkDateTime(input)
                const body = { departureTime: time }
                response = await $.post(`/pool/${_poolId}/updateDepartureTime`, body)

            }
            if (isCapacity) {
                const input = $('#edit-capacity')[0].value
                const capacity = checkCapacity(input)
                const body = { capacity: capacity }
                response = await $.post(`/pool/${_poolId}/updateCapacity`, body)
            }
            if (response.success) {
                location.reload()
            }
        } catch (err) {
            const { responseJSON } = err
            const { errorMsg } = responseJSON
            createError(updateError, `Error: ${errorMsg}`);
        }
    })

    // populate comments
    populateComments(comments)



})(window.jQuery);
