const canvas = document.querySelector("#ping-pong");
const context = canvas.getContext("2d");
const startBtn = document.querySelector(".start-btn");
const pauseBtn = document.querySelector(".pause-btn");
const restartBtn = document.querySelector(".restart-btn");
const startiavsia = document.querySelector(".iavsia");

let gameRunning = false;
let animationId;
let particles = [];

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.velocityX = (Math.random() - 0.5) * 2;
        this.velocityY = (Math.random() - 0.5) * 2;
        this.lifetime = 50;
        this.color = color;
    }

    draw(context) {
        if (this.lifetime > 0) {
            context.fillStyle = this.color;
            context.fillRect(this.x, this.y, 2, 2);
            this.x += this.velocityX;
            this.y += this.velocityY;
            this.lifetime--;
        }
    }
}

const user = {
    x: 20,
    y: canvas.height / 2 - 100 / 2,
    width: 5,
    height: 50,
    color: "red",
    score: 0,
    speedBoostActive: false,
    lastSpeedBoostTime: 0,
    widenBoostActive: false,
    lastWidenBoostTime: 0
};

const computer = {
    x: canvas.width - 40,
    y: canvas.height / 2 - 100 / 2,
    width: 5,
    height: 60,
    color: "black",
    score: 0,
    speedBoostActive: false,
    lastSpeedBoostTime: 0,
    widenBoostActive: false,
    lastWidenBoostTime: 0
};

const secondComputer = {
    x: canvas.width - 40,
    y: canvas.height / 2 - 100 / 2,
    width: 5,
    height: 50,
    color: "blue",
    score: 0,
    speedBoostActive: false,
    lastSpeedBoostTime: 0,
    widenBoostActive: false,
    lastWidenBoostTime: 0
};

const initialBallSpeed = 6;
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 5,
    speed: initialBallSpeed,
    velocityX: initialBallSpeed,
    velocityY: initialBallSpeed,
    color: "white"
};

const net = {
    x: canvas.width / 2 - 1,
    y: 0,
    width: 2,
    height: 10,
    color: "white"
};

const speedBoostDuration = 5000;
const speedBoostCooldown = 15000;
const widenBoostDuration = 5000;
const widenBoostCooldown = 15000;
const powerUpImage = document.querySelector("#power-up-image");
const powerUpImage2 = document.querySelector("#widen-power-up-image");

function drawRectangle(x, y, w, h, color) {
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
}

function drawBallWithTrail(ball) {
    
    context.globalAlpha = 0.7;

    
    drawCircle(
        ball.x - ball.velocityX * 2,
        ball.y - ball.velocityY * 2,
        ball.radius,
        'rgba(255, 78, 34, 0.5)'
    );

    
    context.globalAlpha = 1; 

    
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

function drawCircle(x, y, r, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2, false);
    context.closePath();
    context.fill();
}

function drawText(text, x, y, color) {
    context.fillStyle = color;
    context.font = "45px Arial";
    context.fillText(text, x, y);
}

function drawNet() {
    for (let i = 0; i <= canvas.height; i += 15) {
        drawRectangle(net.x, i, net.width, net.height, net.color);
    }
}

// l'ia apprend de ces erreur en lui faisant connaitre l'echec(failedAttempts) et augmentant son agressivité (adaptatif en fonction du niveau du joueur)
let failedAttempts = 0;
let aiAggressiveness = 0.6; 

