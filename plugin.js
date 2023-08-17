"use strict";

function delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

const identityMatrixHandlePositions = [
    [0, 1, 0],
    [0.5, 0.5, 1],
    [1, 1, 1]
  ];

function roundTinyNumbers(value) {
    const epsilon = 1e-10;
    if (Math.abs(value) < epsilon) {
      return 0;
    }
    return value;
  }

  function invert3x3Matrix(m) {
    const a = m[0][0], b = m[0][1], c = m[0][2],
          d = m[1][0], e = m[1][1], f = m[1][2],
          g = m[2][0], h = m[2][1], i = m[2][2];
    
    const det = a*(e*i - f*h) - b*(d*i - f*g) + c*(d*h - e*g);
    
    if (det === 0) {
        throw new Error('Matrix is not invertible');
    }
    
    const invDet = 1/det;
    
    return [
        [(e*i - f*h)*invDet, (c*h - b*i)*invDet, (b*f - c*e)*invDet],
        [(f*g - d*i)*invDet, (a*i - c*g)*invDet, (c*d - a*f)*invDet],
        [(d*h - e*g)*invDet, (g*b - a*h)*invDet, (a*e - b*d)*invDet]
    ];
}
  
  function convertTransformToGradientHandles(transform) {
    let actualTransform = [...transform, [0, 0, 1]]
    const inverseTransform = invert3x3Matrix(actualTransform);
  
    // point matrix
    const mp = multiplyMatrix(inverseTransform, identityMatrixHandlePositions);
    return [
      { x: mp[0][0], y: mp[1][0] },
      { x: mp[0][1], y: mp[1][1] },
      { x: mp[0][2], y: mp[1][2] }
    ];
  }

  function multiplyMatrix(matrixA, matrixB) {
    let product = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  
    for(let i = 0; i < 3; i++) {
      for(let j = 0; j < 3; j++) {
        for(let k = 0; k < 3; k++) {
          product[i][j] += matrixA[i][k] * matrixB[k][j];
        }
        product[i][j] = roundTinyNumbers(product[i][j]);
      }
    }
  
    return product;
  }

let exitData;
// Функция переводит цвета из rgb в hex
function rgbToHex(r, g, b) {
   r = Math.floor(r * 255);
    g = Math.floor(g * 255);
    b = Math.floor(b * 255);
    
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);

    if (r.length == 1)
        r = "0" + r;
    if (g.length == 1)
        g = "0" + g;
    if (b.length == 1)
        b = "0" + b;

    return "#" + r + g + b;
}
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
    const imageData = await node.exportAsync(exportOptions);
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

function decideCategory(name) {
    let probableCategory = null;
        if (name.toLowerCase().includes('insta')) {
            probableCategory = 'insta'
        }

        if (name.toLowerCase().includes('logo')) {
            probableCategory = 'logo'
            }
        if (name.toLowerCase().includes('facebook')) {
                probableCategory = 'facebook'
             }
        if (name.toLowerCase().includes('youtube')) {
                probableCategory = 'youtube'
        }
        if (name.toLowerCase().includes('poster')) {
            probableCategory = 'poster'
        }
        if (name.toLowerCase().includes('instagramstory')) {
                probableCategory = 'instagramstory'
            }
        if (name.toLowerCase().includes('businesscard')) {
                probableCategory = "businesscard"
        }

        if (name.toLowerCase().includes('invitation')) {
            probableCategory = "invitation"
    }
     return probableCategory
 }

 function roundPoint(point) {
    point.x = Number(point.x.toFixed(1));
    point.y = Number(point.y.toFixed(1));
    return point
 }

function applyMatrixToPoint(matrix, point) {
    const x = matrix[0][0] * point[0] + matrix[1][0] * point[1];
    const y = matrix[0][1] * point[0] + matrix[1][1] * point[1];
    return {x, y};
}

 function extractLinearGradientData(fill) {
    const colors = [];
    const locations = [];
    let gradientData = null;
    // извлекаем цвета и позиции
    for (const stop of fill.gradientStops) {
        colors.push(rgbToHex(stop.color.r, stop.color.g, stop.color.b));
        locations.push(stop.position);
    }

    // извлекаем gradientTransform
    const gradientTransform = fill.gradientTransform;
    let points = convertTransformToGradientHandles(gradientTransform)
    let startPoint = points[0]
    let endPoint = points[1]
    startPoint = roundPoint(startPoint)
    endPoint = roundPoint(endPoint)
    gradientData = {
        colors,
        locations,
        startPoint: startPoint,
        endPoint: endPoint
    };
    return gradientData;
 }

 function decideTag(name) {
    let knownParts = ['logo', 'insta', 'facebook', 'youtube'];
    let nameParts = name.toLowerCase().split('-').map(part => part.trim());
    
    // Фильтруем массив nameParts, исключая элементы, которые входят в массив knownParts
    let tagParts = nameParts.filter(part => !knownParts.includes(part));
    console.log(tagParts)
    // Если остаются какие-то элементы после фильтрации, возвращаем первый, иначе возвращаем null
    let tag = tagParts.length ? tagParts[0].trim() : null;
    console.log(tag)
    return tagParts.length ? tagParts[0].trim() : null;
 }

