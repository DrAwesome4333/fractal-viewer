// @ts-check

import { Palette } from "./palette.js";

/**
 * Creates a webgl Interface
 * @param {HTMLCanvasElement} canvas 
 * @param {number} width 
 * @param {number} height 
 */
function Graphics(canvas, width, height){
    var mySelf = this;
    /**
     * Draws a fractal to the screen, stored configuration will be used.
     * @param {import("./fractal").Fractal} fractal 
     */
    this.draw = function(fractal){
        fractal.draw(config);
    }

    /**
     * Sets the configuration of the graphics
     * @param {import("./fractal").Configuration} _config 
     */
    this.setConfig = function(_config){
        config = _config;
        mySelf.setPalette(palette);
    }

    /**
     * Gets the current configuration settings of the graphics
     * @returns {import("./fractal").Configuration} 
     */
    this.getConfig = function(){
        return config;
    }

    /**
     * @returns {WebGL2RenderingContext} The webgl context of the graphics
     */
    this.getContext = function(){
        return gl;
    }

    /**
     * Sets the color palette to use for the graphcis
     * @param {Palette} _palette 
     */
    this.setPalette = function(_palette){
        palette = _palette;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, config.iterations, 1, 0,  gl.RGBA, gl.UNSIGNED_BYTE, palette.generateColorData(config.iterations));

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    /**
     * @returns The current colore palette in use 
     */
    this.getPalette = function(){
        return palette;
    }

    /**
     * Sets the size of the internal canvas
     * @param {number} _width
     * @param {number} _height
     */
    this.setCanvasSize = function(_width, _height=_width){
        canvas.width = _width;
        canvas.height = _height;
        width = gl.drawingBufferWidth;
        height = gl.drawingBufferHeight;
        gl.viewport(0, 0, width, height);
    }

    var gl = canvas.getContext('webgl2');
    var palette = new Palette([{color:"Red", value:0},{color:"Black", value:1}]);
    /**@type {import("./fractal").Configuration} */
    var config = {
        center: {
            x: 0, y:0
        },
        c: {
            x: 0, y:0
        },
        p: {
            x: 0, y:0
        },
        axisLength: 4,
        iterations: 256
    }

    this.setCanvasSize(width, height);
    gl.clearColor(0.0, 1.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.disable(gl.CULL_FACE);
    gl.activeTexture(gl.TEXTURE0)
    var paletteTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, paletteTexture);
    this.setPalette(palette);


}

/**
 * Builds WebGL shader programs
 * @param {WebGLRenderingContext} gl 
 * @param {String} vertexShaderSource Source code for vertext shader
 * @param {String} fragmentShaderSource Source code for fragment shader
 * @returns 
 */
 function buildProgram(gl, vertexShaderSource, fragmentShaderSource){
			
    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertexShaderSource);
    gl.compileShader(vertShader);
    if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
        throw "ERROR IN VERTEX SHADER : " + gl.getShaderInfoLog(vertShader);
    }

    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragmentShaderSource);
    gl.compileShader(fragShader);
    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
        throw "ERROR IN FRAG SHADER : " + gl.getShaderInfoLog(fragShader);
    }

    var program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw "Unknown error in program";
    }

   return program;
}

export{Graphics, buildProgram}