function aiUsePowers(player, ia) {
    const currentTime = Date.now();
    const isLosing = ia.score < player.score;
    const hasScored = ia.score > player.score;

    
    document.getElementById("ai-parameters").innerText = `\nScore: IA - ${ia.score}, joueur - ${player.score}, \n échous: ${failedAttempts}, \nAgressivité: ${aiAggressiveness.toFixed(2)}`;
    
    
    let decision = '';
    if (Math.abs(ball.x - ia.x) < 150 || (isLosing && Math.random() < aiAggressiveness)) {
        decision = 'Activate Speed Boost';
    } else if (ball.velocityX > 3 || Math.abs(ball.y - (ia.y + ia.height / 2)) > 50) {
        decision = 'Activate Widen Boost';
    } else {
        decision = 'No Action';
    }
    document.getElementById("ai-decision").innerText = `Decision: ${decision}`;

    if (ball.x <= 0 || ball.x >= canvas.width) {
        ia.speedBoostActive = false;
    }

    // Incrémenter l'agressivité si l'IA a échoué
    if (failedAttempts > 3) {
        aiAggressiveness = Math.min(1, aiAggressiveness + 0.3); 
        failedAttempts = 0; 
    }

    // Décrémenter l'agressivité si l'IA gagne un point
    if (hasScored) {
        aiAggressiveness = Math.max(0.1, aiAggressiveness - 0.1);
    }

    if (!computer.speedBoostActive && currentTime - ia.lastSpeedBoostTime > speedBoostCooldown) {
        if (Math.abs(ball.x - ia.x) < 150 || (isLosing && Math.random() < aiAggressiveness)) {
            ia.speedBoostActive = true;
            ia.lastSpeedBoostTime = currentTime;
            setTimeout(() => {
                ia.speedBoostActive = false;
            }, speedBoostDuration);
        }
    }

    if (!ia.widenBoostActive && currentTime - ia.lastWidenBoostTime > widenBoostCooldown) {
        if (
            ball.velocityX > 3 ||
            Math.abs(ball.y - (ia.y + ia.height / 2)) > 50 ||
            (isLosing && Math.random() < aiAggressiveness)
        ) {
            ia.widenBoostActive = true;
            ia.lastWidenBoostTime = currentTime;
            ia.height = 100; 
            ia.width = 20; 
            setTimeout(() => {
                ia.widenBoostActive = false;
                ia.height = 70;
                ia.width = 5;
            }, widenBoostDuration);
        }
    }
}


// mauvaise recompence de l'ia pour ses echecs ----
function onPointLost() {
    failedAttempts++;
    console.log("L'IA a perdu un point. Nombre d'échecs consécutifs :", failedAttempts);
}


let errorActive = false;
let errorActivationTime = 0;

function moveComputer() {
    const computerCenter = computer.y + computer.height / 2;
    const predictedBallY = ball.y + ball.velocityY; 
    const distanceToBall = Math.abs(computerCenter - predictedBallY);

    let speed = 4;
    if (distanceToBall < 100) {
        speed = 6;
    }

    const intelligenceRatio = 0.8;
    let direction = 0;

    // Logique d'attaque et de défense
    if (Math.random() < intelligenceRatio) {
        if (computerCenter < predictedBallY) {
            direction = speed;
        } else {
            direction = -speed;
        }
    } else {
        
        direction = (Math.random() < 0.5 ? 1 : -1) * speed;
    }

    
    computer.y += direction;
    computer.y = Math.max(0, Math.min(canvas.height - computer.height, computer.y));

    
    aiUsePowers(user, computer);

}

function moveSecondComputer() {
    const computerCenter = user.y + user.height / 2;
    const predictedBallY = ball.y + ball.velocityY; 
    const distanceToBall = Math.abs(computerCenter - predictedBallY);

    let speed = 4;
    if (distanceToBall < 100) {
        speed = 6;
    }

    const intelligenceRatio = 0.8;
    let direction = 0;

    
    if (Math.random() < intelligenceRatio) {
        if (computerCenter < predictedBallY) {
            direction = speed;
        } else {
            direction = -speed; 
        }
    } else {
        
        direction = (Math.random() < 0.5 ? 1 : -1) * speed;
    }

    // Limiter le mouvement de l'IA à l'intérieur du canevas
    user.y += direction;
    user.y = Math.max(0, Math.min(canvas.height - user.height, user.y));

    aiUsePowers(computer, user);

}

