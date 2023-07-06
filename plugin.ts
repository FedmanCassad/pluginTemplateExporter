
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
    font: {
      name: string,
      fontstyle: string,
      size: number | symbol,
      color: string,
      weight: number | symbol,
      isUnderline:boolean,
      isStroked:boolean,
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
    isLocked: boolean,
    opacity: number,
    rotation: number,
    alignX: "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED",
    alignY: "CENTER" | "TOP" | "BOTTOM",
  }

}

interface Frame {
  type: string,
  filename?: string,
  size: {
    width: number,
    height: number,
    x: number,
    y: number,
  }
  style?: {
    border?: {
      weight: number | symbol,
      color: string,
      style: string
    },
    shadow?: {
      color: string,
      offsetX: number,
      offsetY: number,
      opacity: number,
    }
  }
}

interface Rectangle {
  type: string,
  filename?: string,
  size: {
    width: number,
    height: number,
    x: number,
    y: number,
  }
  background?: {
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
      color: string,
      style: string
    },
    shadow?: {
      color: string,
      offsetX: number,
      offsetY: number,
      opacity: number,
    }
  }
}

let exitData

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
  const imageData = await node.exportAsync(exportOptions); 
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

  if(select && select.type === 'FRAME' && select.children && select.name.toLowerCase().includes('logo')) {
    let layouts:(Text | Frame | Rectangle)[] = []
    select as FrameNode

    const children = select.children
    let frameName = correctionName(select.name)
    const rootWidth = select.width
    const rootHeight = select.height
    let rootFill: string = '';
    select.backgrounds.forEach((backProp)=>{
      if(backProp.type === 'SOLID') {
        rootFill = rgbToHex(backProp.color.r, backProp.color.g, backProp.color.b)
      }
    }) 

    

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
        
        const textInfo:Text = {
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
        }
        layouts.push(textInfo)
        };

        if(child.type ==='FRAME') {
          const elem = child as FrameNode;
          
          let {width, height, x, y, effects, strokes, strokeWeight} = elem
          let groupProp = {} as Frame
          const type: string = 'vector'
          // Получаем данные о 
          let border: object | null = {}
          let colorStrokes: string | undefined
          let borderStyle: string | undefined
          let borderWeight: number | undefined
        
          strokes.forEach((paint:Paint) => {
            if (paint.type === "SOLID") {
              const solidPaint = paint as SolidPaint
              colorStrokes = rgbToHex(solidPaint.color.r, solidPaint.color.g, solidPaint.color.b)
              borderStyle = solidPaint.type
              borderWeight = strokeWeight as number
              border = {color: colorStrokes, style: borderStyle, weight: borderWeight}
            }
          })
        
          let shadow: object | null = {}
          let shadowColor: string | undefined
          let shadowOpacity: number | undefined
          let offsetX: number | undefined
          let offsetY: number | undefined
          
          // значение блюра
          let blur: object | null = {} 

          effects.forEach((effect:Effect) => {
            if(effect.type === 'DROP_SHADOW' || effect.type ==='INNER_SHADOW') {
              const styleShadow: DropShadowEffect | InnerShadowEffect = effect 
              shadowColor = rgbToHex(styleShadow.color.r, styleShadow.color.g, styleShadow.color.b)
              shadowOpacity = Math.ceil(styleShadow.color.a * 100)
              offsetX = styleShadow.offset.x
              offsetY = styleShadow.offset.y
              shadow = {color: shadowColor, offsetX, offsetY, shadowOpacity}
            }

            if(effect.type ==="LAYER_BLUR") {
              const blurStyle: BlurEffect = effect 
              blur = {value: blurStyle.radius, type: blurStyle.type}
            }
          })
          
          const imageUrl:string = await exportObject(elem, "SVG")

          groupProp = {
            type,
            filename: imageUrl,
            size: {
              width,
              height,
              x,
              y
            },
            style: {shadow, border, blur}
          } as Frame
          layouts.push(groupProp)
        }

      if(child.type === "RECTANGLE") {
        const elem = child as RectangleNode
        
        
        let {width, height, x, y, effects, fills, strokes, strokeWeight} = elem
        let type: string = ''
        let rectangleProp = {} as Rectangle
        let border: object | null = {}
        let colorStrokes: string | undefined
        let borderStyle: string | undefined
        let borderWeight: number | undefined
      
        strokes.forEach((paint:Paint) => {
          if (paint.type === "SOLID") {
            const solidPaint = paint as SolidPaint
            colorStrokes = rgbToHex(solidPaint.color.r, solidPaint.color.g, solidPaint.color.b)
            borderStyle = solidPaint.type
            borderWeight = strokeWeight as number
            border = {color: colorStrokes, style: borderStyle, weight: borderWeight}
          }
        })
      
        let shadow: object | null = {}
        let shadowColor: string = ''
        let shadowOpacity: number = 0
        let offsetX: number = 0;
        let offsetY: number = 0;
        let imageUrl:string = ''
        
        let blur: object | null = {} 

        effects.forEach((effect:Effect) => {
          if(effect.type === 'DROP_SHADOW' || effect.type ==='INNER_SHADOW') {
            const styleShadow: DropShadowEffect | InnerShadowEffect = effect 
            shadowColor = rgbToHex(styleShadow.color.r, styleShadow.color.g, styleShadow.color.b)
            shadowOpacity = Math.ceil(styleShadow.color.a * 100)
            offsetX = styleShadow.offset.x
            offsetY = styleShadow.offset.y
            shadow = {color: shadowColor, offsetX, offsetY, shadowOpacity}
          }

          if(effect.type ==="LAYER_BLUR") {
            const blurStyle: BlurEffect = effect 
            blur = {value: blurStyle.radius, type: blurStyle.type}
          }
        })


        const fillProp = fills as Paint[] 
        for(const fill of fillProp) {
          // Проверяем, что заливка изображением и узел имеет в названии "img"/"vector"
          if(fill.type === "IMAGE" ) {
            imageUrl = await exportObject(elem, "PNG")
            type = 'img'
            break
          }
          if (elem.name.includes('vector')) {
            imageUrl = await exportObject(elem, "SVG")
            type = 'vector'
            break
          }
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
          style: {shadow, border, blur}
        } as Rectangle

        layouts.push(rectangleProp)
      } 
    }
  
    return {
      frameName,
      rootWidth,
      rootHeight,
      rootFill,
      layouts,
    }
  }


  /// Если выбранный node элемент не содержит слово "logo" и не является FrameNode, пропускаем его  
  return
}


// Основная функция, которая срабатывает при запуске плагина
async function Run() {
  const selectedNodes = figma.currentPage.selection
  let exitData = []
  for(const node of selectedNodes) {
    // Получаем стили для всех выделенных объектов
    const logoData = await getStyles(node)
    exitData.push(logoData)
  }
  
  // Отправляем готовый датасет на сервер 
  console.log(exitData)
  figma.showUI(__html__, {width: 300, height: 300})
  figma.ui.postMessage(exitData)
}



//Запуск плагина
Run()