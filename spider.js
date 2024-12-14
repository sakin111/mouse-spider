const canvas = document.getElementById('spiderCanvas');
const ctx = canvas.getContext('2d');
const lightArea = document.querySelector('.light-area');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const mouse = { x: null, y: null };

const dots = Array.from({ length: 2000 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
}));

class Spider {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.legs = 8;
        this.speed = 4;
        this.searchSpeed = 50;
        this.radius = 40; // Minimum distance to other spiders
    }

    draw() {
        // Draw spider body (bacteria-like)
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, 7, 8, 2, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < this.legs; i++) {
            const angle = (Math.PI * 2 / this.legs) * i;
            const legX = this.x + Math.cos(angle) * 30;
            const legY = this.y + Math.sin(angle) * 30;

            const closestDot = this.findClosestDot(legX, legY);
            const endX = closestDot ? closestDot.x : legX;
            const endY = closestDot ? closestDot.y : legY;

            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = 'white';
            ctx.stroke();

            if (closestDot) {
                ctx.beginPath();
                ctx.arc(endX, endY, 3, 0, Math.PI * 2);
                ctx.fillStyle = 'white';
                ctx.fill();
            }
        }
    }

    findClosestDot(x, y) {
        let minDistance = Infinity;
        let closestDot = null;

        dots.forEach(dot => {
            const dx = x - dot.x;
            const dy = y - dot.y;
            const distance = Math.sqrt(dx ** 2 + dy ** 2);

            if (distance < minDistance) {
                minDistance = distance;
                closestDot = dot;
            }
        });

        return minDistance < 30 ? closestDot : null;
    }

    moveToward(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);

        if (distance > 1) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }

    randomWander() {
        const targetX = this.x + (Math.random() - 0.5) * 100;
        const targetY = this.y + (Math.random() - 0.5) * 100;
        this.moveToward(targetX, targetY);
    }

    avoidOtherSpider(otherSpider) {
        const dx = this.x - otherSpider.x;
        const dy = this.y - otherSpider.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);

        if (distance < this.radius) {
            this.x += (dx / distance) * this.searchSpeed;
            this.y += (dy / distance) * this.searchSpeed;
        }
    }
}

const spiders = [
    new Spider(Math.random() * canvas.width, Math.random() * canvas.height),
    new Spider(Math.random() * canvas.width, Math.random() * canvas.height)
];

function drawDots() {
    ctx.fillStyle = 'white';
    dots.forEach(dot => {
        if (mouse.x && Math.hypot(dot.x - mouse.x, dot.y - mouse.y) < 130) {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawDots();
    spiders.forEach((spider, index) => {
        if (mouse.x !== null && mouse.y !== null) {
            spider.moveToward(mouse.x, mouse.y);
        } else {
            spider.randomWander();
        }

        spiders.forEach((otherSpider, otherIndex) => {
            if (index !== otherIndex) {
                spider.avoidOtherSpider(otherSpider);
            }
        });

        spider.draw();
    });
    requestAnimationFrame(animate);
}

window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    lightArea.style.left = `${e.clientX}px`;
    lightArea.style.top = `${e.clientY}px`;
});

window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

animate();