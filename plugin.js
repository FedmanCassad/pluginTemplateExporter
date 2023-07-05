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
function correctionName(name) {
    return name.split(' ').join('');
}
async function sendPostRequest(url, data) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        return response.json();
    }
    catch (error) {
        console.error('Ошибка при выполнении POST-запроса:', error);
        throw error;
    }
}
async function exportObject(node) {
    const exportOptions = { format: 'PNG' }; // указываются параметры экспорта
    const imageData = await node.exportAsync(exportOptions); // вызывается функция exportAsync для экспорта объекта с заданными параметрами
    const exportData = {
        size: {
            width: node.width,
            height: node.height,
            format: exportOptions.format
        },
        imageData: imageData
    };
    // обработка данных экспорта
    const response = await sendPostRequest('https://logo.finanse.space/api/uploadEncoded', exportData);
    return response.url;
    // console.log(exportData);
}
async function getStyles() {
    const selected = figma.currentPage.selection;
    if (selected.length > 1) {
        figma.closePlugin('Выберите один элемент.');
    }
    if (selected.length === 0) {
        figma.closePlugin('Выделите фрейм логотипа.');
    }
    const select = selected[0];
    if (select && select.type === 'FRAME' && select.children) {
        let layouts = [];
        const children = select.children;
        const frameName = select.name;
        for (const child of children) {
            if (child.type === "TEXT") {
                const elem = child;
                let { characters: text, type, width, height, x, y, fontSize: size, fills, fontWeight: weight, fontName, letterSpacing: letSpace, lineHeight, effects, locked: isLocked, opacity, rotation, textAlignHorizontal: alignX, textAlignVertical: alignY } = elem;
                const colorProp = fills;
                let fontColor = '';
                if (colorProp[0].type === 'SOLID' && colorProp[0].color) {
                    fontColor = rgbToHex(colorProp[0].color.r, colorProp[0].color.g, colorProp[0].color.b);
                }
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
                    isStroked = true;
                }
                if (elem.textDecoration === 'UNDERLINE') {
                    isUnderline = true;
                    isStroked = false;
                }
                let textInfo = {
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
                layouts.push(textInfo);
            }
            ;
            if (child.type === 'FRAME') {
                const elem = child;
                let { width, height, x, y, effects, name, backgrounds, strokes, type, strokeWeight } = elem;
                let colorStrokes = '';
                let borderStyle = '';
                strokes.forEach((paint) => {
                    if (paint.type === "SOLID") {
                        const solidPaint = paint;
                        colorStrokes = rgbToHex(solidPaint.color.r, solidPaint.color.g, solidPaint.color.b);
                        borderStyle = solidPaint.type;
                    }
                });
                let shadowColor = '';
                let shadowOpacity = 0;
                let offsetX = 0;
                let offsetY = 0;
                let shadowType = '';
                effects.forEach((effect) => {
                    if (effect.type === 'DROP_SHADOW') {
                        const dropShadow = effect;
                        shadowColor = rgbToHex(dropShadow.color.r, dropShadow.color.g, dropShadow.color.b);
                        shadowOpacity = Math.ceil(dropShadow.color.a * 100);
                        offsetX = dropShadow.offset.x;
                        offsetY = dropShadow.offset.y;
                    }
                });
                const imageUrl = await exportObject(elem);
                const groupProp = {
                    type,
                    filename: imageUrl,
                    size: {
                        width,
                        height,
                        x,
                        y
                    },
                    style: {
                        border: {
                            color: colorStrokes,
                            style: borderStyle,
                            weight: strokeWeight,
                        },
                        shadow: {
                            color: shadowColor,
                            opacity: shadowOpacity,
                            offsetX,
                            offsetY,
                        }
                    }
                };
                layouts.push(groupProp);
            }
            if (child.type === "RECTANGLE") {
                const elem = child;
                let { width, height, x, y, effects, name, fills, strokes, type, strokeWeight } = elem;
                let colorStrokes = '';
                let borderStyle = '';
                strokes.forEach((paint) => {
                    if (paint.type === "SOLID") {
                        const solidPaint = paint;
                        colorStrokes = rgbToHex(solidPaint.color.r, solidPaint.color.g, solidPaint.color.b);
                        borderStyle = solidPaint.type;
                    }
                });
                let shadowColor = '';
                let shadowOpacity = 0;
                let offsetX = 0;
                let offsetY = 0;
                let shadowType = '';
                let imageUrl = '';
                effects.forEach((effect) => {
                    if (effect.type === 'DROP_SHADOW') {
                        const dropShadow = effect;
                        shadowColor = rgbToHex(dropShadow.color.r, dropShadow.color.g, dropShadow.color.b);
                        shadowOpacity = Math.ceil(dropShadow.color.a * 100);
                        offsetX = dropShadow.offset.x;
                        offsetY = dropShadow.offset.y;
                    }
                });
                const fillProp = fills;
                for (const fill of fillProp) {
                    if (fill.type === 'IMAGE') {
                        imageUrl = await exportObject(elem);
                    }
                }
                const rectangleNode = {
                    type,
                    filename: imageUrl,
                    size: {
                        width,
                        height,
                        x,
                        y
                    },
                    background: {
                        url: imageUrl,
                    },
                    style: {
                        border: {
                            color: colorStrokes,
                            style: borderStyle,
                            weight: strokeWeight,
                        },
                        shadow: {
                            color: shadowColor,
                            opacity: shadowOpacity,
                            offsetX,
                            offsetY,
                        }
                    }
                };
                layouts.push(rectangleNode);
            }
        }
        console.log(layouts);
    }
}
async function Flow() {
    const data = await getStyles();
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };
    fetch('', options);
}
// function saveFile() {
//   if (figma.command == 'save') {
//     // Проверяем, что плагин был запущен с командой "save"
//     const options = {
//       title: "Сохранить файл",
//       buttonLabel: "Сохранить",
//       filters: [
//         { name: "JSON", extensions: ["json"] },
//         { name: "All Files", extensions: ["*"] }
//       ]
//     };
//     // Вызываем диалоговое окно сохранения
//     const filePaths = showSaveDialog(options);
//     // Если пользователь выбрал файл и нажал кнопку "Сохранить"
//     if (filePaths && filePaths.length > 0) {
//       const filePath = filePaths[0];
//       // Выполняем сохранение файла по выбранному пути
//       // ...
//     }
//   }
// }
// saveFile();
// figma.showUI(__html__)
getStyles();
