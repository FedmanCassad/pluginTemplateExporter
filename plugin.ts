function runPlugin(): void{
  const selectedElements = figma.currentPage.selection.length

  if(selectedElements === 0) {
    figma.closePlugin('Ни один элемент не выбран')
    return
  }

  if(selectedElements > 1) {
    figma.closePlugin("Выберите один элеменет") 
    return
  }

  const selectedName: string = figma.currentPage.selection[0].name

  function hasSameName(node:any):boolean {
    return node.name === selectedName
  }

  const withSameName = figma.currentPage.findAll(hasSameName)
  figma.currentPage.selection = withSameName

  figma.closePlugin()
}

runPlugin()