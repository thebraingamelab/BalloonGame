let score = 0;
let scoreMultiplier = 1;
let lastPick;
let selected = -15;
let turns = 0;
let gameState; //2: pre-game menu, 1: game in progress, 0: game over
let mouseControls = true;
let pickHistory = [];
let buttons = [];
let flaskContents = [];

let hIndex = 1;

let leftArrow = document.getElementById("left-arrow");
let rightArrow = document.getElementById("right-arrow");

/////////////// 
// Game-specific logic
////////////// 
let logic = { // "config" variables used in backround rng
    colors: ["#0e9ef5", "#ae1212", "#ce82e3", "#6df50e", "#ffe220", "#e48a2a"], // not really shapes anymore but eh
    // blue, red, purple, green, yellow, orange
    quantityRule: [1, 2, 3, 3, 4, 4, 5, 5, 6],
    oldSelected: 0
}

function createCard() { // a card is a list of symbols 
    let symbols = [];
    let count = logic.quantityRule[randomInt(0, logic.quantityRule.length - 1)]
    for (let i = 0; i < count; i++) {
        symbols.push(logic.colors[randomInt(0, 5)]);
    }

    return {
        symbols: symbols,
        scale: 1.5,
        x: 200,
        y: 435
        // x: 20 + (100 * i % 500),
        // y: 200 + 160 * Math.floor(i / 5)
    }
}

function createScoringRule(){
    let ruleTemplates = ["atLeastN", "exactlyN", "combination"];
    let atomicRules = [];
    for(let i=0; i<2; i++){
        shuffleArray(ruleTemplates);
        let rule = {};
        rule.type = ruleTemplates[0];
        let tempArray = logic.colors; shuffleArray(tempArray);
        // set parameters
        if(rule.type == "combination"){
            rule.parameters = tempArray.slice(0,randomInt(2,3));
        } else {
            const color = tempArray[0];
            const n = randomInt(2,4); 
            rule.parameters = [];
            for (let j = 0; j<n; j++) {
                rule.parameters.push(color);
            }
        }
        atomicRules.push(rule);
    }
    let conjunctions = ["or", "and", "xor", "and not"];
    let conjunction = conjunctions[randomInt(0,3)];

    return {
        atomicRules: atomicRules,
        conjunction: conjunction
    }
}
// checks if the given combination matches the scoring rules
function checkCombination(stuff){
    function checkAtomicRule(rule){
        if (rule.type == "atLeastN" || rule.type == "combination"){
            return IsSubset(rule.parameters, stuff)
        } else if(rule.type == "exactlyN"){
            rule.parameters.push(rule.parameters[0]);
            let output = (IsSubset(rule.parameters.slice(0,rule.parameters.length - 1), stuff) && !IsSubset(rule.parameters, stuff));
            rule.parameters.pop();
            return output;
        } else {
            console.log("ERROR: " + rule.type + " is not a valid rule.");
        }
    }
    let rule1 = scoringRules.atomicRules[0];
    let rule2 = scoringRules.atomicRules[1];
    switch(scoringRules.conjunction){
        case "or":
            return (checkAtomicRule(rule1) || checkAtomicRule(rule2));
            break;
        case "and":
            return (checkAtomicRule(rule1) && checkAtomicRule(rule2));
            break;
        case "and not":
            return (checkAtomicRule(rule1) && !checkAtomicRule(rule2));
            break;
        case "xor":
            return !(checkAtomicRule(rule1) == !checkAtomicRule(rule2));
            break;
        default:
            console.log("ERROR: " + scoringRules.conjunction + " is not a valid rule");
            return false;
    }
}



