
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
const backgroundImage = new Image();

backgroundImage.src = "Assets/water.png";

// ------------------------------
// FISH
// ---------------------  ---------

const fish = [];

//just for readability
const saltwater = "Assets/Critters of Yonder - Gone Fishing/Critters of Yonder - Gone Fishing/Saltwater Fish/";
const freshwater = "Assets/Critters of Yonder - Gone Fishing/Critters of Yonder - Gone Fishing/Freshwater Fish/";
//there are more fish in the assets but this should suffice
const fishFiles =[
    freshwater + "Angelfish.png",
    freshwater + "Bluegill.png",
    saltwater + "Anchovy.png",
];

const fishImages = fishFiles.map(function(file) {
    const image = new Image();
    image.src = file;
    return image;
});

const fishColors = [
    "#ffb703",
    "#ff5d8f",
    "#80ed99",
    "#bdb2ff",
    "#ff7b00"
];

function createFish() {
    const size = 35 + Math.random() * 40;

    return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,

        size: size,
        speed: 200 + Math.random() * 70 - size,

        direction: Math.random() * Math.PI * 2,
        
        image: fishImages[
            Math.floor(Math.random()* fishImages.length)
        ],

        tailTime: Math.random() * 10,

        scared: 0,
        speedBoost: 1
    };
}
//-------------------------------
//create bubbles
//---------------------------------
const bubbles = [];

function createBubble() {
    const size = 3 + Math.random() * 12;

    return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: size,
        speed: 15 + Math.random() * 35,
        wobble: Math.random() * Math.PI * 2
    };
}

// Create 30 bubbles to start with.
for (let i = 0; i < 30; i++) {
    bubbles.push(createBubble());
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
/*
function drawBackground() {
    if (!backgroundImage.complete ||
        backgroundImage.naturalWidth === 0) {
        return;
    }

    ctx.drawImage(
        backgroundImage,
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );
}
*/

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
    

// -------------------------------
// move and draw Bubbles
//-------------------------------
function updateBubbles(dt) {
    for (const bubble of bubbles) {
        bubble.y -= bubble.speed * dt;

        // Gently move the bubble from side to side.
        bubble.x += Math.sin(bubble.wobble) * 15 * dt;
        bubble.wobble += dt * 2;

        // Reset the bubble when it floats offscreen.
        if (bubble.y < -bubble.size) {
            bubble.y = window.innerHeight + bubble.size;
            bubble.x = Math.random() * window.innerWidth;
        }
    }
}

function drawBubbles() {
    for (const bubble of bubbles) {
        ctx.beginPath();

        ctx.arc(
            bubble.x,
            bubble.y,
            bubble.size,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Small highlight to make the bubble look shiny.
        ctx.beginPath();
        ctx.arc(
            bubble.x - bubble.size * 0.3,
            bubble.y - bubble.size * 0.3,
            bubble.size * 0.2,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.fill();
    }
}

// ------------------------------
// DRAW FISH
// ------------------------------

function drawFish(f) {
    //only draws fish once png is loaded
    if (!f.image.complete || f.image.naturalWidth === 0) {
        return;
    }

    ctx.save();

    // movement
    ctx.translate(f.x, f.y);

    // rotates the fish towards where its faceing
    ctx.rotate(f.direction +19.5);

    // Preserve the PNG's original proportions.
    const aspectRatio =
        f.image.naturalHeight / f.image.naturalWidth;

    const width = f.size;
    const height = width * aspectRatio;

    // Draw the image centered on the fish.
    ctx.drawImage(
        f.image,
        -width / 2,
        -height / 2,
        width,
        height
    );

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

    updateBubbles(dt);

    drawBackground();

    drawPawRipples(dt);

    drawBubbles();


    for (const f of fish) {
        updateFish(f, dt);
        drawFish(f);
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
