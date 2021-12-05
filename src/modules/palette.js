//@ts-check

/**
 * A simple structure for dealing with color stops
 * @typedef {{color: string, value: number}} ColorStop 
 */

/**
 * Creates color gradients using the given stops
 * @param {ColorStop[]} colorStops 
 * @param {boolean} forceSpacing 
 */
function Palette(colorStops, forceSpacing=false){
    var canvas = document.createElement('canvas');
    var ct = canvas.getContext('2d');

    
    /**
     * Generates an array with setps count of RGBA values in a Uint8Clamped array
     * @param {number} steps
     * @returns {Uint8ClampedArray} RGBA image data
     */
    this.generateColorData = function(steps){
        canvas.width = steps;
        var grad = ct.createLinearGradient(0, 0, steps - 1, 1);

        if(!forceSpacing){
            for(var i = 0; i < colorStops.length; i++){
                var stop = colorStops[i];
                grad.addColorStop(stop.value, stop.color);
            }
        }else{
            // Sort the color stops
            /**@type {ColorStop[]} */
            var sortedStops = [];

            for(var i = 0; i < colorStops.length; i++){
                var j = 0;
                for(;j < sortedStops.length; j++){
                    if(colorStops[i].value < sortedStops[j].value){
                        break;
                    }
                }
                sortedStops.splice(j, 0, colorStops[i]);
            }

            // Add them to gradient
            for(var i = 0; i < sortedStops.length; i++){
                grad.addColorStop(i / (sortedStops.length - 1), sortedStops[i].color);
            }
        }

        // Draw the gradient
        ct.fillStyle = grad;
        ct.fillRect(0, 0, steps, 1);

        return ct.getImageData(0, 0, steps, 1).data;
    }
}

export {Palette}