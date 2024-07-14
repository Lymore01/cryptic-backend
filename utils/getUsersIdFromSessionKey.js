const db = require("../database/config/index")
const sessions = db.collection("session")

const getSessionUser = async(sessionId) =>{
    try {
        if(!sessionId){
            throw new Error("Session id invalid")
        }
        const session = sessions.find({ _id: sessionId })
        if (!session){
            throw new Error("User not found")
        }
        return session
    } catch (error) {
        console.log(error)
    }
}

module.exports = getSessionUser