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
async function getStyles() {
    const select = figma.currentPage.selection[0];
    if (select && select.type === 'FRAME' && select.children) {
        const children = select.children;
    }
    figma.closePlugin();
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
async function exportObject() {
    const node = figma.currentPage.selection[0]; // выбирается объект для экспорта
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
    // await sendPostRequest('https://logo.finanse.space/api/uploadEncoded', exportData)
    console.log(exportData);
}
// exportObject();
getStyles();
