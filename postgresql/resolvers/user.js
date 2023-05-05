const {db} = require('../')

const user = {
  Users: async () => {
    try {
      return await db.User.findAll()
    } catch (error) {
      throw new Error(error)
    }
  }
}

module.exports = user
