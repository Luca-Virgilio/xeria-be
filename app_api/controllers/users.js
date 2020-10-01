const mongoose = require('mongoose');
const UserDB = mongoose.model('User');

// // hash function
const pdkdf2 = require('../lib/pdkdf2');


const getUsers = async (req, res) => {
    try {
        const users = await UserDB.find();
        return res.status(200).json(users);
    } catch (error) {
        console.log(error);
        return res.status(400).json({ "error": error.message });
    }
}
const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) throw new Error("Id is null or undefined")
        const user = await UserDB.findById(id);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(400).json({ "error": "User not found" });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({ "error": error.message });
    }
}
const createUser = async (req, res) => {
    try {
        const { cf, name } = req.body;
        if (!cf || !name) throw new Error("cf or name is null or undefined")
        const salt = await pdkdf2.getSalt();
        const hash = await pdkdf2.createHash(cf, salt);
        const newUser = await UserDB.create({ cf: hash, name: name });
        res.status(201).json({ "user": newUser });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ "error": error.message });
    }
}


module.exports = {
    getUsers,
    getUser,
    createUser
}