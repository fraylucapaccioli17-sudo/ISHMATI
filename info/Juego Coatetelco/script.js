(function(){
    // Elementos
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const menu = document.getElementById("menu");
    const gameUI = document.getElementById("gameUI");
    const startBtn = document.getElementById("startBtn");
    const levelupPanel = document.getElementById("levelupPanel");
    const upgradeDiv = document.getElementById("upgradeButtons");
    const touchControls = document.getElementById("touchControls");
    const mobileShootBtn = document.getElementById("mobileShootBtn");
    const joystickBase = document.getElementById("joystickBase");
    const joystickThumb = document.getElementById("joystickThumb");

    let gameActive = false;
    let animationId = null;
    let spawnInterval = null;

    // Variables del juego
    let player = {};
    let enemies = [];
    let bullets = [];
    let particles = [];
    let score = 0;
    
    // Controles
    let moveDirection = { x: 0, y: 0 };
    let keysPressed = { w: false, s: false, a: false, d: false };
    let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    let spawnDelay = 1100;
    let lastDifficultyScore = 0;

    // Ajustar tamaño canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas);

    // ========== DIBUJOS ==========
    function drawLakeBackground() {
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, "#0a4c5c");
        grad.addColorStop(1, "#02212b");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for(let i = 0; i < 80; i++) {
            ctx.fillStyle = `rgba(180, 240, 255, ${Math.random() * 0.2})`;
            ctx.beginPath();
            ctx.arc((i*131)%canvas.width, (i*57)%canvas.height, Math.random()*2+1, 0, Math.PI*2);
            ctx.fill();
        }
    }

    function drawFish(x, y, angle) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = "#FFA559";
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 11, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = "#FF8C42";
        ctx.beginPath();
        ctx.ellipse(-3, -3, 4, 3, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(7, -3, 4, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = "#010101";
        ctx.beginPath();
        ctx.arc(8, -4, 2, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = "#E07C2C";
        ctx.beginPath();
        ctx.moveTo(-11, 0);
        ctx.lineTo(-18, -7);
        ctx.lineTo(-18, 7);
        ctx.fill();
        ctx.restore();
    }

    function drawTrash(x, y, type) {
        ctx.save();
        ctx.translate(x, y);
        if(type === 0) {
            ctx.fillStyle = "#7eb09e";
            ctx.fillRect(-6, -10, 12, 18);
            ctx.fillStyle = "#4a856b";
            ctx.fillRect(-4, -13, 8, 5);
        } else if(type === 1) {
            ctx.fillStyle = "#b0a07c";
            ctx.fillRect(-7, -8, 14, 14);
            ctx.fillStyle = "#8b6946";
            ctx.fillRect(-5, -10, 10, 4);
        } else {
            ctx.fillStyle = "#b1c2b3aa";
            ctx.beginPath();
            ctx.ellipse(0, 0, 10, 12, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = "#728572";
            for(let i=0;i<3;i++) ctx.fillRect(-4+i*3, -3, 2, 8);
        }
        ctx.restore();
    }

    function drawBubble(x,y, size) {
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI*2);
        ctx.fillStyle = "#9ef0ffcc";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x-1, y-1, size*0.25, 0, Math.PI*2);
        ctx.fillStyle = "white";
        ctx.fill();
    }

    // ========== MECÁNICA ==========
    function spawnTrash() {
        if(!gameActive) return;
        let side = Math.floor(Math.random() * 4);
        let x, y;
        if(side === 0){ x = Math.random() * canvas.width; y = -20; }
        else if(side === 2){ x = Math.random() * canvas.width; y = canvas.height + 20; }
        else if(side === 1){ x = canvas.width + 20; y = Math.random() * canvas.height; }
        else { x = -20; y = Math.random() * canvas.height; }
        
        enemies.push({
            x: x, y: y, size: 14,
            speed: 1.0 + Math.random() * 0.6,
            hp: 25 + Math.floor(Math.random() * 15),
            trashType: Math.floor(Math.random() * 3)
        });
    }

    function shoot(targetX, targetY) {
        if(!gameActive) return;
        let now = Date.now();
        if(now - player.lastShot < player.fireRate) return;
        player.lastShot = now;
        
        let angle = Math.atan2(targetY - player.y, targetX - player.x);
        let shots = player.multiShot ? [-0.25, 0, 0.25] : [0];
        shots.forEach(offset => {
            let a = angle + offset;
            bullets.push({
                x: player.x, y: player.y,
                dx: Math.cos(a) * 8.5,
                dy: Math.sin(a) * 8.5,
                size: player.bigShot ? 9 : 5,
                damage: player.bigShot ? 28 : 14
            });
        });
    }

    function showLevelUp() {
        if(!gameActive) return;
        player.level++;
        player.xp = 0;
        levelupPanel.style.display = "flex";
        upgradeDiv.innerHTML = "";
        const upgrades = [
            { name: "🐟 Burbuja doble", fn: () => { player.multiShot = true; } },
            { name: "💧 Burbuja poderosa", fn: () => { player.bigShot = true; } },
            { name: "⚡ Disparo rápido", fn: () => { player.fireRate = Math.max(120, player.fireRate - 45); } },
            { name: "🛡️ Escudo natural", fn: () => { player.shield += 40; } },
            { name: "❤️ Regeneración", fn: () => { player.regen = 0.07; } }
        ];
        upgrades.forEach(up => {
            let btn = document.createElement("button");
            btn.innerText = up.name;
            btn.onclick = () => {
                up.fn();
                levelupPanel.style.display = "none";
            };
            upgradeDiv.appendChild(btn);
        });
    }

    function updateDifficulty() {
        if(score > 0 && score % 10 === 0 && score !== lastDifficultyScore){
            lastDifficultyScore = score;
            spawnDelay = Math.max(400, spawnDelay - 35);
            if(spawnInterval) clearInterval(spawnInterval);
            spawnInterval = setInterval(spawnTrash, spawnDelay);
        }
    }

    // ========== ACTUALIZACIÓN DEL JUEGO ==========
    function updateGame() {
        if(!gameActive) return;
        
        // Movimiento del pez
        let moveX = 0, moveY = 0;
        if(isMobile) {
            moveX = moveDirection.x;
            moveY = moveDirection.y;
        } else {
            if(keysPressed.w) moveY = -player.speed;
            if(keysPressed.s) moveY = player.speed;
            if(keysPressed.a) moveX = -player.speed;
            if(keysPressed.d) moveX = player.speed;
        }
        
        let newX = player.x + moveX;
        let newY = player.y + moveY;
        player.x = Math.min(Math.max(newX, 18), canvas.width - 18);
        player.y = Math.min(Math.max(newY, 18), canvas.height - 18);
        
        // Actualizar burbujas
        for(let i=bullets.length-1; i>=0; i--){
            let b = bullets[i];
            b.x += b.dx;
            b.y += b.dy;
            if(b.x < -50 || b.x > canvas.width+50 || b.y < -50 || b.y > canvas.height+50){
                bullets.splice(i,1);
                continue;
            }
            let hit = false;
            for(let j=enemies.length-1; j>=0; j--){
                let e = enemies[j];
                let dist = Math.hypot(b.x - e.x, b.y - e.y);
                if(dist < e.size){
                    e.hp -= b.damage;
                    bullets.splice(i,1);
                    hit = true;
                    if(e.hp <= 0){
                        enemies.splice(j,1);
                        score++;
                        player.xp += 18;
                        for(let p=0;p<6;p++) particles.push({ x: e.x, y: e.y, life: 12 });
                    }
                    break;
                }
            }
        }
        
        // Movimiento de basura
        for(let e of enemies){
            let angle = Math.atan2(player.y - e.y, player.x - e.x);
            e.x += Math.cos(angle) * e.speed;
            e.y += Math.sin(angle) * e.speed;
        }
        
        // Daño por colisión
        for(let i=0; i<enemies.length; i++){
            let e = enemies[i];
            let dist = Math.hypot(player.x - e.x, player.y - e.y);
            if(dist < player.size + e.size){
                if(player.shield > 0){
                    player.shield -= 1.5;
                } else {
                    player.hp -= 0.4;
                }
                let angleAway = Math.atan2(e.y - player.y, e.x - player.x);
                e.x += Math.cos(angleAway) * 5;
                e.y += Math.sin(angleAway) * 5;
            }
        }
        
        // Regeneración
        if(player.regen > 0 && player.hp < player.maxHp) player.hp = Math.min(player.maxHp, player.hp + player.regen);
        
        // Partículas
        for(let i=0;i<particles.length;i++) particles[i].life--;
        particles = particles.filter(p => p.life > 0);
        
        // Nivel y dificultad
        if(player.xp >= 100) showLevelUp();
        updateDifficulty();
        
        // Actualizar UI
        document.getElementById("hpValue").innerText = Math.floor(player.hp);
        document.getElementById("scoreValue").innerText = score;
        document.getElementById("levelValue").innerText = player.level;
        document.getElementById("shieldValue").innerText = Math.floor(player.shield);
        
        // Game Over
        if(player.hp <= 0){
            gameActive = false;
            if(spawnInterval) clearInterval(spawnInterval);
            if(animationId) cancelAnimationFrame(animationId);
            alert("🌿 GAME OVER 🌿\nEl lago necesita más cuidadores.\nBasura eliminada: " + score);
            location.reload();
        }
    }
    
    // ========== DIBUJAR ==========
    let mouseAngle = 0;
    function draw() {
        if(!gameActive) return;
        drawLakeBackground();
        
        for(let e of enemies){
            drawTrash(e.x, e.y, e.trashType);
            ctx.fillStyle = "#dd4444aa";
            ctx.fillRect(e.x-12, e.y-14, (e.hp/35)*24, 4);
        }
        
        for(let b of bullets){
            drawBubble(b.x, b.y, b.size-1);
        }
        
        let angle = mouseAngle;
        drawFish(player.x, player.y, angle);
        
        for(let p of particles){
            ctx.fillStyle = `rgba(250, 200, 100, ${p.life/10})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
            ctx.fill();
        }
    }
    
    // ========== LOOP PRINCIPAL ==========
    function gameLoop() {
        if(!gameActive) return;
        updateGame();
        draw();
        animationId = requestAnimationFrame(gameLoop);
    }
    
    // ========== INICIALIZAR JUEGO ==========
    function initGame() {
        gameActive = true;
        resizeCanvas();
        enemies = [];
        bullets = [];
        particles = [];
        score = 0;
        lastDifficultyScore = 0;
        spawnDelay = 1100;
        
        player = {
            x: canvas.width/2, y: canvas.height/2,
            size: 16, speed: 4.5,
            hp: 110, maxHp: 110,
            xp: 0, level: 1,
            fireRate: 350, lastShot: 0,
            multiShot: false,
            bigShot: false,
            regen: 0,
            shield: 15
        };
        
        if(spawnInterval) clearInterval(spawnInterval);
        spawnInterval = setInterval(spawnTrash, spawnDelay);
        
        gameLoop();
    }
    
    // ========== EVENTOS ==========
    startBtn.onclick = () => {
        menu.style.display = "none";
        gameUI.style.display = "block";
        canvas.style.display = "block";
        if(isMobile) touchControls.style.display = "flex";
        initGame();
    };
    
    // Controles PC
    window.addEventListener("keydown", (e) => {
        let k = e.key.toLowerCase();
        if(k === 'w' || k === 's' || k === 'a' || k === 'd') keysPressed[k] = true;
    });
    window.addEventListener("keyup", (e) => {
        let k = e.key.toLowerCase();
        if(k === 'w' || k === 's' || k === 'a' || k === 'd') keysPressed[k] = false;
    });
    
    canvas.addEventListener("mousemove", (e) => {
        let dx = e.clientX - player.x;
        let dy = e.clientY - player.y;
        mouseAngle = Math.atan2(dy, dx);
    });
    
    canvas.addEventListener("click", (e) => {
        if(gameActive) shoot(e.clientX, e.clientY);
    });
    
    // Controles móviles - Joystick
    let joystickActive = false;
    let joystickCenter = { x: 0, y: 0 };
    
    function handleTouchStart(e) {
        e.preventDefault();
        joystickActive = true;
        let rect = joystickBase.getBoundingClientRect();
        joystickCenter.x = rect.left + rect.width/2;
        joystickCenter.y = rect.top + rect.height/2;
        handleTouchMove(e);
    }
    
    function handleTouchMove(e) {
        e.preventDefault();
        if(!joystickActive) return;
        let touch = e.touches[0];
        let dx = touch.clientX - joystickCenter.x;
        let dy = touch.clientY - joystickCenter.y;
        let distance = Math.min(45, Math.hypot(dx, dy));
        let angle = Math.atan2(dy, dx);
        let thumbX = 37.5 + Math.cos(angle) * distance;
        let thumbY = 37.5 + Math.sin(angle) * distance;
        joystickThumb.style.left = thumbX + "px";
        joystickThumb.style.top = thumbY + "px";
        
        let speed = distance / 45;
        moveDirection.x = Math.cos(angle) * speed * 4.5;
        moveDirection.y = Math.sin(angle) * speed * 4.5;
    }
    
    function handleTouchEnd(e) {
        e.preventDefault();
        joystickActive = false;
        joystickThumb.style.left = "37.5px";
        joystickThumb.style.top = "37.5px";
        moveDirection.x = 0;
        moveDirection.y = 0;
    }
    
    if(isMobile && joystickBase) {
        joystickBase.addEventListener("touchstart", handleTouchStart);
        joystickBase.addEventListener("touchmove", handleTouchMove);
        joystickBase.addEventListener("touchend", handleTouchEnd);
        
        mobileShootBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if(gameActive) shoot(player.x + 10, player.y);
        });
        
        mobileShootBtn.addEventListener("touchstart", (e) => {
            e.preventDefault();
            if(gameActive) shoot(player.x + 10, player.y);
        });
    }
    
    // Actualizar ángulo en móvil con movimiento del joystick
    setInterval(() => {
        if(gameActive && isMobile && (moveDirection.x !== 0 || moveDirection.y !== 0)) {
            mouseAngle = Math.atan2(moveDirection.y, moveDirection.x);
        }
    }, 50);
    
    resizeCanvas();
})();