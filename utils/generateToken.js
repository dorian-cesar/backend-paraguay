require("dotenv").config()
const JWT = require("jsonwebtoken");

function generateToken() {
    try {
        const token = JWT.sign({ username: process.env.USER }, process.env.SECRET);
        return token;
    } catch (error) {
        console.error('ERROR:::', error);
    }
}

console.log(generateToken())

module.exports = { generateToken };