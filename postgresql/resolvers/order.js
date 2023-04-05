const bcrypt = require('bcryptjs')
const {db} = require('../')
const { passwordGenerator } = require('../../utils');

const order = {
  createOrder: async (fields) => {
    try {
      let user = await db.User.findOne({where: {email: fields.email}})

      if (!user) {
        const newPassword = passwordGenerator()
        
        user = await db.User.create({
          phone: fields.phone,
          email: fields.email,
          first_name: fields.first_name,
          password: bcrypt.hashSync(newPassword, 8)
        })
      } 

      const order = await db.Order.create({...fields, created_at: new Date().toUTCString(), user_id: user.id, status: 'pending'})

      return order.id
    } catch (error) {
      
    }
  },
  Orders: async () => {
    try {
      return await db.Order.findAll()
    } catch (error) {
      
    }
  },
  ChangeStatus: async (fields) => {
    try {
      return await db.Order.update({status: fields.status},{where: {id: fields.id}})
    } catch (error) {
      
    }
  },
}

module.exports = order