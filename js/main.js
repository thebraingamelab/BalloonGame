// This IIFE (aka closure) is for style preference only; it helps to prevent
// things inside from polluting the global namespace. It is completely optional.

// The leading semicolon is also a defensive measure when concatenating several
// JavaScript files into one.
//; (function () {

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
let gameState = 1; //2: pre-game menu, 1: game in progress, 0: game over
const scoringRules = createScoringRules();





/////////////////////////////////////
// Function definitions
/////////////////////////////////////

function drawScene(tokens) {
    ctx.clearRect(0, 0, 540, 960); // clear the frame
    // where to draw the ith card
    function posn(i) {
        return {
            x: 20 + (100 * i % 500),
            y: 200 + 160 * Math.floor(i / 5)
        }
    }

    // for position of menu elements?
    // I'm pretty sure this is a dumb way to do it but it works decently well for now
    function mPosn(x, y) {
        return {
            x: 100 + 200 * x,
            y: 300 + 200 * y
        }
    }
    if (gameState == 2) {
        ctx.save();
        let hPosn = mPosn(Math.floor(selected / 3), selected % 3); // this is stupid
        ctx.fillStyle = "orange"
        ctx.fillRect(hPosn.x - 5, hPosn.y - 5, 110, 60); // this is extremely stupid

        ctx.fillStyle = "red";
        ctx.font = "24px serif";

        ctx.fillText("Symbols", 96, 180);
        ctx.fillText("per card", 96, 205);

        ctx.fillText("Scoring rules", 260, 190);

        drawMenuElement(1, 1, "always 4");
        drawMenuElement(1, 2, "always 1");
        drawMenuElement(1, 3, "random");

        drawMenuElement(2, 1, "linear");
        drawMenuElement(2, 2, "random");
        drawMenuElement(2, 3, "complex");

        ctx.restore()
    } else if (gameState == 1) { // gamne is in progress
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
            drawCard(tokens[i].x, tokens[i].y, tokens[i].symbols, 1);
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
            drawCard(400, 770, lastPick.card, 0.5);
        }
    } else if (gameState == 0) { // game over
        ctx.font = '48px serif'
        ctx.fillText("Game Over", 120, 400);
        ctx.fillText("Score: " + score, 120, 450);
        console.log("drawing gameover screen");
    }
}

function drawMenuElement(x, y, text) {
    x = -100 + 200 * x;
    y = 100 + 200 * y;

    ctx.font = "18px serif";
    ctx.fillStyle = "grey";
    ctx.strokeStyle = "grey";
    ctx.fillRect(x, y, 100, 50);
    ctx.fillStyle = "blue"
    ctx.fillText(text, x + 8, y + 30);
}
// draws a token with top left corner (x,y), and the given scale
function drawCard(x, y, card, scale) {
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
    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";

    // draw the symbols
    // 25 by 25
    for (let j = 1; j <= card.length; j++) {
        ctx.beginPath();
        switch (card[j - 1]) {
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
                ctx.moveTo(x + 12.5 * scale, y);
                ctx.lineTo(x + 25 * scale, y + 25 * scale);
                ctx.lineTo(x, y + 25 * scale);
                ctx.lineTo(x + 12.5 * scale, y);
                break;
            case "star":
                ctx.drawImage(star, x, y, 25 * scale, 25 * scale);
                break;
            case "bolt":
                ctx.drawImage(bolt, x, y, 25 * scale, 25 * scale);
                break;
            default:
                console.log("Error: " + card[j - 1] + " is not a valid shape");
        }
        ctx.fill();

        // move draw location to draw next symbol
        if (j % 2 == 1) {
            x += 30 * scale;
        } else {
            y += 30 * scale;
            x -= 30 * scale;
        }
    }
    ctx.restore();
}






// window.addEventListener("keydown", keyDownHandler);
document.addEventListener("click", handleClick);
document.addEventListener("mousedown", handleMouseDown)
document.addEventListener("mouseup",() => {
    selected = -15;
  })

