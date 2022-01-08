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

// const scoringRules = createLinearScoringRules();
// var scoringRules = createVariableScoringRules();
// scoringRules = createBanditScoringRules(12,-3,7);
var scoringTemplate;
var scoringRules = createScoringRule();
/* var scoringRules = createHardIncludeExclude("easy");
scoringRules = createEasyIncludeExclude(false);
scoringRules = createPositionalRule(true);
scoringRules = createDuplicateRule(); */

// console.log("scoring rules: " + scoringRules);

function setDifficulty(dif) {
    scoringRules = createHardIncludeExclude(dif);
    scoringTemplate = "includeExclude"
    console.log("new scoring rules: ");
    console.log(scoringRules);
}


// Graphics ELements
// let star = new Image();
let bolt = new Image();
let fire = new Image();
let fire2 = new Image();
let flask = new Image();

function loadGraphics() {
    //  star.src = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.shareicon.net%2Fdata%2F2015%2F12%2F07%2F683924_star_512x512.png&f=1&nofb=1"
    bolt.src = "graphics/bolt.png"
    fire.src = "graphics/fire.jpg"
    fire2.src = "graphics/firething.png"
    flask.src = "icons/flask.svg"
}


/////////////////////////////////////
// Function definitions
/////////////////////////////////////


function updateButtons() {
    switch (gameState) {
        case "discovery": // inb4 "shouldn't this be 'discovering' since the other state is testing" 
            buttons = [
                // empty flask
                {
                    name: "empty",
                    x: 100,
                    y: 615,
                    width: 120,
                    height: 50,
                    display: {
                        color: "#aaaaaa",
                        font: '32px serif',
                        text: "Empty",
                        textColor: "yellow",
                        textX: 12,
                        textY: 35,
                    },
                },

                // undo
                {
                    name: "undo",
                    x: 300,
                    y: 615,
                    width: 120,
                    height: 50,
                    display: {
                        color: "#aaaaaa",
                        font: '32px serif',
                        text: "Undo",
                        textColor: "yellow",
                        textX: 12,
                        textY: 35,
                    },
                },

                {
                    name: "mix",
                    x: 160,
                    y: 530,
                    width: 200,
                    height: 60,
                    display: {
                        color: "#444444",
                        font: '48px serif',
                        text: "MIX!",
                        textColor: "yellow",
                        textX: 40,
                        textY: 45,
                    },
                }, 

                {
                    name: "skip",
                    x: 150,
                    y: 900,
                    width: 220,
                    height: 40,
                    display: {
                        color: "#444444",
                        font: '26px serif',
                        text: "I've figured it out",
                        textColor: "orange",
                        textX: 15,
                        textY: 28,
                    },
                }
            ]
            break;
        case "classification":
            buttons = [
                {
                    name: "reacts",
                    x: 160,
                    y: 770,
                    width: 200,
                    height: 60,
                    display: {
                        // color: "#006400",
                        color: "#EEBC1D",
                        font: '28px serif',
                        text: "REACTS",
                        textColor: "white",
                        textX: 40,
                        textY: 40,
                    },
                },

                {
                    name: "doesn't react",
                    x: 160,
                    y: 850,
                    width: 200,
                    height: 60,
                    display: {
                        // color: "#8B0000",
                        color: "#A9A9A9",
                        font: '22px serif',
                        text: "DOESN'T REACT",
                        textColor: "white",
                        textX: 15,
                        textY: 40,
                    },
                }
            ]
            break;
        default:
            buttons = [];
    }
}

function switchState(state) {
    gameState = state;
    updateButtons();
    if (gameState == "classification") {
        // Hide old HTML elements and show new ones.
        // there's probably a better way to do this but I'm too lazy to figure it out.
        blueVial.style.display = "none"
        purpleVial.style.display = "none"
        redVial.style.display = "none"
        yellowVial.style.display = "none"
        greenVial.style.display = "none"
        orangeVial.style.display = "none"
        // leftArrow.style.display = "none";
        // rightArrow.style.display = "none";

        leftArrow2.style.display = "";
        rightArrow2.style.display = "";

        flaskContents = [];
        lastPick = null;
        classificationSet = generateClassificationSet();

        // for (let i=0; )
    } else if (state == "discovery") {
        leftArrow2.style.display = "none";
        rightArrow2.style.display = "none";

    } else if (state == "end"){
        blueVial.style.display = "none"
        purpleVial.style.display = "none"
        redVial.style.display = "none"
        yellowVial.style.display = "none"
        greenVial.style.display = "none"
        orangeVial.style.display = "none"
        leftArrow.style.display = "none";
        rightArrow.style.display = "none";
        leftArrow2.style.display = "none";
        rightArrow2.style.display = "none";
    }
}

