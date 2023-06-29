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
    letterSpacing?: number,
  }
}

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
  const selectedElem = figma.currentPage.selection[0]

  
  const elem = selectedElem as TextNode;
  const {characters:text, type, width, height, x, y, fontSize:size, fills, fontWeight:weight, fontName, letterSpacing:letSpace} = elem

  // Font family & Style
  const fontProp = fontName as FontName
  const name = fontProp.family
  const style = fontProp.style
  
  // Letter Spacing
  const spacingProp = letSpace as LetterSpacing
  const letterSpacing = spacingProp.value
  
  


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
      letterSpacing,

    }
  }
  

  console.log()

  figma.closePlugin();
}


getStyles();