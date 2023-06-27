"use strict";
function runPlugin() {
    const selectedElements = figma.currentPage.selection.length;
    if (selectedElements === 0) {
        figma.closePlugin('Ни один элемент не выбран');
        return;
    }
    if (selectedElements > 1) {
        figma.closePlugin("Выберите один элеменет");
        return;
    }
    const selectedName = figma.currentPage.selection[0].name;
    function hasSameName(node) {
        return node.name === selectedName;
    }
    const withSameName = figma.currentPage.findAll(hasSameName);
    figma.currentPage.selection = withSameName;
    figma.closePlugin();
}
runPlugin();
