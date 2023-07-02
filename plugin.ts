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
      style: string,
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
    isLocked?: boolean,
    opacity?: number,
    rotation?: number,
    alignX?: "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED",
    alignY?: "CENTER" | "TOP" | "BOTTOM",
    color?: string
  }

}

interface Frame {
  type: string,
  filename: string,
  size: {
    width: number,
    height: number,
    x: number,
    y: number,
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

  const group = selectedElem as FrameNode
  let {width, height, x, y, effects, name, backgrounds, strokes} = group

  // const rectangle = selectedElem as RectangleNode
  // let {fills, width, height, x, y, strokes, effects, name} = rectangle

  console.log(backgrounds, effects, strokes)

  figma.closePlugin();
}


getStyles();