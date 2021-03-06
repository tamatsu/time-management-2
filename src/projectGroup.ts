export { Model }
export type { ItemGroup }

declare var uuidv4

type Item = string

interface ItemGroup {
  id: string
  items: Item[]
}

class Model {
  items: Item[]
  itemGroups: ItemGroup[]
  draggingGroup: ItemGroup

  constructor() {
    this.items = []
    this.itemGroups = []
    this.draggingGroup = null
  }

  add(item: Item): Model {
    this.items.push(item)
    this.itemGroups.push({
      id: uuidv4(),
      items: [ item ]
    })

    return this
  }

  absorb(base: ItemGroup, target: ItemGroup): Model {
    base.items = base.items.concat(target.items)
    this.itemGroups = this.itemGroups.filter(v => v.id !== target.id)

    return this
  }

  static allowDrop(a: ItemGroup, b: ItemGroup): boolean {
    return a.id !== b.id
  }

  has(item: Item): boolean {
    const found = this.items.find(v => v === item)

    if (found) {
      return true
    }
    else {
      return false
    }

  }
}


function _log(...v) {
  console.log(...v)

  return v[0]
}