function drawButtons() {
    for (let i = 0; i < buttons.length; i++) {
        ctx.fillStyle = buttons[i].display.color;
        ctx.fillRect(buttons[i].x, buttons[i].y, buttons[i].width, buttons[i].height);
        ctx.font = buttons[i].display.font;
        ctx.fillStyle = buttons[i].display.textColor;
        ctx.fillText(buttons[i].display.text,
            buttons[i].x + buttons[i].display.textX, buttons[i].y + buttons[i].display.textY);
    }
}

function drawScene() {
    function drawPickHistory(){
        // Draw the pick history box and text
        ctx.strokeRect(105, 150, 330, 80);
        ctx.font = '24px serif';
        ctx.fillStyle = "black";
        ctx.fillText("Pick History:", 120, 145);
        ctx.fillText("(fire indicates reaction)", 115, 255)

        // Draw the pick history
        for (let i = hIndex; i < 5 + hIndex; i++) {
            if (pickHistory.length - i >= 0) {
                drawFlask(140 + 65 * (i - hIndex), 220, pickHistory[pickHistory.length - i].card, 0.6)
                if (pickHistory[pickHistory.length - i].score == 1) {
                    ctx.drawImage(fire, 152 + 65 * (i - hIndex), 165, 14, 20);
                }
            }
        }
    }
    ctx.clearRect(0, 0, 540, 960); // clear the frame


    ctx.save();
    if (gameState == "discovery") { // gamne is in progress
        // halo around selected card or button
        ctx.fillStyle = "blue";
        if (selected > 900) { // selected > 900 means a button is selected.
            let thisWork; thisWork = selected - 901; // I am losing my mind
            ctx.fillRect(buttons[thisWork].x - 5, buttons[thisWork].y - 5, buttons[thisWork].width + 10, buttons[thisWork].height + 10);
        }
        else if (selected >= 0 && selected < cards.length) { // otherwise, a card is selected. cards.length is largely redundant since there's only one card
            ctx.fillRect(cards[selected].x - 5 * cards[selected].scale, cards[selected].y - 5 * cards[selected].scale,
                90 * cards[selected].scale, 130 * cards[selected].scale);
        }

        // draw the buttons
        drawButtons();

        // "lol" said the scorpion "lmao"
        drawFlask(260, 480, flaskContents, 1.9);

        drawPickHistory();

        // possibly show/hide left and right arrows. 

        // draw the timer
        let minutes = Math.floor(countdown / 60);
        let seconds = countdown % 60;
        if (seconds < 10) { seconds = "0" + seconds; } // Nothing to see here, move along
        ctx.fillText(minutes + ":" + seconds, 420, 130);

        // draw the text
        ctx.restore();
        ctx.font = '36px serif';
        // ctx.fillText("Score: " + score, 190, 880);
        ctx.fillText("Turns taken: " + turns, 140, 880);
        ctx.font = '24px serif'
        // ctx.fillText("Turns taken: " + turns, 160, 920);
        ctx.fillText
        if (lastPick != null) {
            if (lastPick.score == 1) {
                ctx.fillText("REACTION caused by combination:", 50, 720);

            } else if (lastPick.score == 0) {
                ctx.fillText("Combination below DID NOT react:", 50, 720);
            } else if (lastPick.score == -1) {
                ctx.fillText("No reaction possible with no materials!", 16, 720);
            }
            drawFlask(260, 840, lastPick.card, 1);
        } else {
            ctx.fillText("Engineer gaming", 150, 720);
        }

    } else if (gameState == "classification") {
    
        // halo around selected button
        ctx.fillStyle = "blue";
        if (selected > 900) { // selected > 900 means a button is selected.
            let thisWork; thisWork = selected - 901; // I am losing my mind
            ctx.fillRect(buttons[thisWork].x - 5, buttons[thisWork].y - 5, buttons[thisWork].width + 10, buttons[thisWork].height + 10);
        }

        drawButtons();

        drawPickHistory();

        function posn(i) {
            return {
                x: 80 + (125 * (i % 4)),
                y: 365 + 128 * Math.floor(i / 4)
            }
        }

        // draw boxes around tested flasks
        for (let i = 0; i < testedFlasks.length; i++) {
            let j = testedFlasks[i].val;
            // ctx.strokeStyle = "black"
            ctx.fillStyle = "grey";
            ctx.fillRect(posn(j).x - 50, posn(j).y - 90, 100, 100);
            if(testedFlasks[i].data.feedback == "CORRECT"){
                ctx.fillStyle = "green"
            } else {
                ctx.fillStyle = "red"
            }
            ctx.fillRect(posn(j).x - 41, posn(j).y - 81, 17, 17)
            if(testedFlasks[i].data.reacts){
                ctx.drawImage(fire2, posn(j).x + 25, posn(j).y - 84, 17, 20);
            } 
            
        }


        for (let i = 0; i < classificationSet.length; i++) {
            let j = i
            drawFlask(posn(j).x, posn(j).y, classificationSet[i], 0.8);
        }


        ctx.strokeStyle = "blue";
        ctx.strokeRect(posn(selectedFlask).x - 50, posn(selectedFlask).y - 90, 100, 100); //halo around selected flask;

        ctx.fillStyle = "black";
        ctx.fillText("score: " + score, 420, 110);

        if (lastPick != null) {
            if (lastPick.reacts) {
                ctx.fillText(lastPick.feedback + ". The combination reacts.", 65, 940);
            } else {
                ctx.fillText(lastPick.feedback + ". The combination does not react.", 40, 940);
            }
        }

        if (testedFlasks.length >= 16){
            selectedFlask=9999;
            setTimeout(switchState,900,"end");
        } 

    } else if(gameState == "end") {
        ctx.fillStyle = "Black"
        ctx.font = "32pt serif"
        ctx.fillText("You Scored " + score, 140, 400);
        ctx.fillText("Out Of " + maxScore + " Possible Points!", 40, 450);
        // ctx.
    } 

    ctx.restore();
}