// old scoring rule logic. Enclosed in a function so I can minimize it in vscode. 
(function () {
    function createHardIncludeExclude(difficulty) {
        scoringTemplate = "includeExclude"
        let count = Math.floor(randomInt(2, 4) / 2);
        let rules = [];

        function createYesNo(Y, N) {
            let yes = [];
            let no = [];
            for (let i = 0; i < Y; i++) {
                yes.push(logic.shapes[randomInt(0, 5)]);
            }
            for (let i = 0; i < N; i++) {
                no.push(logic.shapes[randomInt(0, 5)]);
            }
            if (IsSubset(no, yes)) { //reroll if condition is impossible
                console.log("rerolling. Yes: " + yes + " No: " + no);
                return createYesNo(Y, N);
            } else {
                return {
                    yes: yes,
                    no: no
                }
            }
        }

        for (let i = 0; i < count; i++) {
            let Y; let N;
            if (difficulty == "easy") {
                Y = randomInt(1, 2);
                N = randomInt(1, 5);
            } else if (difficulty == "hard") {
                Y = randomInt(2, 3);
                N = randomInt(1, 2);
            } else {
                if (difficulty != "medium") { console.log("invalid difficulty. Defaulting to medium"); } //lol lmao
                Y = randomInt(1, 3);
                N = randomInt(1, 5);
            }

            rules.push(createYesNo(Y, N));
        }

        return rules;
    }

    function createEasyIncludeExclude(invert) {
        scoringTemplate = "includeExclude"
        let yes = [];
        let no = [];
        if (invert) { // is symbol absant/is symbol present. 
            no.push(logic.shapes[randomInt(0, 5)]);
        } else {
            yes.push(logic.shapes[randomInt(0, 5)]);
            no.push("thisFixIsStupid");
        }
        return [{
            yes: yes,
            no: no
        }]
    }

    function YesAndNo() {
        scoringTemplate = "includeExclude"
        yes = [logic.shapes[randomInt(0, 5)]];
        no = [logic.shapes[randomInt(0, 5)]];
        if (IsSubset(yes, no)) {
            return YesAndNo();
        } else {
            return [{
                yes: yes,
                no: no
            }]
        }
    }

    function nOfShapePresent() {
        scoringTemplate = "includeExclude"
        let n = randomInt(1, 5);
        let rules = [];
        for (let i = 0; i < n; i++) {
            let yes = [];
            let shape = [logic.shapes[randomInt(0, 5)]];
            let m = randomInt(1, 4);
            for (let j = 0; j < m; j++) {
                yes.push(shape);
            }
            rules.push({
                yes: yes,
                no: "ThisFixIsStupid"
            })
        }
        return rules;
    }

    function createPositionalRule(invert) {
        scoringTemplate = "positional";
        let positions = [];
        let symbols = [];
        if (invert) { // many shapes one position/one shape many positions?
            let tempArray = logic.shapes;
            shuffleArray(tempArray);
            symbols = tempArray.slice(0, randomInt(1, 5));
            positions = [randomInt(0, 5)];
        } else {
            let tempArray = [0, 1, 2, 3, 4, 5];
            shuffleArray(tempArray);
            positions = tempArray.slice(0, randomInt(1, 5));
            symbols = [logic.shapes[randomInt(1, 5)]];
        }
        return {
            positions: positions,
            symbols: symbols
        }
    }

    function createDuplicateRule() {
        scoringTemplate = "duplicate";
        let duplicatesRequired = Math.floor(randomInt(2, 4));
        let invert = (randomInt(0, 1) == 1); // too lazy to cast this to a Boolean
        return {
            duplicatesRequired: duplicatesRequired,
            invert: invert // always saying 0 for now
        }
    }

    function createSizeRule() {
        scoringTemplate = "size";
        let size = randomInt(1, 6);
        let requireEquality = (randomInt(0, 1) == 1);
        let invert = (randomInt(0, 1) == 1);
        return {
            size: size,
            requireEquality: requireEquality,
            invert: invert
        }
    }

    function createSubsetRule() {
        scoringTemplate = "includeExclude";
        let tempArray = logic.shapes;
        shuffleArray(tempArray);
        symbols = tempArray.slice(0, randomInt(1, 5));
        return [{
            yes: symbols,
            no: "thisFixIsStupid",
        }]
    }

    function adjacencyRule() {
        scoringTemplate = "adjacency"
        let invert = (randomInt(0, 1) == 1);
        return {
            invert: invert
        }
    }


    /* function getScore(card) {
        let value = 0;
    
        for (let i = 1; i <= 4; i++) {
            value = scoringRules[card.symbols[4 - i]](value); // 4-i instead of i because future proofing or something
        }
    
        return value;
    } */

    function randomRule() {
        rand = randomInt(1, 7);
        switch (rand) {
            case 1: return createSizeRule();
            case 2: return createEasyIncludeExclude(randomInt(1, 2) == 1);
            case 3: return YesAndNo();
            case 4: return createSubsetRule();
            case 5: return nOfShapePresent();
            case 6: return createDuplicateRule();
            case 7: return createHardIncludeExclude("medium");

            // case 5: return adjacencyRule();
        }
    }

    function getScoreOld(card) {
        if (card.symbols.length == 0) {
            return -1 // empty card is invalid
        }
        switch (scoringTemplate) {
            case "includeExclude":
                for (let i = 0; i < scoringRules.length; i++) {
                    if (IsSubset(scoringRules[i].yes, card.symbols) && !IsSubset(scoringRules[i].no, card.symbols)) {
                        return true;
                    }
                } return false;
            case "positional":
                for (let i = 0; i < scoringRules.positions.length; i++) {
                    if (IsSubset([card.symbols[scoringRules.positions[i]]], scoringRules.symbols)) {
                        return true;
                    }
                } return false;
            case "duplicate":
                for (let i = 0; i < logic.shapes.length; i++) {
                    let dupe = [];
                    while (dupe.length < scoringRules.duplicatesRequired) {
                        dupe.push(logic.shapes[i]);
                    }
                    if (IsSubset(dupe, card.symbols)) {
                        return (true != scoringRules.invert); // flipped if inverted
                    }
                } return (false != scoringRules.invert);
            case "size":
                if (scoringRules.requireEquality) {
                    if (card.symbols.length == scoringRules.size) {
                        return (true != scoringRules.invert);
                    }
                } else {
                    if (card.symbols.length <= scoringRules.size) {
                        return (true != scoringRules.invert);
                    }
                } return (false != scoringRules.invert);
            case "adjacency":
                for (let i = 0; i + 1 < card.symbols.length; i++) {
                    if (card.symbols[i] == card.symbols[i + 1]) {
                        return (true != scoringRules.invert);
                    }
                } return (false != scoringRules.invert);
            default:
                console.log("ERROR: scoring template not defined.");

        }


    }

    /* function createLinearScoringRules() {
    let tempArray = [-1, 0, 1, 2, 3, 5]
    shuffleArray(tempArray);

    return {
        square: (a) => a + tempArray[0],
        diamond: (a) => a + tempArray[1],
        circle: (a) => a + tempArray[2],
        triangle: (a) => a + tempArray[3],
        star: (a) => a + tempArray[4],
        bolt: (a) => a + tempArray[5],
    }
} */

/* function createVariableScoringRules() {
    let tempArray = [
        [-3,-2,-2,-1,-1,-1,0,0,1],
        [-2,-1,-1,0,0,0,1,1,2],
        [-1,0,0,1,1,1,2,2,3],
        [0,1,1,2,2,2,3,3,4],
        [1,2,2,3,3,3,4,4,5],
        [3,4,4,5,5,5,6,6,7],
    ]
    shuffleArray(tempArray);
    console.log(tempArray);

    return {
        square: (a) => a + tempArray[0][randomInt(0,7)],
        diamond: (a) => a + tempArray[1][randomInt(0,7)],
        circle: (a) => a + tempArray[2][randomInt(0,7)],
        triangle: (a) => a + tempArray[3][randomInt(0,7)],
        star: (a) => a + tempArray[4][randomInt(0,7)],
        bolt: (a) => a + tempArray[5][randomInt(0,7)],
    }
} */

/* function createBanditScoringRules(boxSize,min,max){
    let tempArray = [[],[],[],[],[],[]]
    for (let i = 0; i<6; i++){
        for (let j = 0; j<boxSize; j++){
            tempArray[i].push(randomInt(min,max))
        }
    }
    
    return {
        square: (a) => a + tempArray[0][randomInt(0,boxSize-1)],
        diamond: (a) => a + tempArray[1][randomInt(0,boxSize-1)],
        circle: (a) => a + tempArray[2][randomInt(0,boxSize-1)],
        triangle: (a) => a + tempArray[3][randomInt(0,boxSize-1)],
        star: (a) => a + tempArray[4][randomInt(0,boxSize-1)],
        bolt: (a) => a + tempArray[5][randomInt(0,boxSize-1)],
    }
} */

// commeent
})();




/////////////
// General logic
/////////////
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function shuffleArray(arr) {
    for (let i = 0; i < arr.length; i++) {
        let j = randomInt(0, i);
        let temp = arr[i]
        arr[i] = arr[j];
        arr[j] = temp;
    }
}

// is arr1 a subset of arr2?
function IsSubset(arr1, arr2) { //this is almost as inefficient an algorithm as Bogosort but it should do for small arrays
    // console.log("testing if [" + arr1 + "] is a subset of [" + arr2 + "]")
    let copy = [...arr2];
    for (i = 0; i < arr1.length; i++) {
        for (j = 0; j < copy.length + 1; j++) {
            // console.log("checking " + arr1[i] + " against " + copy[j]);
            if (j == copy.length) {
                // console.log("no match found for " + arr1[i] + " in [" + copy + "]");
                // console.log("no match found for element " + i + " of [" + arr1 + "] in [" + arr2 + "]");
                return false
            } else if (arr1[i] == copy[j]) {
                // console.log("match found between    " + arr1[i] + " and " + copy[j]);
                delete copy[j];
                break;
            }
        }
    }
    // console.log("true: [" + arr1 + "] is a subset [" + arr2 + "]");
    return true;
}