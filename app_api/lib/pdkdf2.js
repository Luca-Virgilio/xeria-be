// database connection
const mongoose = require('mongoose');
const SaltDB = mongoose.model('Salt');

const crypto = require('crypto');
const { promisify } = require(`util`);

const randomBytesFy = promisify(crypto.randomBytes);
const pbkdf2 = promisify(crypto.pbkdf2);

const createSalt = async () => {
    try {
        const flag = await SaltDB.find();
        
        if (flag.length == 0) {
            salt = await randomBytesFy(16);
            salt = salt.toString('hex');
            SaltDB.create({
                value: salt
            }, (err, res) => {
                if (err) throw err;
                console.log('create salt', salt);
            });
        }

    } catch (error) {
        console.log(error);
    }

}

const getSalt = async () => {
    try {
        const salt = await SaltDB.find();
        return salt[0].value;
    } catch (error) {
        console.log(error);
    }
}

// pbkdf2 hash -promisify version
const createHash = async (data, salt) => {
    try {
        const hash = await pbkdf2(data, salt, 100, 512, 'sha512');
        return hash.toString('hex');
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    createHash,
    createSalt,
    getSalt,
    randomBytesFy
}