async function getStyles(select) {
    if (select && select.type === 'FRAME' && select.children && select.name.toLowerCase().includes('logo') 
        || select && select.type === 'FRAME' && select.name.toLowerCase().includes('insta')
        || select && select.type === 'FRAME' && select.name.toLowerCase().includes('poster')
        || select && select.type === 'FRAME' && select.name.toLowerCase().includes('facebook')
        || select && select.type === 'FRAME' && select.name.toLowerCase().includes('youtube')
        || select && select.type === 'FRAME' && select.name.toLowerCase().includes('business')
        || select && select.type === 'FRAME' && select.name.toLowerCase().includes('invitation')
        ) {
        let layouts = [];
        let rootAbsX = select.absoluteRenderBounds.x
        let rootAbsY = select.absoluteRenderBounds.y
        const children = select.children;
        let frameName = correctionName(select.name);
        let category = decideCategory(frameName);
        let tag = decideTag(frameName);
        const rootWidth = select.width;
        const rootHeight = select.height;
        const preview = await exportObject(select, "PNG");
        let rootFill = null;
        select.fills.forEach((backProp) => {
            if (backProp.type === 'SOLID') {
                rootFill =  { color: rgbToHex(backProp.color.r, backProp.color.g, backProp.color.b) };
            }

            if (backProp.type === 'GRADIENT_LINEAR') {
                // console.log(backProp)
                let gradientData = extractLinearGradientData(backProp)
                rootFill = { linearGradient: gradientData }
                // console.log(gradientData)
            }
        });
        for (const child of children) {
            if (child.name.toLowerCase().includes('text')) {
                const elem = child;
                let { characters: text, width, absoluteRenderBounds, paragraphSpacing, height, x, y, textCase, fontSize: size, fills, strokes, strokeWeight, fontWeight: weight, fontName, letterSpacing: letSpace, lineHeight, lineSpacing, effects, locked: isLocked, opacity, rotation, textAlignHorizontal: alignX, textAlignVertical: alignY } = elem;
                const colorProp = fills;
                let fontColor = '';
                let stroke = null;
                let type = "text";
                if (colorProp.length > 0 && colorProp[0].type === 'SOLID' && colorProp[0].color) {
                    fontColor = rgbToHex(colorProp[0].color.r, colorProp[0].color.g, colorProp[0].color.b);
                }

                x = Number(x.toFixed(1));
                y = Number(y.toFixed(1));
                //blur
                let blurProp = null;
                for (const item of effects) {
                    if (item.type === 'LAYER_BLUR') {
                        blurProp = { radius: item.radius }
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
                let isStrikethrough = false;
                if (elem.textDecoration === 'STRIKETHROUGH') {
                    isUnderline = false;
                    isStrikethrough = true;
                }
                if (elem.textDecoration === 'UNDERLINE') {
                    isUnderline = true;
                    isStrikethrough = false;
                }
                console.log('Line spacing')
console.log(lineSpacing)
                // if (isStroked == true) {
                   strokes.forEach((paint) => {
                    if (paint.type === "SOLID") {
                        const solidPaint = paint;
                        const colorStrokes = rgbToHex(solidPaint.color.r, solidPaint.color.g, solidPaint.color.b);
                        stroke = { color: colorStrokes ? colorStrokes : null,  strokeWidth: strokeWeight ? strokeWeight : null };
                    }
                });
                // }

                let shadows = null;
                let shadowColor = null;
                let shadowOpacity = null;
                let offsetX = null;
                let offsetY = null;
                let shadowRadius = null;
                let realWidth = absoluteRenderBounds.width
                let realHeight = absoluteRenderBounds.height
                let realXpos = absoluteRenderBounds.x - rootAbsX
                let realYpos = absoluteRenderBounds.y - rootAbsY
                let blur = null;
                // значение блюра
                effects.forEach((effect) => {
                    if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
                        const styleShadow = effect;
                        shadowColor = rgbToHex(styleShadow.color.r, styleShadow.color.g, styleShadow.color.b);
                        shadowOpacity = Math.ceil(styleShadow.color.a * 100);
                        offsetX = styleShadow.offset.x;
                        offsetY = styleShadow.offset.y;
                        shadowRadius = styleShadow.radius;
                        if (shadows === null) {
                            shadows = []
                        }
                        shadows.push({ color: shadowColor ? shadowColor : null, offsetX: offsetX ? offsetX : 0, offsetY: offsetY ? offsetY : 0, shadowOpacity: shadowOpacity ? shadowOpacity : null, radius: shadowRadius });
                    }
                });

                const textInfo = {
                    text,
                    type,
                    rotation,
                    size: {
                        width: width,
                        height: height,
                        x: x,
                        y: y,
                    },
                    style: {
                        font: {
                            size,
                            weight,
                            isStrikethrough,
                            isUnderline,
                            name,
                            fontstyle: style,
                            color: fontColor ? fontColor : null,
                            stroke: stroke ? stroke : null,
                            textCase: textCase
                        },
                        lineSpacing,
                        letterSpacing: spacingProp,
                        lineHeight: lineHeightProp,
                        paragraphSpaciing: paragraphSpacing,
                        blur: blurProp ? blurProp : null,
                        shadows: shadows ? shadows  : null,
                        isLocked,
                        opacity,
                        alignX,
                        alignY
                    }
                };
                layouts.push(textInfo);
            }
            ;
            if (child.name.toLowerCase().includes('vector')) {
                const elem = child;
                let { absoluteRenderBounds, absoluteBoundingBox, width, height, x, y, effects, strokes, strokeWeight, rotation } = elem;
                let groupProp = {};
                const type = 'vector';
                let absRenderHeight = absoluteRenderBounds.height
                let absRenderWidth = absoluteRenderBounds.width
                // Получаем данные о 
                let border = null;
                let colorStrokes = null;
                let borderStyle = null;
                let borderWeight = null;
                strokes.forEach((paint) => {
                    if (paint.type === "SOLID") {
                        const solidPaint = paint;
                        colorStrokes = rgbToHex(solidPaint.color.r, solidPaint.color.g, solidPaint.color.b);
                        borderStyle = solidPaint.type;
                        borderWeight = strokeWeight;
                        border = colorStrokes || borderStyle || borderWeight ? { color: colorStrokes ? colorStrokes : null, borderStyle: borderStyle ? borderStyle : null, weight: borderWeight ? borderWeight : null } : null;
                    }
                });
                let shadows = null;
                let style = null;
                let shadowColor = null;
                let shadowOpacity = null;
                let offsetX = null;
                let offsetY = null;
                let shadowRadius = null;
                // значение блюра
                let blur = null;
                effects.forEach((effect) => {
                    if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
                        const styleShadow = effect;
                        shadowColor = rgbToHex(styleShadow.color.r, styleShadow.color.g, styleShadow.color.b);
                        shadowOpacity = Math.ceil(styleShadow.color.a * 100);
                        offsetX = styleShadow.offset.x;
                        offsetY = styleShadow.offset.y;
                        shadowRadius = styleShadow.radius;
                        if (shadows == null) {
                            shadows = []
                        }
                        shadows.push({ color: shadowColor ? shadowColor : null, offsetX: offsetX ? offsetX : null, offsetY: offsetY ? offsetY : null, shadowOpacity: shadowOpacity ? shadowOpacity : null, radius: shadowRadius });
                    }
                    if (effect.type === "LAYER_BLUR") {
                        const blurStyle = effect;
                        blur = { radius: blurStyle.radius ? blur.radius : null};
                    }
                });
                style = shadows || border || blur ? { shadow: shadows ? shadows : null, border: border ? border : null, blur: blur ? blur : null } : null;
                let imageUrl = null;
                let realXpos = absoluteBoundingBox.x - rootAbsX + (absoluteBoundingBox.width / 2)
                let realYpos = absoluteBoundingBox.y - rootAbsY + (absoluteBoundingBox.height / 2)
                if (absRenderHeight != height || absRenderWidth != width) {
                    let copy = child.clone()
                    copy.rotation = 0
                    figma.currentPage.appendChild(copy)
                   imageUrl = await exportObject(copy, "SVG");
                   copy.remove()
                } else {
                    imageUrl = await exportObject(child, "SVG");
                }

                groupProp = {
                    type,
                    filename: imageUrl,
                    rotation: rotation,
                    size: {
                        width: width,
                        height: height,
                        x: realXpos,
                        y: realYpos
                    },
                    style: style ? style : null
                };
                layouts.push(groupProp);
            }
            // if (child.name === "RECTANGLE") {
            //     const elem = child;
            //     let { width, height, x, y, effects, fills, strokes, strokeWeight } = elem;
            //     let type = '';
            //     let rectangleProp = {};
            //     let border = {};
            //     let colorStrokes;
            //     let borderStyle;
            //     let borderWeight;
            //     strokes.forEach((paint) => {
            //         if (paint.type === "SOLID") {
            //             const solidPaint = paint;
            //             colorStrokes = rgbToHex(solidPaint.color.r, solidPaint.color.g, solidPaint.color.b);
            //             borderStyle = solidPaint.type;
            //             borderWeight = strokeWeight;
            //             border = { color: colorStrokes, style: borderStyle, weight: borderWeight };
            //         }
            //     });
            //     let shadow = {};
            //     let shadowColor = '';
            //     let shadowOpacity = 0;
            //     let offsetX = 0;
            //     let offsetY = 0;
            //     let imageUrl = '';
            //     let blur = {};
            //     effects.forEach((effect) => {
            //         if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
            //             const styleShadow = effect;
            //             shadowColor = rgbToHex(styleShadow.color.r, styleShadow.color.g, styleShadow.color.b);
            //             shadowOpacity = Math.ceil(styleShadow.color.a * 100);
            //             offsetX = styleShadow.offset.x;
            //             offsetY = styleShadow.offset.y;
            //             shadow = { color: shadowColor, offsetX, offsetY, shadowOpacity };
            //         }
            //         if (effect.type === "LAYER_BLUR") {
            //             const blurStyle = effect;
            //             blur = { value: blurStyle.radius };
            //         }
            //     });
            //     const fillProp = fills;
            //     for (const fill of fillProp) {
            //         // Проверяем, что заливка изображением и узел имеет в названии "img"/"vector"
            //         if (fill.type === "IMAGE") {
            //             imageUrl = await exportObject(elem, "PNG");
            //             type = 'img';
            //             break;
            //         }
            //         if (elem.name.includes('vector')) {
            //             imageUrl = await exportObject(elem, "SVG");
            //             type = 'vector';
            //             break;
            //         }
            //     }
            //     rectangleProp = {
            //         type,
            //         filename: imageUrl,
            //         size: {
            //             width,
            //             height,
            //             x,
            //             y
            //         },
            //         style: { shadow, border, blur }
            //     };
            //     layouts.push(rectangleProp);
            // }
            if (child.name.includes('img')) {
                const elem = child;
                let { absoluteRenderBounds, absoluteBoundingBox, width, height, x, y, effects, fills, strokes, strokeWeight, rotation } = elem;
                let type = "img";
                let rectangleProp = {};
                let border = null;
                let colorStrokes;
                let borderStyle;
                let borderWeight;
                let absRenderHeight = absoluteRenderBounds.height
                let absRenderWidth = absoluteRenderBounds.width
                let realXpos = absoluteBoundingBox.x - rootAbsX + (absoluteBoundingBox.width / 2)
                let realYpos = absoluteBoundingBox.y - rootAbsY + (absoluteBoundingBox.height / 2)
                strokes.forEach((paint) => {
                    if (paint.type === "SOLID") {
                        const solidPaint = paint;
                        colorStrokes = rgbToHex(solidPaint.color.r, solidPaint.color.g, solidPaint.color.b);
                        borderStyle = solidPaint.type;
                        borderWeight = strokeWeight;
                        border = { color: colorStrokes, style: borderStyle, weight: borderWeight };
                    }
                });
                let shadows = null;
                let shadowColor = '';
                let shadowOpacity = 0;
                let offsetX = 0;
                let offsetY = 0;
                let imageUrl = '';
                let blur = null;
                let style = null;
                effects.forEach((effect) => {
                    if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
                        const styleShadow = effect;
                        shadowColor = rgbToHex(styleShadow.color.r, styleShadow.color.g, styleShadow.color.b);
                        shadowOpacity = Math.ceil(styleShadow.color.a * 100);
                        offsetX = styleShadow.offset.x;
                        offsetY = styleShadow.offset.y;
                        if (shadows === null) {
                            shadows = []
                        }
                        shadows.push({ color: shadowColor, offsetX, offsetY, shadowOpacity });
                    }
                    if (effect.type === "LAYER_BLUR") {
                        const blurStyle = effect;
                        blur = { value: blurStyle.radius };
                    }
                });
                
                style = shadows || border || blur ? { shadows: shadows ? shadows : null, border: border ? border : null, blur: blur ? blur : null } : null;
                if (absRenderHeight != height || absRenderWidth != width) {
                    
                    let tempRotation = rotation
                    let copy = elem.clone()
                    copy.rotation = 0
                    elem.rotation = tempRotation
                    figma.currentPage.appendChild(copy)
                    imageUrl = await exportObject(copy, "PNG");
                   copy.remove()
                } else {
                    imageUrl = await exportObject(elem, "PNG");
                }

                rectangleProp = {
                    type,
                    filename: imageUrl,
                    rotation: rotation,
                    size: {
                        width: width,
                        height: height,
                        x: realXpos,
                        y: realYpos
                    },
                    style: style ? style : null
                };
                layouts.push(rectangleProp);
            }

        }
        return {
            frameName,
            category: category,
            tag: tag,
            preview,
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
    console.log(exitData);
    figma.showUI(__html__, { width: 300, height: 300 });
    figma.ui.postMessage(exitData);
}
//Запуск плагина
Run();
