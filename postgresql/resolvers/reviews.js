const {db} = require('../')

const reviews = {
  getReviews: async () => {
    try {
      return await db.Reviews.findAll({where: {status: true}})
    } catch (error) {
      throw new Error(error)
    }
  },
  createReview: async (fields) => {
    try {
      return await db.Reviews.create({...fields, status: true, created_at: new Date().toUTCString()})
    } catch (error) {
      throw new Error(error)
    }
  },
}

module.exports = reviews