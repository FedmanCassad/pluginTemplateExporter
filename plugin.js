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
    const elem = selectedElem;
    let { characters: text, type, width, height, x, y, fontSize: size, fills, fontWeight: weight, fontName, letterSpacing: letSpace, lineHeight, effects, locked: isLocked, opacity, rotation, textAlignHorizontal: alignX, textAlignVertical: alignY } = elem;
    //
    x = Number(x.toFixed(1));
    y = Number(y.toFixed(1));
    //blur
    let blurProp = 0;
    for (const item of effects) {
        if (item.type === 'LAYER_BLUR') {
            blurProp = item.radius;
        }
    }
    // Font family & Style
    const fontProp = fontName;
    const name = fontProp.family;
    const style = fontProp.style;
    // Letter Spacing
    const spacingProp = letSpace;
    const lineHeightProp = lineHeight;
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
            letterSpacing: spacingProp,
            lineSpacing: lineHeightProp,
            blur: blurProp,
            isLocked,
            opacity,
            rotation,
        }
    };
    console.log(fills);
    figma.closePlugin();
}
getStyles();