function moveBall() {
    let speedMultiplier = 1;
    if (user.speedBoostActive) {
        speedMultiplier *= 8;
        if (Date.now() - user.lastSpeedBoostTime >= speedBoostDuration) {
            user.speedBoostActive = false;
        }
    }

    if (computer.speedBoostActive) {
        speedMultiplier *= 4;
        if (Date.now() - computer.lastSpeedBoostTime >= speedBoostDuration) {
            computer.speedBoostActive = false;
        }
    }

    ball.x += ball.velocityX * speedMultiplier;
    ball.y += ball.velocityY;

    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY = -ball.velocityY;
    }

    let player = (ball.x < canvas.width / 2) ? user : computer;
    if (collision(ball, player)) {
        ball.velocityX = -ball.velocityX;
    }

    if (ball.x - ball.radius < 0) {
        updateScore(computer);
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        updateScore(user);
        onPointLost();
        resetBall();
    }

    moveComputer();
}

// effet visuel des particules ----

function createParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function updateParticles() {
    particles = particles.filter(particle => particle.lifetime > 0);
    particles.forEach(particle => particle.draw(context));
}

// logique collision entre la balle et la raquette -------
function collision(b, p) {
    const isCollision = b.x - b.radius < p.x + p.width &&
                        b.x + b.radius > p.x &&
                        b.y - b.radius < p.y + p.height &&
                        b.y + b.radius > p.y;

    if (isCollision) {
        if (ball.velocityX < 0 && ball.x - ball.radius <= user.x + user.width && ball.y >= user.y && ball.y <= user.y + user.height) {
            createParticles(ball.x, ball.y, "red"); 
            ball.velocityX *= 1.1; // Accélérer la balle
        } else if (ball.velocityX > 0 && ball.x + ball.radius >= computer.x && ball.y >= computer.y && ball.y <= computer.y + computer.height) {
            createParticles(ball.x, ball.y, "black"); // Collision avec la raquette de l'IA
            ball.velocityX *= 0.9;
        }
    }

    return isCollision;
}


function resetBall() {
    alert('continuer la partie?');
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = initialBallSpeed; 
    ball.velocityX = initialBallSpeed * (Math.random() > 0.5 ? 1 : -1);
    ball.velocityY = initialBallSpeed * (Math.random() > 0.5 ? 1 : -1);

    computer.speedBoostActive = false;
    user.speedBoostActive = false;
}

function render() {
    const countdownDisplay = document.querySelector("#countdown");
    const countdownDisplay2 = document.querySelector("#countdown2");
    if (user.speedBoostActive) {
        countdownDisplay.style.display = "block";
        countdownDisplay2.style.display = "block";
        powerUpImage.style.opacity = 0.2;
        powerUpImage2.style.opacity = 0.2;
        if (Date.now() - user.lastSpeedBoostTime >= speedBoostDuration) {
            user.speedBoostActive = false;
            powerUpImage.style.opacity = 1;
            powerUpImage2.style.opacity = 1;
        }
    } else if (Date.now() - user.lastSpeedBoostTime < speedBoostCooldown) {
        powerUpImage.style.opacity = 0.5;
        powerUpImage2.style.opacity = 0.5;
    } else {
        countdownDisplay.style.display = "none";
        countdownDisplay2.style.display = "none";
        powerUpImage.style.opacity = 1;
        powerUpImage2.style.opacity = 1;
    }

    if (user.widenBoostActive) {
        document.getElementById("user-power").innerText = 'User Power: Widen Boost Active';
        user.height = 100; 
            user.width = 20;  
        if (Date.now() - user.lastWidenBoostTime >= widenBoostDuration) {
            user.widenBoostActive = false;
            user.height = 70;
            user.width = 5;
        }
    }else if (computer.widenBoostActive) {
        document.getElementById("computer-power").innerText = 'Computer Power: Widen Boost Active';
    }

    

    context.clearRect(0, 0, canvas.width, canvas.height);
    drawNet();
    drawText(user.score, canvas.width / 4, canvas.height / 5, "white");
    drawText(computer.score, 3 * canvas.width / 4, canvas.height / 5, "white");
    drawRectangle(user.x, user.y, user.width, user.height, user.color);
    drawRectangle(computer.x, computer.y, computer.width, computer.height, computer.color);
    drawBallWithTrail(ball);

    updateParticles();

    document.getElementById("user-power").innerText = user.speedBoostActive ? 'User Power: Speed Boost Active' : 'User Power: Off';
    document.getElementById("computer-power").innerText = computer.speedBoostActive ? 'Computer Power: Speed Boost Active' : 'Computer Power: Off';
}

