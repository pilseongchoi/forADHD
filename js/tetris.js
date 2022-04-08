import BLOCKS from "./blocks.js"

// DOM
const playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const restartButton = document.querySelector(".game-text > button");


// Setting
const GAME_ROWS = 20;
const GAME_COLS = 10;

//variables
let score = 0;
let duration = 500;
let downInterval;
let tempMovingItem;



const movingItem = {
    type: "",
    direction: 0,
    top: 0,
    left: 3,
}

init()

// functions
function init() {

    tempMovingItem = { ...movingItem };

    for (let i = 0; i < GAME_ROWS; i++) {
        prependNewLine()
    };
    generateNewBlock()
}


function prependNewLine() {
    const li = document.createElement("li");
    const ul = document.createElement("ul");
    for (let j = 0; j < GAME_COLS; j++) {
        const matrix = document.createElement("li");
        ul.prepend(matrix);
    }
    li.prepend(ul)
    playground.prepend(li)
}

function renderBlocks(moveType = "") {
    const { type, direction, top, left } = tempMovingItem;
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove(type, "moving");

    })
    BLOCKS[type][direction].some(block => {
        const x = block[0] + left;
        const y = block[1] + top;
        const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
        const isAvailable = checkEmpty(target);
        if (isAvailable) {
            target.classList.add(type, "moving")
        } else {
            tempMovingItem = { ...movingItem }
            if (moveType === 'retry') {
                clearInterval(downInterval)
                showGameoverText()
                scoreDisplay.innerText = 0;
            }
            setTimeout(() => {
                renderBlocks('retry');
                if (moveType === "top") {
                    seizeBlock();
                }
            }, 0)
            return true;
        }
    })
    movingItem.left = left;
    movingItem.top = top;
    movingItem.direction = direction;
}
function seizeBlock() {

    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove("moving");
        moving.classList.add("seized");
    })
    checkMatch()
}
function checkMatch() {
    const childNodes = playground.childNodes;
    childNodes.forEach(child => {
        let matched = true;
        child.children[0].childNodes.forEach(li => {
            if (!li.classList.contains("seized")) {
                matched = false;
            }
        })
        if (matched) {
            child.remove();
            prependNewLine()
            score++;
            scoreDisplay.innerText = score;
            generateSpeech()

        }
    })

    generateNewBlock()
}

function generateSpeech() {

    const speechArray = [
        "성공했군요. 한번 더 해볼까요?",
        "잘했습니다. 이 느낌 그대로!",
        "줄을 지웠어요. 아자!",
        "콤보를 향해 렛츠고!",
        "테트리스에 소질이 있군요.",
        "욕심쟁이 우후훗, 기분이 어떤가요?"
    ]
    const randomIndex2 = Math.floor(Math.random() * speechArray.length);

    speech(speechArray[randomIndex2]);

}
function generateNewBlock() {

    clearInterval(downInterval);
    downInterval = setInterval(() => {
        moveBlock('top', 1)
    }, duration)

    const blockArray = Object.entries(BLOCKS)
    const randomIndex = Math.floor(Math.random() * blockArray.length)

    movingItem.type = blockArray[randomIndex][0]
    movingItem.top = 0;
    movingItem.left = 3;
    movingItem.direction = 0;
    tempMovingItem = { ...movingItem };
    setTimeout(() =>  renderBlocks(), 500);

}
function checkEmpty(target) {
    if (!target || target.classList.contains("seized")) {
        return false;
    }
    return true;
}


function moveBlock(moveType, amount) {
    tempMovingItem[moveType] += amount;
    renderBlocks(moveType)
}

function changeDirection() {
    const direction = tempMovingItem.direction;
    direction === 3 ? tempMovingItem.direction = 0 : tempMovingItem.direction += 1;
    renderBlocks();
}

function dropBlock() {
    clearInterval(downInterval)
    downInterval = setInterval(() => {
        moveBlock('top', 1)
    }, 10)
}

function showGameoverText() {
    gameText.style.display = "flex"
}

var voices = [];
function setVoiceList() {
    voices = window.speechSynthesis.getVoices();
}
setVoiceList();
if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = setVoiceList;
}
function speech(txt) {
    if (!window.speechSynthesis) {
        alert("음성 재생을 지원하지 않는 브라우저입니다. 크롬, 파이어폭스 등의 최신 브라우저를 이용하세요");
        return;
    }
    var lang = 'ko-KR';
    var utterThis = new SpeechSynthesisUtterance(txt);
    utterThis.onend = function (event) {
        console.log('end');
    };
    utterThis.onerror = function (event) {
        console.log('error', event);
    };
    var voiceFound = false;
    for (var i = 0; i < voices.length; i++) {
        if (voices[i].lang.indexOf(lang) >= 0 || voices[i].lang.indexOf(lang.replace('-', '_')) >= 0) {
            utterThis.voice = voices[i];
            voiceFound = true;
        }
    }
    if (!voiceFound) {
        alert('voice not found');
        return;
    }
    utterThis.lang = lang;
    utterThis.pitch = 1;
    utterThis.rate = 1; //속도
    window.speechSynthesis.speak(utterThis);
}


// event handling


document.addEventListener("keydown", e => {
    switch (e.keyCode) {
        case 39:
            moveBlock("left", 1);
            break;
        case 37:
            moveBlock("left", -1);
            break;
        case 40:
            moveBlock("top", 1);
            break;
        case 38:
            changeDirection();
            break;
        case 32:
            dropBlock();
            break;
        default:
            break;
    }
    console.log(e)
})

restartButton.addEventListener("click", () => {
    playground.innerHTML = "";
    gameText.style.display = "none"
    init()
})