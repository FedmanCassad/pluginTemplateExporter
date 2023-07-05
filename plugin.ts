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

function correctionName (name:string) {  
  return name.split(' ').join('');
}

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

async function exportObject(node:SceneNode) {
  const exportOptions:ExportSettings = { format: 'PNG'}; // указываются параметры экспорта
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
  // console.log(exportData);
}

async function getStyles() {
  
  const selected = figma.currentPage.selection
  
  for(const select of selected) {
    if(select && select.type === 'FRAME' && select.children) {
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
            
            const imageUrl:string = await exportObject(elem)
  
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
            if(fill.type === 'IMAGE') {
              imageUrl = await exportObject(elem)
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
      console.log(layouts);
      
    }
  }
 
}

async function Flow() {
  const data = await getStyles()

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };

  fetch('', options)
}

getStyles()