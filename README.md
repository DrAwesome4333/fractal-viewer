# Fractal Viewer

A fast experimental Fractal Viewer based on WebGL.

## How to use
You can click any location to make that point the center of the image or you can punch in the coordinates for the center on the bottom.  
Likewise you can enter the axis length or use the scroll wheel to change the zoom level.  
You can change other parameters of the fractal and which fractal you are using by chaning the inputs on the bottom.  
Hope this helps people find more interesting parts of the fractal to make higher resolution images of in Python for Assignment 4.1! 

## How it works in a nutshell:
This webpage takes advantage of the OpenGL functions available through the WebGL API to use the GPU instead of the CPU to compute the color of each pixel of the fractal.  
There is a dictionary of information on how each fractal should start when doing its algorithm as well has how to advance using the availalbe variables C, P, and the complex input.  
Obviously there is a lot more going on than that, if you have any questions feel free to email me at DavidMendenhallact4333@gmail.com