// board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

// pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// base
let baseImg;
let base = {
    x: 0,
    y: boardHeight - 112,
    width: boardWidth,
    height: 112
}

// physics
let velocityX = -2;
let velocityY = 0;
let gravity = 0.4;

let gameOver = false;
let score = 0;
let highScore = 0;

let playButton = {
    x: boardWidth/2 - 50,
    y: boardHeight/2,
    width: 100,
    height: 50
}

// audio
let swooshSound = new Audio("audio/swoosh.mp3.wav");
let wingSound = new Audio("audio/wing.mp3.ogg");
let pointSound = new Audio("audio/point.mp3.wav");
let hitSound = new Audio("audio/hit.mp3.ogg");
let dieSound = new Audio("audio/audio-die.mp3.ogg");

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    birdImg = new Image();
    birdImg.src = "image/bluebird-downflap.png";

    topPipeImg = new Image();
    topPipeImg.src = "image/top pipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "image/bottom pipe.png";

    baseImg = new Image();
    baseImg.src = "image/base.png";

    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    requestAnimationFrame(update);
    setInterval(placePipes, 1500);
    document.addEventListener("keydown", moveBird);
    board.addEventListener("click", handleClick);
    board.addEventListener("touchstart", handleTouch); // Mobile touch event
}

function update() {
    requestAnimationFrame(update);

    context.clearRect(0, 0, board.width, board.height);

    if (!gameOver) {
        // move base
        base.x += velocityX;
        if (base.x <= -boardWidth) {
            base.x = 0;
        }
    }
    context.drawImage(baseImg, base.x, base.y, base.width, base.height);
    context.drawImage(baseImg, base.x + base.width, base.y, base.width, base.height);

    // pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        if (!gameOver) {
            pipe.x += velocityX;
        }
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
            if (Math.floor(score) == score) { 
                pointSound.play(); 
            }
        }

        if (detectCollision(bird, pipe)) {
            if (!gameOver) {
                hitSound.play();
                dieSound.play();
            }
            gameOver = true;
            velocityX = 0;
            velocityY = 0;
        }
    }

    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    if (!gameOver) {
        velocityY += gravity;
        bird.y = Math.max(bird.y + velocityY, 0);
    }
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        if (!gameOver) {
            hitSound.play();
            dieSound.play();
        }
        gameOver = true;
        velocityX = 0;
        velocityY = 0;
    }

    // score display
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(Math.floor(score), 10, 50);

    context.font = "20px sans-serif";
    context.fillText("High Score: " + Math.floor(highScore), 10, 80);

    if (gameOver) {
        context.font = "40px sans-serif";
        context.fillText("GAME OVER!", 50, 150);

        context.fillStyle = "yellow";
        context.fillRect(playButton.x, playButton.y, playButton.width, playButton.height);

        context.fillStyle = "black";
        context.font = "25px sans-serif";
        context.fillText("PLAY", playButton.x + 15, playButton.y + 33);
    }
}

function placePipes() {
    if (gameOver) return;

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);

    let openingSpace = board.height / 3.2; // पहले board.height / 4 था → अब ज़्यादा gap

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        if (!gameOver) {
            velocityY = -6;
            wingSound.play();
        }
    }
}

function detectCollision(a,b){
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function handleClick(e) {
    if (gameOver) {
        let rect = board.getBoundingClientRect();
        let clickX = e.clientX - rect.left;
        let clickY = e.clientY - rect.top;

        if (clickX >= playButton.x && clickX <= playButton.x + playButton.width &&
            clickY >= playButton.y && clickY <= playButton.y + playButton.height) {
            swooshSound.play();
            restartGame();
        }
    }
}

function handleTouch(e) {
    e.preventDefault();  // Prevents default touch behavior (like zoom)
    if (!gameOver) {
        velocityY = -6;
        wingSound.play();
    } else {
        let rect = board.getBoundingClientRect();
        let touchX = e.touches[0].clientX - rect.left;
        let touchY = e.touches[0].clientY - rect.top;

        if (touchX >= playButton.x && touchX <= playButton.x + playButton.width &&
            touchY >= playButton.y && touchY <= playButton.y + playButton.height) {
            swooshSound.play();
            restartGame();
        }
    }
}

function restartGame() {
    if (score > highScore) {
        highScore = score;
    }
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    velocityY = 0;
    velocityX = -2; // reset speed
    gameOver = false;
}