"use strict";
function rgbToHex(r, g, b) {
    // Приводим значение rgb из процентного в 8-битный
    r = Math.ceil(r * 255);
    g = Math.ceil(g * 255);
    b = Math.ceil(b * 255);
    // Проверяем, что значения находятся в диапазоне от 0 до 255
    if ([r, g, b].some((value) => value < 0 || value > 255)) {
        throw new Error("Недопустимые значения RGB.");
    }
    // Преобразуем значения в шестнадцатеричный формат
    const hexR = r.toString(16).padStart(2, "0");
    const hexG = g.toString(16).padStart(2, "0");
    const hexB = b.toString(16).padStart(2, "0");
    // Собираем шестнадцатеричный код цвета
    const hexColor = `#${hexR}${hexG}${hexB}`;
    return hexColor;
}
function getStyles() {
    const selectedElem = figma.currentPage.selection[0];
    const group = selectedElem;
    let { width, height, x, y, effects, name, backgrounds, strokes } = group;
    // const rectangle = selectedElem as RectangleNode
    // let {fills, width, height, x, y, strokes, effects, name} = rectangle
    console.log(backgrounds, effects, strokes);
    figma.closePlugin();
}
getStyles();
