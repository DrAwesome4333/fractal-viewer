// @ts-check
import { Graphics } from "./modules/graphics.js";
import { Fractal , FRACTAL_INFO } from "./modules/fractal.js";
import { Palette } from "./modules/palette.js";

var GL_CANVAS = document.createElement("canvas");
document.body.append(GL_CANVAS);
GL_CANVAS.width = window.innerHeight;
// - 100 for GUI on bottom
GL_CANVAS.height = window.innerHeight - 100;

var graphics = new Graphics(GL_CANVAS, GL_CANVAS.width, GL_CANVAS.height)

var fractals = {};


for(var fName in FRACTAL_INFO){
    let fractal = new Fractal(graphics.getContext(), FRACTAL_INFO[fName]['name'], FRACTAL_INFO[fName]['setup'], FRACTAL_INFO[fName]['next']);
    fractals[fName] = fractal;
    var option = document.createElement('option');
    option.value = fName;
    option.innerText = fractal.name;
    document.getElementById('fractal').appendChild(option);
}
var currentFractal = fractals['mandelbrot'];

var rainbowPalette = new Palette([
    {value: 0, color: "#ff0000"},
    {value: 1, color: "#00ff00"},
    {value: 2, color: "#0000ff"},
    {value: 3, color: "#ffff00"},
    {value: 4, color: "#ff00ff"},
    {value: 5, color: "#00ffff"},
    {value: 6, color: "#00ff00"},
    {value: 7, color: "#0000ff"},
    {value: 8, color: "#ffff00"},
    {value: 9, color: "#ff00ff"},
    {value: 10, color: "#00ffff"},
    {value: 11, color: "#ff0000"},
    {value: 12, color: "#00ff00"},
    {value: 13, color: "#0000ff"},
    {value: 14, color: "#ffff00"},
    {value: 15, color: "#ff00ff"},
    {value: 16, color: "#00ffff"},
    {value: 17, color: "#00ff00"},
    {value: 18, color: "#0000ff"},
    {value: 19, color: "#ffff00"},
    {value: 20, color: "#ff00ff"},
    {value: 21, color: "#00ffff"},
    {value: 22, color: "#000000"}
], true);


graphics.setPalette(rainbowPalette);

function changeFractal(){
    // @ts-ignore
    var fractalName = document.getElementById('fractal').value;
    currentFractal = fractals[fractalName];
    updateGUI();
}

function loadPreset(fractalName){
    var config = graphics.getConfig();
    config.c.x = FRACTAL_INFO[fractalName]['data1'][0];
    config.c.y = FRACTAL_INFO[fractalName]['data1'][1];
    config.p.x = FRACTAL_INFO[fractalName]['data2'][0];
    config.p.y = FRACTAL_INFO[fractalName]['data2'][1];
}
//@ts-ignore
document.getElementById('loadPreset').addEventListener('click', ()=>{loadPreset(document.getElementById('fractal').value);updateGUI()})

document.getElementById('fractal').addEventListener('change', changeFractal);

function drawWbgl(){
    graphics.draw(currentFractal);
    requestAnimationFrame(drawWbgl);
}

drawWbgl();

/**
 * @param {WheelEvent} e
 */
function zoom(e){
    e.preventDefault();
    updateParameters();
    var config = graphics.getConfig();
    config.axisLength += config.axisLength * e.deltaY/1000;
    updateGUI();
}
GL_CANVAS.addEventListener("wheel", zoom);

/**
 * Updates the center of the fractal to where the user clicked
 * @param {MouseEvent} e 
 */
function updateCenter(e){
    var cRect = GL_CANVAS.getBoundingClientRect();
    var X = e.clientX - cRect.left - cRect.width/2;
    var Y = e.clientY - cRect.top - cRect.height/2;
    var config = graphics.getConfig();
    config.center.x += (X/cRect.width) * config.axisLength;
    config.center.y += -(Y/cRect.height) * config.axisLength;
    updateGUI()
}

function updateGUI(){
    
    var config = graphics.getConfig();
    // because most HTML elements don't have the value property, ts-check throws an error here
    // @ts-ignore
    document.getElementById('centerX').value = config.center.x;
    // @ts-ignore
    document.getElementById('centerY').value = config.center.y;
    // @ts-ignore
    document.getElementById('axisLength').value = config.axisLength;
    // @ts-ignore
    document.getElementById('data1R').value = config.c.x;
    // @ts-ignore
    document.getElementById('data1I').value = config.c.y;
    // @ts-ignore
    document.getElementById('data2R').value = config.p.x;
    // @ts-ignore
    document.getElementById('data2I').value = config.p.y;
}

function updateParameters(){
    var config = graphics.getConfig();
    // @ts-ignore
    config.center.x = Number(document.getElementById('centerX').value);
    // @ts-ignore
    config.center.y = Number(document.getElementById('centerY').value);
    // @ts-ignore
    config.axisLength = Number(document.getElementById('axisLength').value);
    // @ts-ignore
    config.c.x = Number(document.getElementById('data1R').value);
    // @ts-ignore
    config.c.y = Number(document.getElementById('data1I').value);
    // @ts-ignore
    config.p.x = Number(document.getElementById('data2R').value);
    // @ts-ignore
    config.p.y = Number(document.getElementById('data2I').value);
}


document.getElementById('centerX').addEventListener('change', updateParameters);
document.getElementById('centerY').addEventListener('change', updateParameters);
document.getElementById('axisLength').addEventListener('change', updateParameters);
document.getElementById('data1R').addEventListener('change', updateParameters);
document.getElementById('data1I').addEventListener('change', updateParameters);
document.getElementById('data2R').addEventListener('change', updateParameters);
document.getElementById('data2I').addEventListener('change', updateParameters);

GL_CANVAS.addEventListener("click", updateCenter)