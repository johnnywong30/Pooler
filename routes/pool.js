const express = require("express");
const { events, carpools, users, history, comments } = require("../data");
const US_States = require("../const/USStates.json");
const router = express.Router();
const xss = require("xss");
const { checkId, checkEmail, checkCapacity, checkDateTime, checkString } = require("../misc/validate");

router.route("/").get(async (req, res) => {
    return res.redirect("/events");
});

router.route("/create/pool").post(async (req, res) => {
    if (req.session.user) {
        // validate params
        const { eventId, driverId, capacity, departureTime } = req.body;
        let _eventId, _driverId, _capacity, _departureTime
        try {
            _eventId = checkId(xss(eventId));
            _driverId = checkId(xss(driverId));
            const cap = typeof capacity === 'number' ? capacity : xss(capacity)
            _capacity = checkCapacity(cap); // is a number
            _departureTime = checkDateTime(xss(departureTime));
        } catch (e) {
            console.log(e);
            res.statusMessage = e;
            return res.status(400).json({ errorMsg: e }).end();
        }
        //create the pool
        try {
            const pool = await carpools.createPool(_eventId, _driverId, _departureTime, _capacity);
            await history.addToHistory(_driverId, _eventId, pool._id);
            return res.json({ success: true, poolId: pool._id }).end();
        } catch (e) {
            console.log(e);
            res.statusMessage = e;
            return res.status(404).json({ errorMsg: e }).end();
        }
    } else {
        return res.redirect("/");
    }
});

router.route("/:id").get(async (req, res) => {
    if (req.session.user) {
        // validate
        try {
            req.session.user.email = checkEmail(xss(req.session.user.email))
            req.params.id = checkId(xss(req.params.id))
        } catch (e) {
            return res.status(400).json({ error: e})
        }
        try {
            const email = req.session.user.email
            const _poolId = req.params.id
            const user = await users.getUser(email);
            const event = await events.getEventByPoolId(_poolId);
            const pool = await carpools.getPool(_poolId);
            const _driver = await users.getUserById(pool.driver);
            const _driverName = `${_driver.firstName} ${_driver.lastName}`;
            const _departureTime = pool.departureTime;
            const _capacity = pool.capacity;
            let _memberData = pool.members.slice();
            for (let i = 0; i < _memberData.length; i++) {
                try {
                    _memberData[i] = await users.getUserById(_memberData[i]);
                } catch (e) {
                    throw (`No such member with ID ${_memberData[i]}`);
                }
            }
            const _numMembers = _memberData.length;
            const _comments = pool.comments;
            const _eventName = event.name;
            const _isUserInPool = pool.members.indexOf(user._id) > -1;
            const _eventID = event._id;
            const args = {
                _poolId,
                _driverName,
                _departureTime,
                _capacity,
                _memberData,
                _numMembers,
                _comments,
                _eventName,
                _isUserInPool,
                _eventID,
                authenticated: true,
                email: user.email,
            };
            return res.render("templates/pool", args);
        } catch (e) {
            const states = Object.keys(US_States);
            const templateData = {
                error: e,
                states: states,
            };
            return res.status(400).render("templates/error", templateData);
        }
    } else {
        return res.redirect('/')
    }
});

router.route("/list/:id").get(async (req, res) => {
    if (req.session.user) {
        try {
            const _poolId = checkId(xss(req.params.id));
            const importCarpools = await carpools.getPools(_poolId);
            return res.json(importCarpools);
        } catch (e) {
            console.log(e);
            return res.status(500).json({ error: e });
        }
    } else {
        res.redirect("/");
    }
});

router.route("/currentUser/data").get(async (req, res) => {
    if (req.session.user) {
        try {
            const email = checkEmail(xss(req.session.user.email))
            const user = await users.getUser(email);
            return res.json(user);
        } catch (e) {
            console.log(e);
            return res.status(500).json({ error: e });
        }
    } else {
        res.redirect("/");
    }
});

router.route("/user/:id").get(async (req, res) => {
    if (req.session.user) {
        try {
            const id = checkId(xss(req.params.id))
            const user = await users.getUserById(id);
            return res.json(user);
        } catch (e) {
            console.log(e);
            return res.status(500).json({ error: e });
        }
    } else {
        res.redirect("/");
    }
});

