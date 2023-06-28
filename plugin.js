"use strict";
function getStyles() {
    const selectedElem = figma.currentPage.selection[0];
    const rectangle = selectedElem;
    const backgroundColor = rectangle.backgrounds[0];
    console.log(backgroundColor);
    figma.closePlugin();
}
getStyles();
