const CowType = Object.freeze({
    SICK: 'sick',
    HUNGRY: 'hungry',
    ORDER: 'order'
});

const cowData = {
    [CowType.SICK]: {
        image: 'images/game/cows/sick.png',
        label: 'enferma',
        tool: 'syringe',
        status: 'Esta vaca está enferma.'
    },
    [CowType.HUNGRY]: {
        image: 'images/game/cows/hungry.png',
        label: 'hambrienta',
        tool: 'hay',
        status: 'Esta vaca tiene hambre.'
    },
    [CowType.ORDER]: {
        image: 'images/game/cows/order.png',
        label: 'a ordenar',
        tool: 'bucket',
        status: 'Esta vaca está lista para ordeñar.'
    }
};

const BASE_ROUND_DURATION = 7000;
const SPEED_INCREMENT = 0.2;
const MAX_SPEED = 2.8;

const canvas = document.getElementById('farm-canvas');
const context = canvas.getContext('2d');
const elements = {
    score: document.getElementById('score'),
    round: document.getElementById('round'),
    status: document.getElementById('cow-status'),
    timeLeft: document.getElementById('time-left'),
    timeMeter: document.getElementById('time-meter'),
    layout: document.getElementById('game-layout'),
    finalScore: document.getElementById('final-score')
};

const state = {
    score: 0,
    round: 0,
    cow: null,
    cowImage: null,
    x: -150,
    startedAt: 0,
    duration: BASE_ROUND_DURATION,
    speed: 1,
    lastFrame: 0,
    running: true
};

function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    const bounds = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(bounds.width * ratio));
    canvas.height = Math.max(1, Math.floor(bounds.height * ratio));
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function pickCow() {
    const types = Object.values(CowType);
    return types[Math.floor(Math.random() * types.length)];
}

function startRound() {
    state.round += 1;
    state.cow = pickCow();
    state.cowImage = new Image();
    state.cowImage.src = cowData[state.cow].image;
    state.x = -150;
    state.startedAt = performance.now();
    state.speed = Math.min(MAX_SPEED, 1 + (state.round - 1) * SPEED_INCREMENT);
    state.duration = BASE_ROUND_DURATION / state.speed;
    elements.round.textContent = state.round;
    elements.status.textContent = cowData[state.cow].status;
    elements.timeMeter.style.width = '100%';
    elements.timeLeft.textContent = '100%';
}

function drawScene(now) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const progress = Math.min(1, (now - state.startedAt) / state.duration);
    const ground = height * 0.77;

    context.clearRect(0, 0, width, height);
    context.fillStyle = '#dcebd8';
    context.fillRect(0, 0, width, height);
    context.fillStyle = '#c4dfb9';
    context.fillRect(0, ground, width, height - ground);
    context.strokeStyle = '#a5cd8e';
    context.lineWidth = 2;
    for (let x = 0; x < width; x += 34) {
        context.beginPath();
        context.moveTo(x, ground + 8);
        context.lineTo(x + 5, ground - 2);
        context.moveTo(x + 7, ground + 8);
        context.lineTo(x + 12, ground + 1);
        context.stroke();
    }

    state.x = -150 + (width + 300) * progress;
    const bob = Math.sin(now / 115) * 5;
    if (state.cowImage.complete && state.cowImage.naturalWidth) {
        const cowHeight = Math.min(height * 0.48, 225);
        const cowWidth = cowHeight * (state.cowImage.naturalWidth / state.cowImage.naturalHeight);
        const tilt = Math.sin(now / 145) * 0.05;
        context.save();
        context.translate(state.x, ground - cowHeight / 2 + bob);
        context.rotate(tilt);
        context.drawImage(state.cowImage, -cowWidth / 2, -cowHeight / 2, cowWidth, cowHeight);
        context.restore();
    } else {
        drawFallbackCow(state.x, ground + bob);
    }

    const remaining = Math.max(0, 1 - progress);
    elements.timeMeter.style.width = `${remaining * 100}%`;
    elements.timeLeft.textContent = `${Math.ceil(remaining * 100)}%`;
    if (progress >= 1) {
        finishGame();
        return;
    }
    if (state.running) {
        state.lastFrame = requestAnimationFrame(drawScene);
    }
}

function drawFallbackCow(x, y) {
    context.save();
    context.translate(x, y - 120);
    context.fillStyle = '#fffdf6';
    context.strokeStyle = '#8b7666';
    context.lineWidth = 4;
    context.beginPath();
    context.ellipse(0, 80, 90, 55, 0, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.beginPath();
    context.arc(92, 63, 37, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.fillStyle = '#6e5c52';
    context.beginPath();
    context.arc(-28, 62, 18, 0, Math.PI * 2);
    context.arc(25, 95, 14, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#fff';
    context.fillRect(-57, 123, 13, 43);
    context.fillRect(35, 123, 13, 43);
    context.restore();
}

function chooseTool(tool) {
    if (!state.running) return;
    if (tool === cowData[state.cow].tool) {
        state.score += 1;
        elements.score.textContent = state.score;
        startRound();
        return;
    }
    finishGame();
}

function finishGame() {

    const previousBest = Number(localStorage.getItem('maxScore')) || 0;
    if (state.score > previousBest) localStorage.setItem('maxScore', String(state.score));
    

    state.running = false;
    localStorage.setItem('score', String(state.score));
    cancelAnimationFrame(state.lastFrame);
    window.location.href = 'finish.html';

}

function restartGame() {
    state.score = 0;
    state.round = 0;
    state.running = true;
    elements.score.textContent = '0';
    elements.layout.hidden = false;
    elements.gameOver.hidden = true;
    startRound();
    state.lastFrame = requestAnimationFrame(drawScene);
}

document.addEventListener('DOMContentLoaded', () => {
    const farmName = localStorage.getItem('farmName');
    if (!farmName) {
        window.location.href = 'index.html';
        return;
    }
    document.getElementById('farm-name').textContent = farmName;
    document.querySelectorAll('[data-tool]').forEach((button) => {
        button.addEventListener('click', () => chooseTool(button.dataset.tool));
    });

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    startRound();
    state.lastFrame = requestAnimationFrame(drawScene);
});
