// Material Vials
blueVial.onclick = function () { addMaterial("#0e9ef5") };
purpleVial.onclick = function () { addMaterial("#ce82e3") };
redVial.onclick = function () { addMaterial("#ae1212") };
yellowVial.onclick = function () { addMaterial("#ffe220") };
orangeVial.onclick = function () { addMaterial("#e48a2a") };
greenVial.onclick = function () { addMaterial("#6df50e") };
// Other buttons
leftArrow.onclick = function () { cycleHistory(-1) };
rightArrow.onclick = function () { cycleHistory(1) };

leftArrow2.onclick = function () { cycleFlask(-1) };
rightArrow2.onclick = function () { cycleFlask(1) };



leftArrow.style.display = "none";
rightArrow.style.display = "none";

// let burnerButton= document.getElementById("burner-button").onclick = function() {burnContents()};
// let emptyButton= document.getElementById("empty-button").onclick = function() {flaskContents = []};

function cycleFlask(x) {
    let newFlask = selectedFlask + x;
    if (newFlask < 0) {
        selectedFlask = classificationSet.length - 1;
    } else if (newFlask >= classificationSet.length){
        selectedFlask = 0;
    }
    else {
        selectedFlask = newFlask;
    }
}

function cycleHistory(x) {
    let newIndex = hIndex;
    newIndex += x;
    if (newIndex >= 1) {
        hIndex = newIndex;
    } else {
        hIndex = 1;
    }
    if (hIndex == 1) {
        leftArrow.style.display = "none";
    } else { leftArrow.style.display = ""; }
    if (hIndex + 5 > pickHistory.length) {
        rightArrow.style.display = "none";
    } else { rightArrow.style.display = ""; }
}

function addMaterial(material) {
    if (flaskContents.length < 6) {
        flaskContents.push(material);
    }
}

function burnContents() {
    cycleHistory(-9999);
    lastPick = {
        card: flaskContents, //should be symbols not card but I'm too lazy to change it
        score: checkCombination(flaskContents) // formatting it like this because... actually I don't even know anymore    
    }
    flaskContents = []
    console.log("last pick: " + lastPick);
    if (lastPick.score != -1) {
        pickHistory.push(lastPick);
        turns++;
    }
    if (hIndex + 5 > pickHistory.length) {
        rightArrow.style.display = "none";
    } else { rightArrow.style.display = ""; }
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
            break;
        case "skip":
            countdown = 0;
            break; 

        case "reacts":
            if (classificationSet[selectedFlask] == null){
                return;
            }
            if (checkCombination(classificationSet[selectedFlask])){
                score +=5;
                maxScore +=5;

                lastPick = {
                    feedback: "CORRECT",
                    reacts: true
                }
            } else {
                score --; 
                maxScore ++;

                lastPick = {
                    feedback: "INCORRECT",
                    reacts: false
                }
            }
            testedFlaks.push({contents: classificationSet[selectedFlask], data: lastPick});
            classificationSet.splice(selectedFlask, 1);
            // classificationSet[selectedFlask] =  null;
            break;
        case "doesn't react":
            if (classificationSet[selectedFlask] == null){
                return;
            }
            if (checkCombination(classificationSet[selectedFlask])){
                score --;
                maxScore +=5;
                lastPick = {
                    feedback: "INCORRECT",
                    reacts: true
                }
            } else {
                score ++;
                maxScore ++;
                lastPick = {
                    feedback: "CORRECT",
                    reacts: false
                }
            }
            testedFlaks.push({contents: classificationSet[selectedFlask], data: lastPick});
            classificationSet.splice(selectedFlask, 1);
            // classificationSet[selectedFlask] =  null;
            break;

        default:
            console.log("invalidButton:" + button)
    }
}