// ia versus ia en ping pong ---------
function startAIvsAI() {
    function gameLoop() {
        if (gameRunning) {
            updateGame(); 
            render();
            animationId = requestAnimationFrame(gameLoop); 
        }
    }
    gameLoop();
}

function updateGame() {
    moveBall();
    moveComputer();
    moveSecondComputer();
}


function checkWinCondition() {
    if (user.score === 7 || computer.score === 7) {
        alert(`${user.score === 7 ? 'Vous avez gagné !' : 'L\'ordinateur a gagné !'}`);
        user.score = 0;
        computer.score = 0;
        resetBall();
    }
}

// score logique ----
function updateScore(player) {
    player.score++;
    checkWinCondition();
}

// methode de lancement du jeux -------
function game() {
    if (gameRunning) {
        moveBall();
        render();
        animationId = requestAnimationFrame(game);
    }
}

startBtn.addEventListener("click", () => {
    if (!gameRunning) {
        gameRunning = true;
        game();
    }
});

let countdownTime = 15;
let countdownTime2 = 10;
let countdownInterval;

// temps d'attente pour l'utilisation des pouvoires de rapidité ---
function startCountdown() {
    countdownTime = 15;
    const countdownDisplay = document.querySelector("#countdown");
    countdownDisplay.innerText = countdownTime;

    countdownInterval = setInterval(() => {
        countdownTime--;
        countdownDisplay.innerText = countdownTime;

        if (countdownTime <= 0) {
            clearInterval(countdownInterval);
            countdownDisplay.innerText = "";
        }
    }, 1000);
}

// temps d'attente pour l'utilisation des pouvoires de d'extension de la raquette ---
function startCountdown2() {
    countdownTime2 = 10;
    const countdownDisplay = document.querySelector("#countdown2");
    countdownDisplay.innerText = countdownTime2;

    countdownInterval = setInterval(() => {
        countdownTime2--;
        countdownDisplay.innerText = countdownTime2;

        if (countdownTime2 <= 0) {
            clearInterval(countdownInterval);
            countdownDisplay.innerText = "";
        }
    }, 1000);
}

// evenement clic des bouttons ---------
pauseBtn.addEventListener("click", () => {
    gameRunning = false;
    cancelAnimationFrame(animationId);
});

canvas.addEventListener("mousemove", (event) => {
    let rect = canvas.getBoundingClientRect();
    user.y = event.clientY - rect.top - user.height / 2;

    if (user.y < 0) user.y = 0;
    if (user.y + user.height > canvas.height) user.y = canvas.height - user.height;
});

document.addEventListener("keydown", (event) => {
    const currentTime = Date.now();

    if (event.key === "a" && !user.speedBoostActive && (currentTime - user.lastSpeedBoostTime > speedBoostCooldown)) {
        user.speedBoostActive = true;
        user.lastSpeedBoostTime = currentTime; 
        startCountdown();
    }

    if (event.key === "z" && !user.widenBoostActive && (currentTime - user.lastWidenBoostTime > widenBoostCooldown) && (currentTime - startTime > 10000)) {
        user.widenBoostActive = true;
        user.lastWidenBoostTime = currentTime;
        user.height = 100; 
            user.width = 20;  
        startCountdown2();
        setTimeout(() => {
            user.widenBoostActive = false;
            user.height = 70;
            user.width = 5; 
        }, widenBoostDuration);
    }
});


startiavsia.addEventListener("click", () => {
    alert('boutton appuier');
    gameRunning = true;
    resetScores(); 
    startAIvsAI(); 
});

function resetScores() {
    user.score = 0;
    computer.score = 0;
}

let startTime = Date.now();

restartBtn.addEventListener("click", () => {
    user.score = 0;
    computer.score = 0;
    resetBall();
    gameRunning = false;
    cancelAnimationFrame(animationId);
});
