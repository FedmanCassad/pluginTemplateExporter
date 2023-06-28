function getStyles() {
  const selectedElem = figma.currentPage.selection[0]

  
  const rectangle = selectedElem as FrameNode;
  const backgroundColor = rectangle.backgrounds[0];

  console.log(backgroundColor)

  figma.closePlugin();
}

getStyles();