function drawMenuElement(x, y, text) { // probably redundant at this point
    x = -100 + 200 * x;
    y = 100 + 200 * y;

    ctx.font = "18px serif";
    ctx.fillStyle = "grey";
    ctx.strokeStyle = "grey";
    ctx.fillRect(x, y, 100, 50);
    ctx.fillStyle = "blue"
    ctx.fillText(text, x + 8, y + 30);
}

// draws a card with top left corner (x,y), and the given scale
function drawCard(x, y, card, scale) { // actually inputs a card's symbols, not the card itself
    // draw the card
    ctx.save();
    ctx.fillStyle = "grey";
    ctx.strokeStyle = "grey";
    ctx.fillRect(x, y, 80 * scale, 120 * scale);


    // x and y will change when drawing symbols on card
    x += 10 * scale;
    y += 15 * scale;

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


// draws a flask with bottom middle point at (x,y)
// dimensions are 100 x 100 at size 1 (probably).
function drawFlask(x, y, contents, sz) {
    if (contents == null) {
        return;
    }
    ctx.save();


    const TH = 70; // where the "top part" of the flask starts
    const TW = 6; // twice the width of the "top" part of the flask.
    const IS = (50 - TW) / TH; // 1/slope (inverse slope)


    // fill the flask with liquids
    for (let i = 0; i < contents.length; i++) {
        ctx.fillStyle = contents[i];

        ctx.beginPath();
        ctx.moveTo(x - (50 - i * IS * 10) * sz, y - i * 10 * sz);
        ctx.lineTo(x + (50 - i * IS * 10) * sz, y - i * 10 * sz);
        ctx.lineTo(x + (50 - (i + 1) * IS * 10) * sz, y - (i + 1) * 10 * sz);
        ctx.lineTo(x - (50 - (i + 1) * IS * 10) * sz, y - (i + 1) * 10 * sz);
        ctx.lineTo(x - (50 - i * IS * 10) * sz, y - i * 10 * sz);
        ctx.fill();
        ctx.strokeStyle = "grey";
        ctx.stroke();
    }

    // Draw the flask itself
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(x - TW * sz, y - 100 * sz);
    ctx.lineTo(x - TW * sz, y - TH * sz);
    ctx.lineTo(x - 50 * sz, y);
    ctx.lineTo(x + 50 * sz, y);
    ctx.lineTo(x + TW * sz, y - TH * sz);
    ctx.lineTo(x + TW * sz, y - 100 * sz);
    ctx.stroke();
    

    ctx.restore();
}





// window.addEventListener("keydown", keyDownHandler);
document.addEventListener("click", handleClick);
document.addEventListener("mousedown", handleMouseDown)
document.addEventListener("mouseup", () => {
    selected = -15;
})

function selectCard(i) {
    if (i != 15) {
        lastPick = {
            card: cards[i].symbols, //should be symbols not card but I'm too lazy to change it
            score: getScore(cards[i])
        }
        pickHistory.push(lastPick);
        cards[i].symbols = [];
        console.log("last pick: " + lastPick);
        turns++;
    } else {
        console.log("what have you done");
    }

    if (i == 15) {
        cards = [];
        for (let j = 0; j < 15; j++) {
            cards.push(createCard(j));
        }
        turns++;
    }
}



function handleClick(input) {
    if (template.isPaused()) {
        return; // buttons can't be pressed when pause menue is up
    }
    let posn = resizer.getRelativeEventCoords(input);
    let x = posn.x;
    let y = posn.y;
    console.log("logged mouse click at x=" + x + ", y=" + y);

    if (gameState == "discovery" || gameState == "classification") {
        let dX; let dY;
        /* if (gameState == "discovery") {
             for (let i = 0; i < cards.length; i++) {
                dX = x - cards[i].x;
                dY = y - cards[i].y;
                /* if (i == 0) {
                    console.log("relative position to card " + i + ": (" + dX + "," + dY + ").");
                } 
                if (dX > 0 && dX < 80 * cards[i].scale && dY > 0 && dY < 120 * cards[i].scale) {
                    console.log("card " + i + " selected");
                    selectCard(i)
                }
            } 
        } */
        for (let i = 0; i < buttons.length; i++) {
            dX = x - buttons[i].x;
            dY = y - buttons[i].y;
            // console.log("yaba daba dooooo: " + dX + " " + dY);
            if (dX > 0 && dX < buttons[i].width && dY > 0 && dY < buttons[i].height) {
                pushButton(buttons[i]);
                return;
            }
        }
    }
}


function handleMouseDown(input) { // sets value of selected to create shiny blue halo. 
    if (template.isPaused()) {
        return; // me to the void from whence I came
    }
    mouseControls = true;
    let posn = resizer.getRelativeEventCoords(input);
    let x = posn.x;
    let y = posn.y;
    // console.log("logged mouse move at x=" + x + ", y=" + y);

    if (gameState == "discovery" || gameState == "classification") {
        let dX; let dY;
        /* if (gameState == "discovery") {
            for (let i = 0; i < cards.length; i++) {
                dX = x - cards[i].x;
                dY = y - cards[i].y;
                /* if (i == 0) {
                    console.log("relative position to card " + i + ": (" + dX + "," + dY + ").");
                } 
                if (dX > 0 && dX < 80 * cards[i].scale && dY > 0 && dY < 120 * cards[i].scale) {
                    selected = i;
                    return;
                }
            }
        } */
        for (let i = 0; i < buttons.length; i++) {
            dX = x - buttons[i].x;
            dY = y - buttons[i].y;
            // console.log("yaba daba dooooo: " + dX + " " + dY);
            if (dX > 0 && dX < buttons[i].width && dY > 0 && dY < buttons[i].height) {
                selected = 901 + i;
                // console.log("now this is epic");
                return;
            }
        }

    }
}

// \begin{badfunctions}
function keyDownHandler(key) {
    if (mouseControls) {
        selected = 0;
    }
    mouseControls = false;
    /* if (turns == 0) {
        gameState = 0; //switch to game over when turns run out
        console.log("game over");
    } */
    logic.oldSelected = selected;
    if (gameState == "discovery") {
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
                selectCard(selected);
                break;


        }
        if (selected > 15) {
            selected = 15;
        } if (selected < 0) {
            selected = logic.oldSelected;
        }
    }



    // console.log("keydown event with keycode " + key.keyCode); 
    // console.log("selected = " + selected);
}