router.route("/:id/join").post(async (req, res) => {
    if (req.session.user) {
        try {
            const email = checkEmail(xss(req.session.user.email));
            const _poolId = checkId(xss(req.params.id));
            const user = await users.getUser(email);
            const event = await events.getEventByPoolId(_poolId);
            const pool = await carpools.getPool(_poolId);
            await carpools.addPooler(event._id, pool._id, user._id);
            // add event to history
            await history.addToHistory(user._id, event._id, pool._id);
            return res.json({ success: true })
        } catch (e) {
            return res.status(400).json({ error: e })
        }
    } else {
        return res.redirect('/')
    }

});

router.route("/:id/leave").post(async (req, res) => {
    try {
        const email = checkEmail(xss(req.session.user.email));
        const _poolId = checkId(xss(req.params.id));
        const user = await users.getUser(email);
        const event = await events.getEventByPoolId(_poolId);
        const pool = await carpools.getPool(_poolId);
        await carpools.deletePooler(event._id, pool._id, user._id);
        await history.removeFromHistory(user._id, event._id, pool._id);
        return res.json({ success: true })
    } catch (e) {
        return res.status(400).json({ error: e })
    }
});

router
    .route('/:id/updateCapacity')
    .post(async (req, res) => {
        if (req.session.user) {
            const { capacity } = req.body
            try {
                const email = checkEmail(xss(req.session.user.email))
                const _poolId = checkId(xss(req.params.id))
                const user = await users.getUser(email)
                const val = typeof capacity === 'number' ? capacity : xss(capacity)
                const cap = checkCapacity(val)
                const pool = await carpools.getPool(_poolId)
                if (pool.driver !== user._id) throw 'Only the driver can edit capacity'
                await carpools.updateCapacity(_poolId, cap)
                return res.json({success: true})
            } catch (e) {
                console.log(e)
                return res.status(400).json({ error: e })
            }
        }
        else {
            return res.redirect('/')
        }
    })

    router
    .route('/:id/updateDepartureTime')
    .post(async (req, res) => {
        if (req.session.user) {
            const { departureTime } = req.body
            try {
                const email = checkEmail(xss(req.session.user.email))
                const _poolId = checkId(xss(req.params.id))
                const user = await users.getUser(email)
                const _departureTime = checkDateTime(xss(departureTime));
                const pool = await carpools.getPool(_poolId)
                if (pool.driver !== user._id) throw 'Only the driver can edit departure time'
                await carpools.updateDepartureTime(_poolId, _departureTime)
                return res.json({success: true})
            } catch (e) {
                console.log(e)
                return res.status(400).json({ error: e })
            }
        }
        else {
            return res.redirect('/')
        }
    })

router.route('/:id/comments').get(async (req, res) => {
    if (req.session.user) {
        //validate
        try {
            req.params.id = checkId(xss(req.params.id))
        } catch (e) {
            return res.status(400).json({ error: e })
        }
        // fetch all comments
        try {
            const _poolId = req.params.id
            const event = await events.getEventByPoolId(_poolId)
            const commentList = await comments.getAllComments(event._id, _poolId)
            return res.status(200).json(commentList)
        } catch (e) {
            return res.status(404).json({ error: e });
        }
    }
})

router
    .route('/:id/createComment')
    .post(async (req, res) => {
        let { description } = req.body
        // validate
        try {
            req.session.user.email = checkEmail(xss(req.session.user.email))
            req.params.id = checkId(xss(req.params.id))
            description = checkString(xss(description))
        } catch (e) {
            return res.status(400).json({ error: e })
        }
        // check if user, event, and pool exist. also check if it's valid comment. then create it
        try {
            const email = req.session.user.email
            const _poolId = req.params.id
            const user = await users.getUser(email)
            const event = await events.getEventByPoolId(_poolId)
            const pool = await carpools.getPool(_poolId)
            const comment = await comments.createComment(event._id, _poolId, email, description)
            return res.status(200).json({ success: true, commentId: comment._id })
        } catch (e) {
            console.log(e)
            res.statusMessage = e;
            return res.status(404).json({ errorMsg: e }).end()
        }
    })

router
    .route('/:id/deleteComment')
    .post(async (req, res) => {
        let { commentId } = req.body
        // validate
        try {
            commentId = checkId(xss(commentId))
            req.params.id = checkId(xss(req.params.id))
        } catch (e) {
            return res.status(400).json({ error: e })
        }
        // delete the comment
        try {
            const _poolId = req.params.id
            const event = await events.getEventByPoolId(_poolId)
            const comment = await comments.deleteComment(event._id, _poolId, commentId)
            return res.status(200).json({ success: true, commentDeleted: comment })
        } catch (e) {
            console.log(e)
            res.statusMessage = e;
            return res.status(404).json({ errorMsg: e }).end()
        }
    })
module.exports = router;
