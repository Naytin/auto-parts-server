const {db} = require('../')

const user = {
  Users: async () => {
    try {
      return await db.User.findAll()
    } catch (error) {
      throw error
    }
  }
}

module.exports = user
