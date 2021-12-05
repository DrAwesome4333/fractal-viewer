// @ts-check

import {buildProgram} from "./graphics.js";
/**
 * Data structure for a point
 * @typedef {{x:number, y:number}} Point
 */

/**
 * Format of configuration objects
 * @typedef Configuration
 * @property {Point} center Center location of the fractal
 * @property {number} axisLength The height and width of the complex plane section to render
 * @property {number} iterations The number of iterations to calculate before a sequence is considered unbonded.
 * @property {Point} c The input c given a fractal accepts it
 * @property {Point} p The input p given a fractal accepts it
 */


/**
 * Creates a fractal generator that can be passed to a graphics object for rendering
 * @param {WebGL2RenderingContext} gl
 * @param {String} name User friendly name to display with fractal
 * @param {String} startFunc GLSL unction used to initialize each fractal's settings Uses the following signature:
 * void setup(inout vec2 _z, inout vec2 _c, in vec2 _loc, inout vec2 _data1, inout vec2 _data2)
 * @param {String} nextFunc GLSL unction used to advance each fractal's iteration Use the following signature:
 * void next(inout vec2 _z, inout vec2 _c)
 */
function Fractal(gl, name, startFunc, nextFunc){
    this.name = name;

    /**
     * Sets the clip space of the fractal
     * @param {Point[]} points 
     */
    this.setClipSpace = function(points){
        gl.bindVertexArray(vertexArrayBuffer);

        gl.bindBuffer(gl.ARRAY_BUFFER, clipBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(
            [points[0].x, points[0].y,
            points[1].x, points[1].y,
            points[2].x, points[2].y,
            points[3].x, points[3].y]),
            gl.STATIC_DRAW);

        gl.bindVertexArray(null);
    }


    /**
     * Draws the fractal with a given configuraiton
     * @param {Configuration} config 
     */
    this.draw = function(config){
        gl.useProgram(program);
        gl.bindVertexArray(vertexArrayBuffer);

        // Update uniforms
        gl.uniform2f(cLoc, config.c.x, config.c.y);
        gl.uniform2f(pLoc, config.p.x, config.p.y);
        gl.uniform1i(iterLoc, config.iterations);

        var axisLength = config.axisLength;
        var center = config.center;

        var coordArray = new Float32Array(
            [
                -axisLength/2+center.x, axisLength/2+center.y,
                -axisLength/2+center.x, -axisLength/2+center.y,
                axisLength/2+center.x, -axisLength/2+center.y,
                axisLength/2+center.x, axisLength/2+center.y
            ]);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, coordArray);
        
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
        gl.flush();
    }

    var fragSource = `#version 300 es
    precision highp float;
    
    const float PI = 3.1415926535897932384626433832795;
    const int COLOR_COUNT = 256;
    
    uniform sampler2D color_palette;
    uniform vec2 data1;
    uniform vec2 data2;
    uniform int maxSteps;
    
    in vec2 _pos;
    out vec4 color;
    
    int iteration;
    vec2 z;
    vec2 c;
    vec2 _data1;
    vec2 _data2;
    
    void next(inout vec2 _z, inout vec2 _c){
    ${nextFunc}
    }
    
    void setup(inout vec2 _z, inout vec2 _c, in vec2 _loc, inout vec2 _data1, inout vec2 _data2){
    ${startFunc}
    }
    
    void main(){
        _data1 = data1;
        _data2 = data2;
        setup(z, c, _pos, _data1, _data2);
    
        iteration = maxSteps;
    
        for(int i = 0; i < maxSteps; i += 1){
            next(z, c);
            if(z.x * z.x + z.y * z.y > 4.0){
                iteration = i;
                break;
            }
        }
        
        color = texture(color_palette, vec2(float(iteration) / float(COLOR_COUNT), 0.0));
    }`

    
    var vertexSource = `#version 300 es
    in vec2 pos;
    in vec2 coords;
    out vec2 _pos;
    void main(){
        gl_Position = vec4(pos.x, pos.y , 0.0, 1.0);
        _pos = coords;
    }`

    var program = buildProgram(gl, vertexSource, fragSource);
    var vertexArrayBuffer = gl.createVertexArray();
    var posBuffer = gl.createBuffer();
    var clipBuffer = gl.createBuffer();
    var ELE_BUFFER = gl.createBuffer();

    
    gl.useProgram(program);
    
    var clipPosLoc = gl.getAttribLocation(program, "pos");
    var posLoc = gl.getAttribLocation(program, "coords");
    var cLoc = gl.getUniformLocation(program, "data1");
    var pLoc = gl.getUniformLocation(program, "data2");
    var iterLoc = gl.getUniformLocation(program, "maxSteps");

    this.setClipSpace([
        {x: -1, y:1},
        {x: -1, y:-1},
        {x: 1, y:-1},
        {x: 1, y:1},
    ])

    gl.bindVertexArray(vertexArrayBuffer);

    gl.bindBuffer(gl.ARRAY_BUFFER, clipBuffer);
    // Data was already buffered in setClipSpace()

    gl.enableVertexAttribArray(clipPosLoc);
    gl.vertexAttribPointer(clipPosLoc, 2, gl.FLOAT, false, 2 * 4, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1, -1,-1, 1,-1, 1,1]), gl.DYNAMIC_DRAW);

    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 2 * 4, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ELE_BUFFER);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);

    gl.bindVertexArray(null);

}


