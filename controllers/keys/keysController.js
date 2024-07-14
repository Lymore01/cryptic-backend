// req.body = {word1:"milka", word2:"john"}
const generateKeys = require("../../utils/createPrivateKeys")

exports.createKeys = async (req, res) =>{
    try {
        const {phrase} = req.body
        const keysGenerated = generateKeys(phrase)
        res.status(200).json(keysGenerated)
    } catch (error) {
        res.status(400).json(error)
    }
}