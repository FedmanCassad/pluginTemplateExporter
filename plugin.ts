interface Text {
  type: string,
  text: string,
  size: {
    width: number,
    height: number,
    x: number,
    y: number,
  },
  style: {
    font?: {
      name?: string,
      style?: string,
      size?: number | symbol,
      color?: string,
      weight?: number | symbol,
      isUnderline?:boolean,
      isStroked?:boolean,
    },
    letterSpacing: {
      value: number
      unit: 'PIXELS' | 'PERCENT'
    },
    lineSpacing: {
      value: number
      unit: 'PIXELS' | 'PERCENT' 
    } 
    | 
    {
      unit: 'AUTO'
    },
    blur?: number,
    isLocked?: boolean,
    opacity?: number,
    rotation?: number,
    alignX?: "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED",
    alignY?: "CENTER" | "TOP" | "BOTTOM",
    color?: string
  }

}

interface Frame {
  type?: string,
  filename?: string,
  size?: {
    width?: number,
    height?: number,
    x?: number,
    y?: number,
  }
  style?: {
    border?: {
      weight: number | symbol,
      color?: string,
      style?: string
    },
    shadow?: {
      color?: string,
      offsetX?: number,
      offsetY?: number,
      opacity?: number,
    }
  }
}

interface Rectangle {
  type?: string,
  filename?: string,
  size?: {
    width?: number,
    height?: number,
    x?: number,
    y?: number,
  }
  background?: {
    url?: string,
    color?: string,
    gradient?: {
      firstColor: string,
      firstColorX: number,
      secondColor: string,
      firstColorY: number
    } 
  }
  style?: {
    border?: {
      weight: number | symbol,
      color?: string,
      style?: string
    },
    shadow?: {
      color?: string,
      offsetX?: number,
      offsetY?: number,
      opacity?: number,
    }
  }
}


// Функция переводит цвета из rgb в hex
function rgbToHex(r: number, g: number, b: number): string {
  
  // Приводим значение rgb из процентного в 8-битный

  r = Math.ceil(r * 255)
  g = Math.ceil(g * 255)
  b = Math.ceil(b * 255)
  
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

function correctionName (name:string) {  
  return name.split(' ').join('');
}

// Функция запроса конечной ссылки для изображения
async function sendPostRequest(url: string, data: object): Promise<any> {
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
  } catch (error) {
    console.error('Ошибка при выполнении POST-запроса:', error);
    throw error;
  }
}

// Функция эскпорта изображений (зависит от названия в узле 'img'/ 'vector')
async function exportObject(node:SceneNode, exportType: "PNG" | "SVG") {
  const exportOptions:ExportSettings = { format: exportType}; // указываются параметры экспорта
  const imageData = await node.exportAsync(exportOptions); // вызывается функция exportAsync для экспорта объекта с заданными параметрами
  const exportData = {
    size: {
      width: node.width,
      height: node.height,
      format: exportOptions.format
    },
    imageData: imageData
  }
  
  // обработка данных экспорта
  const response = await sendPostRequest('https://logo.finanse.space/api/uploadEncoded', exportData)

  return response.url
}

