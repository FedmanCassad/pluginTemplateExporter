"use strict";
let exitData;
// Функция переводит цвета из rgb в hex
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
//Склеивание имени для узлов
function correctionName(name) {
    return name.split(' ').join('');
}
// Функция запроса конечной ссылки для изображения
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
// Функция эскпорта изображений (зависит от названия в узле 'img'/ 'vector')
async function exportObject(node, exportType) {
    const exportOptions = { format: exportType }; // указываются параметры экспорта
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
}
async function getStyles(select) {
    if (select && select.type === 'FRAME' && select.children && select.name.includes('logo')) {
        let layouts = [];
        select;
        const children = select.children;
        let frameName = correctionName(select.name);
        const rootWidth = select.width;
        const rootHeight = select.height;
        let rootFill = '';
        select.backgrounds.forEach((backProp) => {
            if (backProp.type === 'SOLID') {
                rootFill = rgbToHex(backProp.color.r, backProp.color.g, backProp.color.b);
            }
        });
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
                            fontstyle: style,
                            color: fontColor,
                        },
                        letterSpacing: spacingProp,
                        lineSpacing: lineHeightProp,
                        blur: blurProp,
                        isLocked,
                        opacity,
                        rotation,
                        alignX,
                        alignY
                    }
                };
                layouts.push(textInfo);
            }
            ;
            if (child.type === 'FRAME') {
                const elem = child;
                let { width, height, x, y, effects, strokes, strokeWeight } = elem;
                let groupProp = {};
                const type = 'vector';
                // Получаем данные о 
                let border = {};
                let colorStrokes;
                let borderStyle;
                let borderWeight;
                strokes.forEach((paint) => {
                    if (paint.type === "SOLID") {
                        const solidPaint = paint;
                        colorStrokes = rgbToHex(solidPaint.color.r, solidPaint.color.g, solidPaint.color.b);
                        borderStyle = solidPaint.type;
                        borderWeight = strokeWeight;
                        border = { color: colorStrokes, style: borderStyle, weight: borderWeight };
                    }
                });
                let shadow = {};
                let shadowColor;
                let shadowOpacity;
                let offsetX;
                let offsetY;
                // значение блюра
                effects.forEach((effect) => {
                    if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
                        const styleShadow = effect;
                        shadowColor = rgbToHex(styleShadow.color.r, styleShadow.color.g, styleShadow.color.b);
                        shadowOpacity = Math.ceil(styleShadow.color.a * 100);
                        offsetX = styleShadow.offset.x;
                        offsetY = styleShadow.offset.y;
                        shadow = { color: shadowColor, offsetX, offsetY, shadowOpacity };
                    }
                    if (effect.type === "LAYER_BLUR") {
                        const blurStyle = effect;
                        console.log(blurStyle);
                    }
                });
                const imageUrl = await exportObject(elem, "SVG");
                groupProp = {
                    type,
                    filename: imageUrl,
                    size: {
                        width,
                        height,
                        x,
                        y
                    },
                    style: { shadow, border }
                };
                layouts.push(groupProp);
            }
            if (child.type === "RECTANGLE") {
                const elem = child;
                let { width, height, x, y, effects, fills, strokes, strokeWeight } = elem;
                let type = 'rectangle';
                let rectangleProp = {};
                let border = {};
                let colorStrokes;
                let borderStyle;
                let borderWeight;
                strokes.forEach((paint) => {
                    if (paint.type === "SOLID") {
                        const solidPaint = paint;
                        colorStrokes = rgbToHex(solidPaint.color.r, solidPaint.color.g, solidPaint.color.b);
                        borderStyle = solidPaint.type;
                        borderWeight = strokeWeight;
                        border = { color: colorStrokes, style: borderStyle, weight: borderWeight };
                    }
                });
                let shadow = {};
                let shadowColor = '';
                let shadowOpacity = 0;
                let offsetX = 0;
                let offsetY = 0;
                let imageUrl = '';
                effects.forEach((effect) => {
                    if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
                        const styleShadow = effect;
                        shadowColor = rgbToHex(styleShadow.color.r, styleShadow.color.g, styleShadow.color.b);
                        shadowOpacity = Math.ceil(styleShadow.color.a * 100);
                        offsetX = styleShadow.offset.x;
                        offsetY = styleShadow.offset.y;
                        shadow = { color: shadowColor, offsetX, offsetY, shadowOpacity };
                    }
                });
                const fillProp = fills;
                for (const fill of fillProp) {
                    // Проверяем, что заливка изображением и узел имеет в названии "img"/"vector"
                    if (fill.type === "IMAGE" && child.name.includes('img')) {
                        imageUrl = await exportObject(elem, "PNG");
                        type = 'img';
                        break;
                    }
                    if (child.name.includes('vector')) {
                        imageUrl = await exportObject(elem, "SVG");
                        break;
                    }
                    rectangleProp = {
                        type,
                        filename: imageUrl,
                        size: {
                            width,
                            height,
                            x,
                            y
                        },
                        style: { shadow, border }
                    };
                    layouts.push(rectangleProp);
                }
            }
        }
        return {
            frameName,
            rootWidth,
            rootHeight,
            rootFill,
            layouts,
        };
    }
    /// Если выбранный node элемент не содержит слово "logo" и не является FrameNode, пропускаем его  
    return;
}
// Основная функция, которая срабатывает при запуске плагина
async function Run() {
    const selectedNodes = figma.currentPage.selection;
    let exitData = [];
    for (const node of selectedNodes) {
        // Получаем стили для всех выделенных объектов
        const logoData = await getStyles(node);
        exitData.push(logoData);
    }
    // Отправляем готовый датасет на сервер 
    console.log(JSON.stringify(exitData), correctionName('logo - insta post - 1'));
    figma.showUI(__html__, { width: 300, height: 300 });
    figma.ui.postMessage(exitData);
    // setTimeout(()=> figma.closePlugin('Все данные успешно получены.'), 5000)
}
//Запуск плагина
Run();
