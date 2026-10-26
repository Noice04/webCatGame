
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Make the canvas fit the screen.
function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);


// ------------------------------
// FISH
// ------------------------------

const fish = [];

const fishColors = [
    "#ffb703",
    "#ff5d8f",
    "#80ed99",
    "#bdb2ff",
    "#ff7b00"
];

function createFish() {
    const size = 35 + Math.random() * 20;

    return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,

        size: size,
        speed: 50 + Math.random() * 70,

        direction: Math.random() * Math.PI * 2,

        color: fishColors[
            Math.floor(Math.random() * fishColors.length)
        ],

        tailTime: Math.random() * 10,

        scared: 0,
        speedBoost: 1
    };
}

// Create five fish.
for (let i = 0; i < 5; i++) {
    fish.push(createFish());
}


// ------------------------------
// PAW RIPPLES
// ------------------------------

const pawRipples = [];

function createPawRipple(x, y) {
    pawRipples.push({
        x: x,
        y: y,
        radius: 5,
        alpha: 1
    });
}

function drawPawRipples(dt) {
    for (let i = pawRipples.length - 1; i >= 0; i--) {
        const ripple = pawRipples[i];

        ripple.radius += 100 * dt;
        ripple.alpha -= 1.5 * dt;

        ctx.beginPath();

        ctx.arc(
            ripple.x,
            ripple.y,
            ripple.radius,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            `rgba(255, 255, 255, ${Math.max(0, ripple.alpha)})`;

        ctx.lineWidth = 3;
        ctx.stroke();

        if (ripple.alpha <= 0) {
            pawRipples.splice(i, 1);
        }
    }
}


// ------------------------------
// BACKGROUND
// ------------------------------

function drawBackground() {
    const gradient = ctx.createLinearGradient(
        0, 0,
        0, window.innerHeight
    );

    gradient.addColorStop(0, "#0796b5");
    gradient.addColorStop(1, "#043b69");

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0, 0,
        window.innerWidth,
        window.innerHeight
    );

    // Decorative bubbles.
    for (let i = 0; i < 18; i++) {
        const x = (i * 97) % window.innerWidth;
        const y = (i * 137) % window.innerHeight;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            3 + (i % 4),
            0,
            Math.PI * 2
        );

        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 2;

        ctx.stroke();
    }
}


// ------------------------------
// DRAW FISH
// ------------------------------

function drawFish(f) {
    ctx.save();

    ctx.translate(f.x, f.y);
    ctx.rotate(f.direction);

    // Wiggle the tail.
    const tailWiggle = Math.sin(f.tailTime) * 8;

    // Tail.
    ctx.fillStyle = f.color;

    ctx.beginPath();

    ctx.moveTo(-f.size * 0.35, 0);

    ctx.lineTo(
        -f.size * 0.8,
        -f.size * 0.35 + tailWiggle
    );

    ctx.lineTo(
        -f.size * 0.8,
        f.size * 0.35 + tailWiggle
    );

    ctx.closePath();
    ctx.fill();

    // Body.
    ctx.beginPath();

    ctx.ellipse(
        0, 0,
        f.size * 0.55,
        f.size * 0.35,
        0, 0,
        Math.PI * 2
    );

    ctx.fill();

    // Fin.
    ctx.beginPath();

    ctx.moveTo(-5, 0);
    ctx.lineTo(0, -f.size * 0.4);
    ctx.lineTo(10, 0);

    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fill();

    // Eye.
    ctx.beginPath();

    ctx.arc(
        f.size * 0.3,
        -f.size * 0.05,
        4,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "white";
    ctx.fill();

    ctx.beginPath();

    ctx.arc(
        f.size * 0.32,
        -f.size * 0.05,
        2,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#17202a";
    ctx.fill();

    ctx.restore();
}


// ------------------------------
// FISH MOVEMENT
// ------------------------------

function updateFish(f, dt) {
    f.tailTime += dt * 10;

    let speed = f.speed;

    // Scared fish temporarily swim faster.
    if (f.scared > 0) {
        f.scared -= dt;
        speed *= f.speedBoost;
    } else {
        f.speedBoost = 1;
    }

    // Move in the direction the fish is facing.
    f.x += Math.cos(f.direction) * speed * dt;
    f.y += Math.sin(f.direction) * speed * dt;

    // Bounce off the screen edges.
    const margin = f.size;

    if (f.x < margin) {
        f.x = margin;
        f.direction = Math.PI - f.direction;
    }

    if (f.x > window.innerWidth - margin) {
        f.x = window.innerWidth - margin;
        f.direction = Math.PI - f.direction;
    }

    if (f.y < margin) {
        f.y = margin;
        f.direction = -f.direction;
    }

    if (f.y > window.innerHeight - margin) {
        f.y = window.innerHeight - margin;
        f.direction = -f.direction;
    }

    // Occasionally change direction while swimming normally.
    if (f.scared <= 0 && Math.random() < 0.01) {
        f.direction += (Math.random() - 0.5);
    }
}


// ------------------------------
// PAW INTERACTION
// ------------------------------

function scareFish(pointerX, pointerY) {
    createPawRipple(pointerX, pointerY);

    for (const f of fish) {
        const dx = f.x - pointerX;
        const dy = f.y - pointerY;

        const distance = Math.hypot(dx, dy);

        // A nearby paw scares the fish.
        if (distance < f.size + 60) {
            // Turn away from the paw.
            f.direction = Math.atan2(dy, dx);

            // Flee for 1.5 seconds.
            f.scared = 1.5;
            f.speedBoost = 3;
        }
    }
}

// React to taps and touchscreen touches.
canvas.addEventListener("pointerdown", function(event) {
    scareFish(event.clientX, event.clientY);
});


// ------------------------------
// MAIN GAME LOOP
// ------------------------------

let previousTime = 0;

function gameLoop(time) {
    let dt = (time - previousTime) / 1000;

    previousTime = time;

    // Prevent large jumps after the browser pauses.
    dt = Math.min(dt, 0.05);

    drawBackground();

    drawPawRipples(dt);

    for (const f of fish) {
        updateFish(f, dt);
        drawFish(f);
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