async function getStyles(select:SceneNode) {

  if(select && select.type === 'FRAME' && select.children && select.name.includes('logo')) {
    let layouts:(Text | Frame | Rectangle)[] = []
    
    const children = select.children
    const frameName = select.name

    for (const child of children) {
      if(child.type ==="TEXT") {
        const elem = child as TextNode
        let { characters: text, type, width, height, x, y, fontSize: size, fills, fontWeight: weight, fontName, letterSpacing: letSpace, lineHeight, effects, locked: isLocked, opacity, rotation, textAlignHorizontal: alignX, textAlignVertical: alignY } = elem;

        
        const colorProp = fills as Paint[];
        let fontColor:string = ''

        if(colorProp[0].type === 'SOLID' && colorProp[0].color) {
          fontColor = rgbToHex(colorProp[0].color.r, colorProp[0].color.g, colorProp[0].color.b)
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
        const fontProp = fontName as FontName;
        const name = fontProp.family;
        const style = fontProp.style;
        // Letter Spacing
        const spacingProp = letSpace as LetterSpacing;
        const lineHeightProp = lineHeight as LineHeight;
        // Проверка text decoration

        let isUnderline:boolean = false
        let isStroked: boolean = false

        if (elem.textDecoration === 'STRIKETHROUGH') {
            isUnderline = false;
            isStroked = true;
        }
        if (elem.textDecoration === 'UNDERLINE') {
          isUnderline = true;
          isStroked = false;
        }
        
        let textInfo:Text = {
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
        }
        layouts.push(textInfo)
        };

        if(child.type ==='FRAME') {
          const elem = child as FrameNode;

          let {width, height, x, y, effects, name, backgrounds, strokes, type, strokeWeight} = elem
  
          let colorStrokes: string = ''
          let borderStyle: string = ''
        
          strokes.forEach((paint:Paint) => {
            if (paint.type === "SOLID") {
              const solidPaint = paint as SolidPaint
              colorStrokes = rgbToHex(solidPaint.color.r, solidPaint.color.g, solidPaint.color.b)
              borderStyle = solidPaint.type
              
            }
          })
        
          let shadowColor: string = ''
          let shadowOpacity: number = 0
          let offsetX: number = 0;
          let offsetY: number = 0;
          let shadowType: string = '';
          
          
          effects.forEach((effect:Effect) => {
            if(effect.type === 'DROP_SHADOW') {
              const dropShadow = effect as DropShadowEffect
              shadowColor = rgbToHex(dropShadow.color.r, dropShadow.color.g, dropShadow.color.b)
              shadowOpacity = Math.ceil(dropShadow.color.a * 100)
              offsetX = dropShadow.offset.x
              offsetY = dropShadow.offset.y
            }
          })
          
          const imageUrl:string = await exportObject(elem, "SVG")

          const groupProp:Frame = {
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
          }
          layouts.push(groupProp)
        }
      if(child.type === "RECTANGLE") {
        const elem = child as RectangleNode

        let {width, height, x, y, effects, name, fills, strokes, type, strokeWeight} = elem
        let colorStrokes: string = ''
        let borderStyle: string = ''
      
        strokes.forEach((paint:Paint) => {
          if (paint.type === "SOLID") {
            const solidPaint = paint as SolidPaint
            colorStrokes = rgbToHex(solidPaint.color.r, solidPaint.color.g, solidPaint.color.b)
            borderStyle = solidPaint.type
      
          }
        })
      
        let shadowColor: string = ''
        let shadowOpacity: number = 0
        let offsetX: number = 0;
        let offsetY: number = 0;
        let shadowType: string = '';
        let imageUrl:string = ''
        
        effects.forEach((effect:Effect) => {
          if(effect.type === 'DROP_SHADOW') {
            const dropShadow = effect as DropShadowEffect
            shadowColor = rgbToHex(dropShadow.color.r, dropShadow.color.g, dropShadow.color.b)
            shadowOpacity = Math.ceil(dropShadow.color.a * 100)
            offsetX = dropShadow.offset.x
            offsetY = dropShadow.offset.y
          }
        })
        
        const fillProp = fills as Paint[] 
        for(const fill of fillProp) {
          // Проверяем, что заливка изображением и узел имеет в названии "img"/"vector"
          if(fill.type === "IMAGE" && child.name.includes('img')) {
            imageUrl = await exportObject(elem, "PNG")
          }
          else if (child.name.includes('vector')) {
            imageUrl = await exportObject(elem, "SVG")
          }
        }

        const rectangleNode:Rectangle = {
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
        }
        layouts.push(rectangleNode)
      } 
    }
    return {
      frameName,
      layouts
    }
  }


  /// Если выбранный node элемент не содержит слово "logo" и не является FrameNode, пропускаем его  
  return
}


// Основная функция, которая запускается при запуске плагина
async function Flow() {
  const selectedNodes = figma.currentPage.selection
  let exitData = []
  for(const node of selectedNodes) {
    // Получаем стили для всех выделенных объектов
    const logoData = await getStyles(node)
    exitData.push(logoData)
  }

  // Отправляем готовый датасет на сервер 
  console.log(exitData);
}


//Запускаемые скрипты
Flow()

// getStyles()