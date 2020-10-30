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


function createScoringRules() {
    let tempArray = [-1, 0, 1, 2, 3, 5]
    shuffleArray(tempArray);

    return {
        square: tempArray[0],
        diamond: tempArray[1],
        circle: tempArray[2],
        triangle: tempArray[3],
        star: tempArray[4],
        bolt: tempArray[5],
    }
}

function getScore(card) {
    let value = 0;

    for (let i = 1; i <= 4; i++) {
        value += scoringRules[card.symbols[4 - i]]; // 4-i instead of i because future proofing or something
    }

    return value;
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