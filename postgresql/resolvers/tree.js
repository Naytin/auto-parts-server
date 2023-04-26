const {db} = require('../')
const {getData} = require('../../utils')

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
  },
  updateTree: async () => {
    try {
      const categories = await db.Part.findAll({attributes: ['category']});
      const tries = await getData('/usr/local/lsws/Example/html/node/auto-parts-server/data/tree.json', false)
      // const tries = await getData('/data/tree.json')
      const c = categories.filter(r => Boolean(r.category))
        .map(a => a.category)
        .flat()
        
      const added = {}
      const tree = []

      function buildTree(node) {
        if (node && !added[node.id]) {
          added[node.id] = node
          tree.push(node)
          const parent = tries.find(a => a.id === node.parentid)
          buildTree(parent)
        }
      }

      const result = Array.from(new Set(c))
      result.forEach(t => {
        const r = tries.find(a => a.id === t)
        if (r) {
          buildTree(r)
        } else {
          console.log('not found -', t)
        }
      })

      const t = await db.Tree.findOne({where: {id: 1}})

      if (t) {
        await db.Tree.update({tree: Object.values(added)},{where: {id: 1}})
      } else {
        await db.Tree.create({tree: Object.values(added)})
      }
      console.log('tree updated')
    } catch (error) {
      throw error
    }
  }
}

module.exports = tree
