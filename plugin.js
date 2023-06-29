"use strict";
// function rgbToHex(r: number, g: number, b: number): string {
//   // Проверяем, что значения находятся в диапазоне от 0 до 255
//   if ([r, g, b].some((value) => value < 0 || value > 255)) {
//     throw new Error("Недопустимые значения RGB.");
//   }
//   // Преобразуем значения в шестнадцатеричный формат
//   const hexR = r.toString(16).padStart(2, "0");
//   const hexG = g.toString(16).padStart(2, "0");
//   const hexB = b.toString(16).padStart(2, "0");
//   // Собираем шестнадцатеричный код цвета
//   const hexColor = `#${hexR}${hexG}${hexB}`;
//   return hexColor;
// }
function getStyles() {
    const selectedElem = figma.currentPage.selection[0];
    const elem = selectedElem;
    const { characters: text, type, width, height, x, y, fontSize: size, fills, fontWeight: weight, fontName, letterSpacing: letSpace } = elem;
    // Font family & Style
    const fontProp = fontName;
    const name = fontProp.family;
    const style = fontProp.style;
    // Letter Spacing
    const spacingProp = letSpace;
    const letterSpacing = spacingProp.value;
    // Проверка text decoration
    let isUnderline = false;
    let isStroked = false;
    if (elem.textDecoration === 'STRIKETHROUGH') {
        isUnderline = false;
        isStroked = false;
    }
    if (elem.textDecoration === 'UNDERLINE') {
        isUnderline = true;
        isStroked = false;
    }
    const textInfo = {
        text,
        type,
        size: {
            width,
            height,
            x,
            y,
        },
        style: {
            font: {
                size,
                weight,
                isStroked,
                isUnderline,
                name,
                style
            },
            letterSpacing,
        }
    };
    console.log();
    figma.closePlugin();
}
getStyles();
