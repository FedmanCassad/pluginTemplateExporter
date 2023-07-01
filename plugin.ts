interface Text {
  type?: string,
  text?: string,
  size?: {
    width?: number,
    height?: number,
    x?: number,
    y?: number,
  },
  style?: {
    font?: {
      name?: string,
      style?: string,
      size?: number | symbol,
      color?: string,
      weight?: number | symbol,
      isUnderline?:boolean,
      isStroked?:boolean,
    },
    letterSpacing?: {
      value: number
      unit: 'PIXELS' | 'PERCENT'
    },
    lineSpacing?: {
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
    alignY?: "CENTER" | "TOP" | "BOTTOM" 
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


function getStyles() {
  const selectedElem = figma.currentPage.selection[0]

  
  const elem = selectedElem as TextNode;
  let {characters:text, type, width, height, x, y, fontSize:size, fills, fontWeight:weight, fontName, letterSpacing:letSpace, lineHeight, effects, locked:isLocked, opacity, rotation, textAlignHorizontal:alignX, textAlignVertical:alignY} = elem



  //
  x = Number(x.toFixed(1))
  y = Number(y.toFixed(1))

  //blur
  let blurProp:number = 0 

  for(const item of effects) {
    if (item.type === 'LAYER_BLUR') {
      blurProp = item.radius
    }
  }

  // Font family & Style
  const fontProp = fontName as FontName
  const name = fontProp.family
  const style = fontProp.style
  
  // Letter Spacing
  const spacingProp = letSpace as LetterSpacing
  const lineHeightProp = lineHeight as LineHeight
  


// Проверка text decoration
  let isUnderline:boolean = false
  let isStroked:boolean = false

  if(elem.textDecoration === 'STRIKETHROUGH') {
    isUnderline = false
    isStroked = false
  }

  if(elem.textDecoration === 'UNDERLINE') {
    isUnderline = true
    isStroked = false
  }

  const textInfo: Text = {
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
  

  console.log(fills)

  figma.closePlugin();
}


getStyles();