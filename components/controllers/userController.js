const User = require('../modals/User')

const createUser = async(req, res) => {
    try {
        const { user, id, password } = req.body
        const userObj = new User({
            user,
            password,
            id,
        })
        await userObj.save()
        res.status(201).json({ message: userObj });
    } catch(error) {
        res.status(500).json({ ...req.body });
    }
}

module.exports = { createUser }