const {db} = require('../')

const tree = {
  getTreeTranslate: async () => {
    try {
      return await db.Tree.findOne({where: {id: 1}})
    } catch (error) {
      
    }
  },
  updateTreeError: async (notFound) => {
    try {
      const tree = await db.Tree.findOne({where: {id: 1}})
      const res = tree.treeError?.length > 0 ? [...tree.treeError, ...notFound] : notFound
      const treeError = Array.from(new Set(res))
      
      return await db.Tree.update({treeError},{where: {id: 1}})
    } catch (error) {
      
    }
  },
  createTreeTranslate: async (tree) => {
    try {
      return await db.Tree.create({tree, treeError: []})
    } catch (error) {
      
    }
  }
}

module.exports = tree
