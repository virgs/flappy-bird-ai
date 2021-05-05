const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

const borderThickness = 0.25;
const ratio = Math.min(windowHeight / 256, windowWidth / 290) - borderThickness;
export const scale: number = Math.min(ratio, 30);
