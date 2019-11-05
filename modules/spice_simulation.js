/*
SPICE simulation module for the dark_side project.
*/


function SpiceSimulation(){
    `
    To compute planets positions and orientations until spice is implemented.
    `

    this.spkpos = function(name, time, frame, correction, central_body){
        `
        Give planet position.
        Input:
            -name           string
                spice compatible planet name
            -time           float
                et time
            -frame          string
                spice compatible reference frame name
            -correction     string
            -central_body   string
                spice compatible planet name
        `

        if (name == "EARTH"){
            return [
                7.0 * Math.cos(time),
                7.0 * Math.sin(time),
                -20
            ];
        };
        if (name == "MOON"){
            return [
                7.0 * Math.cos(time) + 3.0 * Math.cos(time * 3),
                7.0 * Math.sin(time) + 3.0 * Math.sin(time * 3),
                -20,
            ];
        };
        if (name == "SUN"){
            return [
                0.0,
                0.0,
                -20
            ];
        };
    };

    this.pxform = function(frame, name, time){
        `
        Give planet orientation.
        Input:
            -frame          string
                spice compatible reference frame name
            -name           string
                spice compatible IAU planet name
            -time           float
                et time
        `

        return [
            [1.0, 0.0, 0.0],
            [0.0, 1.0, 0.0],
            [0.0, 0.0, 1.0],
        ];
    };
}


export { SpiceSimulation }
