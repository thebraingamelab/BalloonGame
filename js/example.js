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
    let score = 0;
    let lastPick;
    let selected = 0;
    let turns = 40;
    let gameOver = false;
    let tokenTemplate = {
        colors: ["red", "blue", "green", "black"],
        shapes: ["square", "diamond", "circle"],
        quantity: [1, 2, 3, 4], // not used
        fill: ["solid", "empty"]
    }
    const scoringRules = createScoringRules();

    function createScoringRules() {
        let tempArray = [-1, 1, 2, 3]
        shuffleArray(tempArray);
        let colorRules = {
            "red": tempArray[0],
            "blue": tempArray[1],
            "green": tempArray[2],
            "black": tempArray[3]
        }

        tempArray = [-1, 2, 4];
        shuffleArray(tempArray);
        let shapeRules = {
            "square": tempArray[0],
            "diamond": tempArray[1],
            "circle": tempArray[2],
        }

        tempArray = [-1, 1, 2, 3];
        shuffleArray(tempArray);
        let quantityRules = tempArray;

        tempArray = [-1, 2];
        console.log("current value of quantityRules: " + quantityRules);
        shuffleArray(tempArray);
        let fillRules = {
            solid: tempArray[0],
            empty: tempArray[1]
        }

        return {
            colorRules: colorRules,

            shapeRules: shapeRules,

            quantityRules: quantityRules,

            fillRules: fillRules
        }
    }



    /////////////////////////////////////
    // Function definitions
    /////////////////////////////////////

    // returns the scoring function. 
    // this might be stupid but it should work


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

    // stole this from stackoverflow. It should probably work
    function shuffleArray(arr) {
        for (let i = 0; i < arr.length; i++) {
            let j = randomInt(0, i);
            let temp = arr[i]
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }

    function drawScene(tokens) {
        ctx.clearRect(0, 0, 540, 960); // clear the frame
        // where to draw the ith card
        function posn(i) {
            return {
                x: 20 + (100 * i % 500),
                y: 200 + 160 * Math.floor(i / 5)
            }
        }
        if (gameOver == false) {
            ctx.save();
            // halo around selected card
            ctx.fillStyle = "blue";
            if (selected == 15) { // halo is different for selected button
                ctx.fillRect(195, 675, 130, 70);
            } else {
                ctx.fillRect(posn(selected).x - 5, posn(selected).y - 5, 90, 130);
            }

            // draw the reset button
            ctx.fillStyle = 'grey'
            ctx.fillRect(200, 680, 120, 60)
            ctx.font = '36px serif'
            ctx.fillStyle = 'yellow'
            ctx.fillText("Reroll", 205, 720)

            for (let i = 0; i < tokens.length; i++) {
                drawToken(posn(i).x, posn(i).y, tokens[i], 1);
            }

            // draw the text
            ctx.restore();
            ctx.font = '36px serif';
            ctx.fillText("Score: " + score, 190, 880);
            ctx.font = '24px serif'
            ctx.fillText("Turns remaining: " + turns, 120, 920);
            ctx.fillText
            if (lastPick != null) {
                ctx.fillText("+ " + lastPick.score + " points. Last pick", 100, 820);
                drawToken(400, 770, lastPick.card, 0.5);
            }
        } else { // draw gameover screen
            ctx.font = '48px serif'
            ctx.fillText("Game Over", 120, 400);
            ctx.fillText("Score: " + score, 120, 450);
            console.log("drawing gameover screen");
        }
    }

    // draws a token with top left corner (x,y), and the given scale
    function drawToken(x, y, token, scale) {
        // draw the card
        ctx.save();
        ctx.fillStyle = "grey";
        ctx.strokeStyle = "grey";
        ctx.fillRect(x, y, 80 * scale, 120 * scale);


        // x and y will change when drawing symbols on card
        x += 10 * scale;
        y += 30 * scale;

        // start the path 
        ctx.beginPath();
        ctx.fillStyle = token.color;
        ctx.strokeStyle = token.color;

        // draw the symbols
        for (let j = 1; j <= token.quantity; j++) {
            ctx.beginPath();
            switch (token.shape) {
                case "square":
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + 25 * scale, y);
                    ctx.lineTo(x + 25 * scale, y + 25 * scale);
                    ctx.lineTo(x, y + 25 * scale);
                    ctx.lineTo(x, y);
                    break;
                case "circle":
                    ctx.arc(x + 12.5 * scale, y + 12.5 * scale, 12.5 * scale, 0, 2 * Math.PI);
                    break;
                case "diamond":
                    ctx.moveTo(x, y);
                    ctx.moveTo(x + 12.5 * scale, y);
                    ctx.lineTo(x + 20 * scale, y + 12.5 * scale);
                    ctx.lineTo(x + 12.5 * scale, y + 25 * scale);
                    ctx.lineTo(x + 5 * scale, y + 12.5 * scale);
                    ctx.lineTo(x + 12.5 * scale, y);
                    break;
                case "triangle":
                    break;
                default:
                    console.log("Error: " + token.shape + " is not a valid shape");
            }
            if (token.fill == "solid") {
                ctx.fill();
            }
            ctx.stroke();

            if (j % 2 == 1) {
                x += 30 * scale;
            } else {
                y += 30 * scale;
                x -= 30 * scale;
            }
        }
        ctx.restore();
    }

    function selectCard() {
        if (turns > 0) {
            if (selected == 15) {
                //selected = 0;
                tokens = [];
                for (let i = 0; i < 15; i++) {
                    tokens.push(createToken());
                }
                turns--;
            } else {
                lastPick = {
                    card: tokens[selected],
                    score: getScore(tokens[selected])
                }
                score += lastPick.score;
                tokens[selected] = createToken();
                console.log("last pick: " + lastPick);
                turns--;
            }
        }
    }

    function getScore(token) {
        let value = 0;

        value += scoringRules.colorRules[token.color];
        value += scoringRules.shapeRules[token.shape];
        value += scoringRules.quantityRules[token.quantity - 1]; //subtract 1 because arrays index from 0
        value += scoringRules.fillRules[token.fill];

        return value;
    }


    window.addEventListener("keydown", keyDownHandler);

    function keyDownHandler(key) {
        let oldSlected = selected;
        if (turns == 0) {
            gameOver = true;
            console.log("game over");
        }
        switch (key.keyCode) {
            case 37: // left
                selected--;
                break;
            case 38: // up
                if (selected == 15) {
                    selected = 12;
                } else {
                    selected -= 5;
                }
                break;
            case 39: // right
                selected++;
                break;
            case 40: // down
                selected += 5;
                break;
            case 32:
                selectCard();
                break;
        }
        if (selected > 15) {
            selected = 15;
        } if (selected < 0) {
            selected = oldSelected;
        }

        drawScene(tokens);

        // console.log("keydown event with keycode " + key.keyCode); 
        // console.log("selected = " + selected);
    }

    /* function handleClick(input){
        let x = input.clientX;
        let y = input.clientY;
        ctx.fillRect(x,y,20,20);
        console.log("logged mouse input at x=" + x + ", y=" + y);
    }
    
    window.addEventListener("mousedown", handleClick); */


    /////////////////////////////////////
    // Mainline logic
    /////////////////////////////////////

    // now this is epic
    initResizer();
    let tokens = [];
    for (let i = 0; i < 15; i++) {
        tokens.push(createToken());
    }
    ctx.clearRect(0, 0, 540, 960);
    drawScene(tokens);
    console.log(tokens);
    console.log("scoring Rules:");
    console.log(scoringRules.colorRules);
    console.log(scoringRules.fillRules);
    console.log(scoringRules.shapeRules);
    console.log(scoringRules.quantityRules);


    // Close and execute the IIFE here
})();