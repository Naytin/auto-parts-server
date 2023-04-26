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
      const tries = await getData('/data/tree.json')
      const c = categories.filter(r => Boolean(r.category))
        .map(a => a.category)
        .flat()
      
      const result = Array.from(new Set(c))
      const tree = result.map(t => {
        const r = tries.find(a => a.id === t)

        if (r) {
          return r
        } else {
          console.log('not found -', t)
        }
      })
      
      const added = {} // объект для отслеживания добавленных ветвей
    
      function addParents(node) {
        if (node.parentid !== 0 && !added[`${node.parentid}${node.id}`]) {
          const parent = tries.find(a => a.id === node.parentid)
          if (!added[`${parent.parentid}${parent.id}`]) { // проверяем, была ли добавлена родительская ветвь
            addParents(parent)
            tree.push(parent)
          }
          added[`${node.parentid}${node.id}`] = true
        }
      }
      
      for (const node of tree) {
        addParents(node)
      }
      const t = await db.Tree.findOne({where: {id: 1}})

      if (t) {
        await db.Tree.update({tree},{where: {id: 1}})
      } else {
        await db.Tree.create({tree})
      }
      console.log('tree updated')
    } catch (error) {
      throw error
    }
  }
}

module.exports = tree