var FRACTAL_INFO = {
    'mandelbrot':{
        'name': 'Mandelbrot',
        'setup':`
        _z = _data1;
        _c = _loc;
        `,
        'next':`
        // save old value
        vec2 tmp = _z;
        // calculate new ones
        _z.x = tmp.x * tmp.x - tmp.y * tmp.y;
        _z.y = tmp.y * tmp.x * 2.0;
        _z += _c;
        `,
        'data1':[0,0],
        'data2':[0,0]
    }, 
    'mandelbrot3':{
        'name': 'Mandelbrot 3',
        'setup':`
        _z = _data1;
        _c = _loc;
        `,
        'next':`
        // save old value
        vec2 tmp = _z;
        // calculate new ones
        _z.x = tmp.x * tmp.x * tmp.x - 3.0 * tmp.x * tmp.y * tmp.y;
        _z.y = 3.0 * tmp.x * tmp.x * tmp.y - tmp.y * tmp.y * tmp.y;
        _z += _c;
        `,
        'data1':[0,0],
        'data2':[0,0]
    }, 
    'mandelbrot4':{
        'name': 'Mandelbrot 4',
        'setup':`
        _z = _data1;
        _c = _loc;
        `,
        'next':`
        // save old value
        vec2 tmp = _z;
        // calculate new ones
        _z.x = tmp.x * tmp.x * tmp.x * tmp.x - 6.0 * tmp.x * tmp.x * tmp.y * tmp.y + tmp.y * tmp.y * tmp.y * tmp.y;
        _z.y = 4.0 * tmp.x * tmp.x * tmp.x * tmp.y - 4.0 * tmp.x * tmp.y * tmp.y * tmp.y;
        _z += _c;
        `,
        'data1':[0,0],
        'data2':[0,0]
    },
    'julia':{
        'name': 'Julia',
        'setup':`
        _z = _loc;
        _c = _data1;`,
        'next':`
        // save old value
        vec2 tmp = _z;
        // calculate new ones
        _z.x = tmp.x * tmp.x - tmp.y * tmp.y;
        _z.y = tmp.y * tmp.x * 2.0;
        _z += _c;
        `,
        'data1':[-1.0,0],
        'data2':[0,0]
    },
    'ship':{
        'name': 'Burning Ship',
        'setup':`
        _z = _data1;
        _c = _loc;`,
        'next':`
        // save old value
        vec2 tmp = _z;
        // calculate new ones
        _z.x = tmp.x * tmp.x - tmp.y * tmp.y;
        _z.y = 2.0 * abs(tmp.x * tmp.y);
        _z -= _c;
        `,
        'data1':[0,0],
        'data2':[0,0]
    },
    'juliaShip':{
        'name': 'Burning Julia Ship',
        'setup':`
        _z = _loc;
        _c = _data1;`,
        'next':`
        // save old value
        vec2 tmp = _z;
        // calculate new ones
        _z.x = tmp.x * tmp.x - tmp.y * tmp.y;
        _z.y = 2.0 * abs(tmp.x * tmp.y);
        _z -= _c;
        `,
        'data1':[-0.598, 0.9226],
        'data2':[0,0]
    },
    'phoenix':{
        'name': 'Phoenix',
        'setup':`
        _z = _loc.yx;
        _c = _data1.xy;
        // Use data1 for old z
        _data1 = vec2(0.0,0.0);
        `,
        'next':`
        // save old value
        vec2 tmp = _z;
        // calculate new ones
        _z.x = tmp.x * tmp.x - tmp.y * tmp.y + _data1.x * _data2.x - _data1.y * _data2.y;
        _z.y = 2.0 * tmp.x * tmp.y + _data1.x * _data2.y + _data1.y * _data2.x;
        _z += _c;
        _data1 = tmp;
        `,
        'data1':[0.5667, 0.0],
        'data2':[-0.5,0]
    }
}
export {Fractal, FRACTAL_INFO}