// \end{badfunctions}

/////////////////////////////////////
// Mainline logic
/////////////////////////////////////

// now this is epic



function newFrame() {
    if (countdown < 1 && gameState == "discovery") {
        switchState("classification");
    }

    drawScene(cards);
    window.requestAnimationFrame(newFrame);
}

function init() {
    loadGraphics();
    initResizer();
    /* for (let i = 0; i < 15; i++) {
        cards.push(createCard(i));
    } */
    cards.push({
        symbols: [],
        scale: 1.5,
        x: 200,
        y: 435
    })
    ctx.clearRect(0, 0, 540, 960);
    switchState("discovery");


    // log some stuff
    console.log("scoring Rules:");
    console.log(scoringRules);
    console.log(scoringTemplate);

    // let arrMeMatey = [0,1];
    // arrMeMatey.push(randomInt(0,1));
    // shuffleArray(arrMeMatey);
    // for (let i=0; i<arrMeMatey.length; i++){
    //    let hint = generateHint(arrMeMatey[i]);
    //    pickHistory.push({card: hint, score: checkCombination(hint)});
    // }
    let hint = generateHint();
    lastPick = {
        card: hint,
        score: checkCombination(hint)
    }
    pickHistory.push(lastPick)
    cards[0].symbols = hint.symbols;

    countdown = 240;
    window.setInterval(() => countdown = Math.max(countdown - 1, 0), 1000);

    newFrame(); 
}

let cards = [];
init();
    // Close and execute the IIFE here
// })();