function handleClick(input) {
    let posn = resizer.getRelativeEventCoords(input);
    let x = posn.x;
    let y = posn.y;
    console.log("logged mouse move at x=" + x + ", y=" + y);

    if (gameState == 1) {
        for (let i = 0; i < 15; i++) {
            let dX = x - tokens[i].x;
            let dY = y - tokens[i].y;
            /* if (i == 0) {
                console.log("relative position to card " + i + ": (" + dX + "," + dY + ").");
            } */
            if (dX > 0 && dX < 80 && dY > 0 && dY < 120) {
                console.log("card " + i + " selected");
                lastPick = {
                    card: tokens[i].symbols, //should be symbols not card but I'm too lazy to change it
                    score: getScore(tokens[i])
                }
                score += lastPick.score;
                tokens[i] = createCard(i);
                console.log("last pick: " + lastPick);
                turns--;

                return;
            }
        }
        if (x > 200 && x < 320 && y > 680 && y < 740) {
                //selected = 0;
                tokens = [];
                for (let i = 0; i < 15; i++) {
                    tokens.push(createCard(i));
                }
                turns--;
        }
    }
}

function handleMouseDown(input){
    let posn = resizer.getRelativeEventCoords(input);
    let x = posn.x;
    let y = posn.y;
    console.log("logged mouse move at x=" + x + ", y=" + y);

    if (gameState == 1) {
        for (let i = 0; i < 15; i++) {
            let dX = x - tokens[i].x;
            let dY = y - tokens[i].y;
            /* if (i == 0) {
                console.log("relative position to card " + i + ": (" + dX + "," + dY + ").");
            } */
            if (dX > 0 && dX < 80 && dY > 0 && dY < 120) {
                selected = i;
                return;
            }
        }
        if (x > 200 && x < 320 && y > 680 && y < 740) {
                selected = 15;
        }
    }
}

// \begin{badfunctions}
function keyDownHandler(key) {
    if (turns == 0) {
        gameState = 0; //switch to game over when turns run out
        console.log("game over");
    }
    logic.oldSelected = selected;
    if (gameState == 2) {
        switch (key.keyCode) {
            case 37: // left
                selected -= 3;
                break;
            case 38: // up
                selected--
                break;
            case 39: // right
                selected += 3;
                break;
            case 40: // down
                selected++;
                break;
            case 32:
                keyboardSelect();
                break;
        }
    }
    else if (gameState == 1) {
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
                keyboardSelect();
                break;
        }
    }



    // console.log("keydown event with keycode " + key.keyCode); 
    // console.log("selected = " + selected);
}

function keyboardSelect() {
    if (gameState == 1) { // select card
        if (selected == 15) {
            //selected = 0;
            tokens = [];
            for (let i = 0; i < 15; i++) {
                tokens.push(createCard(i));
            }
            turns--;
        } else {
            lastPick = {
                card: tokens[selected].symbols, //should be symbols not card but I'm too lazy to change it
                score: getScore(tokens[selected])
            }
            score += lastPick.score;
            tokens[selected] = createCard(selected);
            console.log("last pick: " + lastPick);
            turns--;
        }
    } else if (gameStateState == 2) { // logic involving selecting gamemode
    }
}
// \end{badfunctions}

/////////////////////////////////////
// Mainline logic
/////////////////////////////////////

// now this is epic
let star = new Image();
let bolt = new Image();


function newFrame() {
    /* if (gameState == 1) { //[0,14]: cards. 15: reroll button
        if (selected > 15) {
            selected = 15;
        } if (selected < 0) {
            selected = logic.oldSelected;
        }
    } else if (gameState == 2) {
        if (selected > 5) {
            selected = logic.oldSelected;
        } else if (selected < 0) {
            selected = logic.oldSelected;
        }
    } */ // outdated code
    if (turns <= 0){
        gameState = 0;
    }

    drawScene(tokens);
    window.requestAnimationFrame(newFrame);
}

function init() {
    star.src = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.shareicon.net%2Fdata%2F2015%2F12%2F07%2F683924_star_512x512.png&f=1&nofb=1"
    bolt.src = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fd30y9cdsu7xlg0.cloudfront.net%2Fpng%2F9601-200.png&f=1&nofb=1"
    initResizer();
    for (let i = 0; i < 15; i++) {
        tokens.push(createCard(i));
    }
    ctx.clearRect(0, 0, 540, 960);

    newFrame();

    // log some stuff
    console.log("scoring Rules:");
    console.log(scoringRules);
}

let tokens = [];
init();
    // Close and execute the IIFE here
// })();

