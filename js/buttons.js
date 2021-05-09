// Material Vials
let blueVial = document.getElementById("blue-vial").onclick = function() {addMaterial("#0e9ef5")};
let purpleVial = document.getElementById("purple-vial").onclick = function() {addMaterial("#ce82e3")};
let redVial = document.getElementById("red-vial").onclick = function() {addMaterial("#ae1212")};
let yellowVial = document.getElementById("yellow-vial").onclick = function() {addMaterial("#ffe220")};
let orangeVial = document.getElementById("orange-vial").onclick = function() {addMaterial("#e48a2a")};
let greenVial = document.getElementById("green-vial").onclick = function() {addMaterial("#6df50e")};
// yOu'Re sEtTinG tHe VaRiAbLeS eQaUl tO tHe FuNcTiOnS aNd NoT tHe HTML ElEmEnTs
// https://i.pinimg.com/originals/2f/1f/19/2f1f1920d13320f0d31cc6cd05c267be.png (I don't care)

// Other buttons

leftArrow.onclick = function() {cycleHistory(-1)}; 
rightArrow.onclick = function() {cycleHistory(1)};
leftArrow.style.display = "none";
rightArrow.style.display = "none";

// let burnerButton= document.getElementById("burner-button").onclick = function() {burnContents()};
// let emptyButton= document.getElementById("empty-button").onclick = function() {flaskContents = []};


function cycleHistory(x){
    let newIndex = hIndex;
    newIndex += x;
    if (newIndex >=1){
        hIndex = newIndex;
    }
    if (hIndex == 1){
        leftArrow.style.display="none";
    } else {leftArrow.style.display = "";}
    if (hIndex + 5 > pickHistory.length){
        rightArrow.style.display="none";
    } else {rightArrow.style.display = "";}
}

function addMaterial(material){
    if (flaskContents.length < 6){
        flaskContents.push(material);
    }
}

function burnContents(){
    lastPick = {
        card: flaskContents, //should be symbols not card but I'm too lazy to change it
        score: getScore({symbols: flaskContents}) // formatting it like this because... actually I don't even know anymore    
    }
    flaskContents = []
    console.log("last pick: " + lastPick);
    if (lastPick.score != -1){
        pickHistory.push(lastPick);
        turns++;
    }
    if (hIndex + 5 > pickHistory.length){
        rightArrow.style.display="none";
    } else {rightArrow.style.display = "";}
}


function pushButton(button) {
    switch (button.name) {
        case "mix":
            burnContents();
            break;
        case "empty":
            flaskContents = []
            break;
        case "undo":
            flaskContents.pop();
        default:
            console.log("invalidButton:" + button)
    }
}

