// This IIFE (aka closure) is for style preference only; it helps to prevent
// things inside from polluting the global namespace. It is completely optional.

// The leading semicolon is also a defensive measure when concatenating several
// JavaScript files into one.
; (function () {

    // This line enables 'strict mode'. It helps you to write cleaner code,
    // like preventing you from using undeclared variables.
    "use strict";

    // Initialize the resizer
    resizer.init();


    // Initialize the template
    template.init();


    //////////////////////////
    // Variable declarations
    //////////////////////////

    // Grab some important values from the resizer
    let myCanvas = resizer.getCanvas();
    let ctx = myCanvas.getContext("2d");

    // Is the game volume muted?
    let volumeMuted = false;



    //////////////////////////
    // Resize events
    /////////////////////////

    // this is a function so I can minimize it in vscode
    function initResizer() {
        // Every time the Resizer resizes things, do some extra
        // recaculations to position the sample button in the center
        resizer.addResizeEvent(template.resizeBarButtons);

        // Manual resize to ensure that our resize functions are executed
        // (could have also just called resizerBarButtons() but this will do for demonstration purposes)
        resizer.resize();


        //////////////////////////
        // Button events
        //////////////////////////

        // Remove not implemented menus for those buttons we are implementing
        template.removeNotImplemented(template.menuButtons.restart);
        template.removeNotImplemented(template.menuButtons.exit);
        template.removeNotImplemented(template.menuButtons.volume);

        // Confirm the user wants to restart the game
        // (restart not yet implemented, so show "not implemented" menu)
        template.addConfirm(template.menuButtons.restart, "RESTART", function () {
            template.showMenu(template.menus.notImplemented);
        });

        // Confirm if the user wants to exit the game (takes user to main website)
        template.addConfirm(template.menuButtons.exit, "EXIT", template.goToBGL);

        // Change icon of volume button on click
        template.menuButtons.volume.addEventListener("click", function () {
            volumeMuted = !volumeMuted;

            if (volumeMuted) {
                template.setIcon(template.menuButtons.volume, "no-volume-icon");
            }
            else {
                template.setIcon(template.menuButtons.volume, "volume-icon");
            }
        }, false);

    }

    const GAME_WIDTH = resizer.getGameWidth();
    const GAME_HEIGHT = resizer.getGameHeight();
    const margin = 10;
    let initialized = false;
    let tPrev = 0;
    let tokenTemplate = {
        colors: ["red", "blue", "green", "black"],
        shapes: ["square", "diamond", "circle"],
        quantity: [1, 2, 3, 4], // not used
        fill: ["solid", "empty"]
    }


    /////////////////////////////////////
    // Function definitions
    /////////////////////////////////////

    // Example helper function to do an arbitrary thing with the canvas
    /* function step(timestamp) {
        // Set the 
        if (!initialized) {
            tPrev = timestamp;
            initialized = true;
        } else {
            deltaT = timestamp - tPrev;
            tPrev = timestamp;
        }
    }; */

    // 
    function createToken() {
        return {
            color: tokenTemplate.colors[randomInt(0, 3)],
            shape: tokenTemplate.shapes[randomInt(0, 2)],
            quantity: randomInt(1, 4),
            fill: tokenTemplate.fill[randomInt(0, 1)]
        }
    }

    // generate a random integer between min and max inclusive
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function drawScene(tokens) {
        // where to draw the ith card
        function posn(i) {
            return {
                x: 20 + (100 * i % 500),
                y: 160 + 160 * Math.floor(i / 5)
            }
        }
        let x;
        let y;
        for (let i = 0; i < tokens.length; i++) {
            // where do we draw this token?
            x = posn(i).x;
            y = posn(i).y;

            // draw the card
            ctx.fillStyle = "grey";
            ctx.strokeStyle = "grey";
            ctx.str
            ctx.fillRect(x, y, 80, 120);


            // x and y will change when drawing symbols on card
            let oldX = x;
            let oldY = y;
            x += 10;
            y += 30;

            // start the path 
            ctx.beginPath();
            ctx.fillStyle = tokens[i].color;
            ctx.strokeStyle = tokens[i].color;

            // draw the symbols
            for (let j = 1; j <= tokens[i].quantity; j++) {
                ctx.beginPath();
                switch (tokens[i].shape) {
                    case "square":
                        ctx.moveTo(x, y);
                        ctx.lineTo(x + 25, y);
                        ctx.lineTo(x + 25, y + 25);
                        ctx.lineTo(x, y + 25);
                        ctx.lineTo(x, y);
                        break;
                    case "circle":
                        ctx.arc(x + 12.5, y + 12.5, 12.5, 0, 2 * Math.PI);
                        break;
                    case "diamond":
                        ctx.moveTo(x, y);
                        ctx.moveTo(x + 12.5, y);
                        ctx.lineTo(x + 20, y + 12.5);
                        ctx.lineTo(x + 12.5, y + 25);
                        ctx.lineTo(x + 5, y + 12.5);
                        ctx.lineTo(x + 12.5, y);
                        break;
                    case "triangle":
                        break;
                    default:
                        console.log("Error: " + tokens[i].shape + " is not a valid shape");
                }
                if (tokens[i].fill == "solid") {
                    ctx.fill();
                }
                ctx.stroke();

                if (j % 2 == 1) {
                    x += 30;
                } else {
                    y += 30;
                    x -= 30;
                }
            }
        }
    }

    // window.addEventListener("mousedown");


    /////////////////////////////////////
    // Mainline logic
    /////////////////////////////////////

    // now this is epic
    initResizer();
    let tokens = [];
    for (let i = 0; i < 12; i++) {
        tokens.push(createToken());
    }
    drawScene(tokens);
    console.log(tokens);


    // Close and execute the IIFE here
})();