/////////////// 
// Game-specific logic
////////////// 
let logic ={ // "config" variables used in backround rng
    shapes: ["square", "diamond", "circle", "triangle", "star", "bolt"],
    quantityRule: [4],
    oldSelected: 0
}

function createCard(i) { // a card is a list of symbols 
    let symbols = [];
    let count = logic.quantityRule[randomInt(0,logic.quantityRule.length - 1)]
    for (let i = 0; i < count; i++) {
        symbols.push(logic.shapes[randomInt(0, 5)]);
    }

    return {
        symbols: symbols,
        x: 20 + (100 * i % 500),
        y: 200 + 160 * Math.floor(i / 5)
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

function createWasonScoringRules(difficulty){
    let count = randomInt(1,3);
    let rules = [];
    
    function createYesNo(Y, N){
        let yes = [];
        let no = [];
        for (let i=0; i<Y; i++){
            yes.push(logic.shapes[randomInt(0,5)]);
        }
        for (let i=0; i<N; i++){
            no.push(logic.shapes[randomInt(0,5)]);
        }
        if (IsSubset(no,yes)){ //reroll if condition is impossible
            console.log("rerolling. Yes: " + yes + " No: " + no);
            return createYesNo(Y,N);
        } else{
            return {
                yes: yes,
                no: no
            }
        }
    }

    for(let i=0; i<count; i++){
        let Y; let N;
        if (difficulty == "easy"){
            Y = randomInt(1,2);
            N = randomInt(1,5);
        } else if (difficulty == "hard"){
            Y = randomInt(2,3);
            N = randomInt(1,2);
        } else {
            if (difficulty != "medium")
                {console.log("invalid difficulty. Defaulting to medium");}
            Y = randomInt(2,3);
            N = randomInt(1,4);
        }

        rules.push(createYesNo(Y,N));
    }

    return rules;
}

/* function getScore(card) {
    let value = 0;

    for (let i = 1; i <= 4; i++) {
        value = scoringRules[card.symbols[4 - i]](value); // 4-i instead of i because future proofing or something
    }

    return value;
} */

function getScore(card) {
    for(let i=0; i<scoringRules.length; i++){
        if(IsSubset(scoringRules[i].yes, card.symbols) && !IsSubset(scoringRules[i].no, card.symbols)){
            return 1;
        }
    }
    return 0;
}

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
function IsSubset(arr1, arr2){ //this is almost as inefficient an algorithm as Bogosort but it should do for small arrays
    // console.log("testing if [" + arr1 + "] is a subset of [" + arr2 + "]")
    let copy = [...arr2];
    for (i = 0; i<arr1.length; i++){
        for (j = 0; j<copy.length+1; j++){
            // console.log("checking " + arr1[i] + " against " + copy[j]);
            if (j == copy.length){
                // console.log("no match found for " + arr1[i] + " in [" + copy + "]");
                // console.log("no match found for element " + i + " of [" + arr1 + "] in [" + arr2 + "]");
                return false
            } else if (arr1[i] == copy[j]){
                // console.log("match found between    " + arr1[i] + " and " + copy[j]);
                delete copy[j];
                break;
            }
        } 
    }
    // console.log("true: [" + arr1 + "] is a subset [" + arr2 + "]");
    return true;
}