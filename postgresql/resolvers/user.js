const {db} = require('../')

const user = {
  Users: async () => {
    try {
      return await db.User.findAll()
    } catch (error) {
      
    }
  }
}

module.exports = user
