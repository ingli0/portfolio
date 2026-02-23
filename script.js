// --- 1. DYNAMIC NEURAL PLEXUS (THREE.JS) ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

const pointCount = 120;
const points = [];
const velocities = [];
const boundary = 400;

for (let i = 0; i < pointCount; i++) {
    points.push(new THREE.Vector3(
        THREE.MathUtils.randFloatSpread(boundary * 2),
        THREE.MathUtils.randFloatSpread(boundary * 2),
        THREE.MathUtils.randFloatSpread(boundary * 2)
    ));
    velocities.push(new THREE.Vector3(
        THREE.MathUtils.randFloat(-0.5, 0.5),
        THREE.MathUtils.randFloat(-0.5, 0.5),
        THREE.MathUtils.randFloat(-0.5, 0.5)
    ));
}

const starGeo = new THREE.BufferGeometry().setFromPoints(points);
const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2, transparent: true, opacity: 0.9 });
const starMesh = new THREE.Points(starGeo, starMat);
scene.add(starMesh);

const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 });

camera.position.z = 600;

let mouse = new THREE.Vector2(-100, -100);
window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

function animate() {
    requestAnimationFrame(animate);

    const positions = starGeo.attributes.position.array;
    const lineCoords = [];

    for (let i = 0; i < pointCount; i++) {
        const i3 = i * 3;
        positions[i3] += velocities[i].x;
        positions[i3+1] += velocities[i].y;
        positions[i3+2] += velocities[i].z;

        if (Math.abs(positions[i3]) > boundary) velocities[i].x *= -1;
        if (Math.abs(positions[i3+1]) > boundary) velocities[i].y *= -1;
        if (Math.abs(positions[i3+2]) > boundary) velocities[i].z *= -1;

        for (let j = i + 1; j < pointCount; j++) {
            const j3 = j * 3;
            const dx = positions[i3] - positions[j3];
            const dy = positions[i3+1] - positions[j3+1];
            const dz = positions[i3+2] - positions[j3+2];
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

            if (dist < 200) {
                lineCoords.push(positions[i3], positions[i3+1], positions[i3+2]);
                lineCoords.push(positions[j3], positions[j3+1], positions[j3+2]);
            }
        }
    }

    if (scene.getObjectByName("lines")) {
        const oldLines = scene.getObjectByName("lines");
        scene.remove(oldLines);
        oldLines.geometry.dispose();
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineCoords, 3));
    const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
    lineSegments.name = "lines";
    scene.add(lineSegments);

    starGeo.attributes.position.needsUpdate = true;
    
    camera.position.x += (mouse.x * 100 - camera.position.x) * 0.05;
    camera.position.y += (mouse.y * 100 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}
animate();

// --- 2. THEME TOGGLE ---
const themeBtn = document.getElementById('theme-toggle');
const modeText = document.getElementById('mode-text');
const ticker = document.getElementById('ticker-section');
const canvasContainer = document.getElementById('canvas-container');

themeBtn.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    
    if (!isLight) {
        document.documentElement.setAttribute('data-theme', 'light');
        modeText.innerText = "Light";
        starMat.color.setHex(0x0066ff);
        starMat.opacity = 0.3;
        ticker.classList.remove('bg-white', 'text-black');
        ticker.classList.add('bg-black', 'text-white');
        canvasContainer.style.background = "radial-gradient(circle at center, #ffffff 0%, #e0e0e0 100%)";
    } else {
        document.documentElement.removeAttribute('data-theme');
        modeText.innerText = "Dark";
        starMat.color.setHex(0xffffff);
        starMat.opacity = 0.6;
        ticker.classList.add('bg-white', 'text-black');
        ticker.classList.remove('bg-black', 'text-white');
        canvasContainer.style.background = "radial-gradient(circle at center, #0a151a 0%, #050505 100%)";
    }
    
    gsap.fromTo("main", { opacity: 0.5 }, { opacity: 1, duration: 0.4 });
});

// --- 3. CURSOR & GSAP ---
const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');

document.addEventListener('mousemove', (e) => {
    gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0 });
    gsap.to(ring, { x: e.clientX - 20, y: e.clientY - 20, duration: 0.15 });
});

gsap.registerPlugin(ScrollTrigger);

gsap.from(".reveal", { y: 50, opacity: 0, duration: 1.2, ease: "power3.out" });

gsap.to(".animate-scroll", {
    xPercent: -50,
    ease: "none",
    scrollTrigger: { trigger: ".animate-scroll", scrub: 0.5 }
});

gsap.from("#hero-arch", {
    x: 100,
    opacity: 0,
    duration: 2,
    ease: "power4.out",
    delay: 0.5
});

gsap.to("#hero-arch", {
    y: 150,
    ease: "none",
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom top",
        scrub: 1
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const neuralOverlay = document.getElementById('neural-overlay');
const dataX = document.getElementById('data-x');
const dataY = document.getElementById('data-y');
const dataConf = document.getElementById('data-conf');

function drawGraph(mousePos = { x: -1000, y: -1000 }) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    skills.forEach(skill => {
        // Calculate "Gravitational Pull" toward mouse
        const dx = mousePos.x - skill.x;
        const dy = mousePos.y - skill.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        const offsetX = dist < 200 ? dx * 0.1 : 0;
        const offsetY = dist < 200 ? dy * 0.1 : 0;


skill.related.forEach(relName => {
    const rel = skills.find(s => s.name === relName);
    if (rel) {
        const dx = mousePos.x - skill.x;
        const dy = mousePos.y - skill.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        ctx.beginPath();
        // If mouse is near, lines glow with the accent color
        ctx.strokeStyle = dist < 150 ? 
            getComputedStyle(document.documentElement).getPropertyValue('--accent') : 
            'rgba(255,255,255,0.1)';
        
        ctx.globalAlpha = dist < 150 ? 0.6 : 0.1;
        ctx.lineWidth = dist < 150 ? 2 : 1;
        
        ctx.moveTo(skill.x + offsetX, skill.y + offsetY);
        ctx.lineTo(rel.x, rel.y);
        ctx.stroke();
    }
});

        ctx.globalAlpha = 1;
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
        ctx.font = "bold 12px Space Grotesk";
        ctx.fillText(skill.name, skill.x + offsetX + 10, skill.y + offsetY + 5);
        
        ctx.beginPath();
        ctx.arc(skill.x + offsetX, skill.y + offsetY, 4, 0, Math.PI * 2);
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent');
        ctx.fill();
    });
}

document.addEventListener('mousemove', (e) => {
    gsap.to(neuralOverlay, { x: e.clientX, y: e.clientY, duration: 0.1 });
    
    dataX.innerText = (e.clientX / 1000).toFixed(2);
    dataY.innerText = (e.clientY / 1000).toFixed(2);
    dataConf.innerText = (85 + Math.random() * 14).toFixed(2);
});

const techAreas = document.querySelectorAll('.glass-card, #hero-arch, .poster-title');

techAreas.forEach(area => {
    area.addEventListener('mouseenter', () => {
        neuralOverlay.style.opacity = "1";
        gsap.to(ring, { scale: 2, opacity: 0, duration: 0.3 }); 
    });
    area.addEventListener('mouseleave', () => {
        neuralOverlay.style.opacity = "0";
        gsap.to(ring, { scale: 1, opacity: 1, duration: 0.3 });
    });
});

const lens = document.createElement('div');
lens.id = 'vision-lens';
document.body.appendChild(lens);

Object.assign(lens.style, {
    position: 'fixed',
    width: '250px',
    height: '250px',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: '5',
    border: '1px solid var(--accent)',
    opacity: '0',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
});

const archClone = document.getElementById('hero-arch').cloneNode();
archClone.style.width = '100vw'; 
archClone.style.height = '100vh';
archClone.style.filter = 'url(#neural-vision) brightness(2)';
lens.appendChild(archClone);

document.addEventListener('mousemove', (e) => {
    // Move the lens
    gsap.to(lens, { x: e.clientX - 125, y: e.clientY - 125, duration: 0.1 });
    
    gsap.to(archClone, { 
        x: -e.clientX + 125, 
        y: -e.clientY + 125, 
        duration: 0.1 
    });
});

const archContainer = document.getElementById('arch-wrapper');
archContainer.addEventListener('mouseenter', () => gsap.to(lens, {opacity: 1}));
archContainer.addEventListener('mouseleave', () => gsap.to(lens, {opacity: 0}));

let keys = "";
window.addEventListener('keydown', (e) => {
    keys += e.key.toLowerCase();
    if (keys.endsWith('ml')) {
        const overlay = document.createElement('div');
        overlay.className = "fixed inset-0 bg-black z-[200] p-10 font-mono text-green-500 overflow-hidden";
        overlay.innerHTML = "<div>> INITIALIZING NEURAL_DUMP...</div>";
        document.body.appendChild(overlay);
        
        let i = 0;
        const interval = setInterval(() => {
            overlay.innerHTML += `<div>[${Math.random().toString(16)}] EPOCH_${i} LOSS: ${(Math.random() * 0.1).toFixed(4)}</div>`;
            window.scrollTo(0, document.body.scrollHeight);
            if (i++ > 20) {
                clearInterval(interval);
                setTimeout(() => overlay.remove(), 1000);
            }
        }, 50);
        keys = "";
    }
});

const skills = [
    { name: ".NET", x: 150, y: 100, related: ["C#", "Blazor", "Web API", "SQL"] },
    { name: "C#", x: 100, y: 180, related: [".NET", "SQL"] },
    { name: "Blazor", x: 220, y: 160, related: [".NET"] },
    { name: "Web API", x: 250, y: 80, related: [".NET", "DevOps"] },
    { name: "SQL", x: 80, y: 300, related: ["C#", "Data Warehousing", "ETL"] },

    { name: "Python", x: 500, y: 350, related: ["ML", "Computer Vision", "PyTorch"] },
    { name: "Computer Vision", x: 650, y: 320, related: ["Python", "ML", "LBP Analysis"] },
    { name: "ML", x: 580, y: 420, related: ["Python", "Computer Vision"] },
    { name: "PyTorch", x: 700, y: 400, related: ["Python", "ML"] },
    { name: "LBP Analysis", x: 750, y: 280, related: ["Computer Vision"] },

    { name: "DevOps", x: 400, y: 100, related: ["Web API", "Agile"] },
    { name: "Agile", x: 450, y: 50, related: ["DevOps"] },
    { name: "ETL", x: 200, y: 380, related: ["SQL", "Data Warehousing"] },
    { name: "Data Warehousing", x: 300, y: 420, related: ["SQL", "ETL"] },
    { name: "LLM Integration", x: 550, y: 150, related: ["Python", "Web API"] }
];

const graphContainer = document.getElementById('skill-graph');
const canvas = document.getElementById('graph-canvas');
const ctx = canvas.getContext('2d');

const skillData = [
    { name: ".NET", x: 20, y: 20, related: ["C#", "Blazor", "Web API", "SQL"] },
    { name: "C#", x: 15, y: 40, related: [".NET", "SQL"] },
    { name: "Blazor", x: 30, y: 35, related: [".NET"] },
    { name: "Web API", x: 35, y: 15, related: [".NET", "DevOps"] },
    { name: "SQL", x: 10, y: 65, related: ["C#", "Data Warehousing", "ETL"] },
    { name: "Python", x: 70, y: 75, related: ["ML", "Computer Vision", "PyTorch"] },
    { name: "Computer Vision", x: 85, y: 65, related: ["Python", "ML", "LBP Analysis"] },
    { name: "ML", x: 80, y: 85, related: ["Python", "Computer Vision"] },
    { name: "PyTorch", x: 90, y: 80, related: ["Python", "ML"] },
    { name: "LBP Analysis", x: 92, y: 55, related: ["Computer Vision"] },
    { name: "DevOps", x: 55, y: 20, related: ["Web API", "Agile"] },
    { name: "Agile", x: 65, y: 10, related: ["DevOps"] },
    { name: "ETL", x: 25, y: 80, related: ["SQL", "Data Warehousing"] },
    { name: "Data Warehousing", x: 40, y: 85, related: ["SQL", "ETL"] },
    { name: "LLM Integration", x: 75, y: 30, related: ["Python", "Web API"] }
];

let width, height;

function initGraph() {
    width = graphContainer.offsetWidth;
    height = graphContainer.offsetHeight;
    canvas.width = width;
    canvas.height = height;
}

window.addEventListener('resize', () => {
    initGraph();
    renderGraph();
});

function renderGraph(mousePos = { x: -1000, y: -1000 }) {
    ctx.clearRect(0, 0, width, height);
    
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();

    skillData.forEach(skill => {
        const x1 = (skill.x / 100) * width;
        const y1 = (skill.y / 100) * height;

        skill.related.forEach(relName => {
            const rel = skillData.find(s => s.name === relName);
            if (rel) {
                const x2 = (rel.x / 100) * width;
                const y2 = (rel.y / 100) * height;

                const dist = Math.hypot(mousePos.x - x1, mousePos.y - y1);
                
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                
                ctx.strokeStyle = dist < 150 ? accentColor : 'rgba(255,255,255,0.08)';
                ctx.lineWidth = dist < 150 ? 2 : 1;
                ctx.stroke();
            }
        });
    });

    skillData.forEach(skill => {
        const x = (skill.x / 100) * width;
        const y = (skill.y / 100) * height;
        const dist = Math.hypot(mousePos.x - x, mousePos.y - y);

        ctx.beginPath();
        ctx.arc(x, y, dist < 100 ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = dist < 100 ? accentColor : 'rgba(255,255,255,0.3)';
        ctx.fill();

        
        ctx.fillStyle = dist < 100 ? '#ffffff' : 'rgba(255,255,255,0.4)';
        ctx.font = `${dist < 100 ? 'bold 14px' : '10px'} Space Grotesk`;
        ctx.textAlign = "center";
        ctx.fillText(skill.name, x, y - 15);
    });
}

const handleMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    renderGraph({ x: clientX - rect.left, y: clientY - rect.top });
};

canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleMove(e); }, {passive: false});
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); handleMove(e); }, {passive: false});
canvas.addEventListener('mouseleave', () => renderGraph());

initGraph();
renderGraph();

graphContainer.addEventListener('touchmove', (e) => {
    const rect = graphContainer.getBoundingClientRect();
    const touch = e.touches[0];
    drawGraph({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
    e.preventDefault(); 
}, { passive: false });


const activityContainer = document.getElementById('activity-bars');
const activityPct = document.getElementById('activity-pct');
const barCount = 10;
const bars = []; 

let scrollVelocity = 0;
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    scrollVelocity = Math.abs(window.scrollY - lastScrollY);
    lastScrollY = window.scrollY;
});


gsap.to("#hero-arch", {
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5,
    },
  
    scale: 1.5,
    objectPosition: "50% 100%", 
    filter: "grayscale(100%) contrast(120%) brightness(0.8) blur(0px)",
});

const addGrain = () => {
    const archWrapper = document.getElementById('arch-wrapper');
    const grain = document.createElement('div');
    grain.style.cssText = `
        position: absolute; inset: 0;
        background: url('https://grainy-gradients.vercel.app/noise.svg');
        opacity: 0.05; pointer-events: none; z-index: 1;
    `;
    archWrapper.appendChild(grain);
};
addGrain();

document.addEventListener('mousemove', (e) => {
    const xPct = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
    const yPct = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1

    gsap.to("#hero-arch", {
        duration: 1.5,
        x: xPct * 30,
        y: yPct * 20,
        rotationY: xPct * 5,
        rotationX: -yPct * 5,
        ease: "power2.out"
    });

    gsap.to(camera.position, {
        duration: 2,
        x: xPct * 100,
        y: -yPct * 100,
        ease: "power3.out"
    });
});

gsap.utils.toArray(".glass-card").forEach((card, i) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "top center",
            scrub: true
        },
        opacity: 0,
        y: 100,
        rotateX: -15,
        scale: 0.9,
        transformOrigin: "center top"
    });
});

const archWrapper = document.getElementById('arch-wrapper');

function handleOrientation(event) {
    const x = event.gamma; 
    const y = event.beta;

    const xMove = gsap.utils.clamp(-20, 20, x);
    const yMove = gsap.utils.clamp(-20, 20, y - 45); 

    gsap.to("#hero-arch", {
        x: xMove * 2,
        y: yMove * 2,
        rotationY: xMove * 0.2,
        duration: 1,
        ease: "power2.out"
    });

    gsap.to(camera.position, {
        x: xMove * 5,
        y: -yMove * 5,
        duration: 1.5,
        ease: "power3.out"
    });
}

const enableTilt = () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                }
            })
            .catch(console.error);
    } else {
        window.addEventListener('deviceorientation', handleOrientation);
    }
};

 


let secretInput = "";

window.addEventListener("keydown", e => {

    secretInput += e.key.toLowerCase();

    if (secretInput.length > 20)
        secretInput = secretInput.slice(-20);

    if (secretInput.includes("whoami")) {

        openConsole();

        secretInput = "";

    }

});

function openConsole() {
    const consoleDiv = document.createElement("div");
    consoleDiv.id = "terminal-overlay";
    consoleDiv.style.cssText = `
        position:fixed; inset:0; background:black; color:#00ffcc;
        font-family:monospace; padding:60px; z-index:9999;
        text-shadow: 0 0 5px #00ffcc;
    `;

    const scanline = document.createElement("div");
    scanline.style.cssText = `
        position:absolute; inset:0; pointer-events:none;
        background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
        background-size: 100% 4px, 3px 100%; z-index: 10000;
    `;
    consoleDiv.appendChild(scanline);

    consoleDiv.innerHTML += `
        <div id="typer-text"></div>
        <div class="mt-10 opacity-50">[ESC] TO DISCONNECT_</div>
    `;
    document.body.appendChild(consoleDiv);

    const fullText = `> ACCESSING BIO... \n> AUTHORIZED. \n\nNAME: INGKLI BOJA \nROLE: FULL STACK / ML RESEARCHER \nSTATUS: AVAILABLE_FOR_HIRE \n\n"Building the neural bridge between .NET and Vision."`;
    
    let charIndex = 0;
    const type = () => {
        if (charIndex < fullText.length) {
            document.getElementById("typer-text").innerHTML += fullText.charAt(charIndex) === "\n" ? "<br>" : fullText.charAt(charIndex);
            charIndex++;
            setTimeout(type, 30);
        }
    };
    type();

    window.addEventListener("keydown", e => {
        if (e.key === "Escape") consoleDiv.remove();
    });
}

const konami = [
"arrowup","arrowup",
"arrowdown","arrowdown",
"arrowleft","arrowright",
"arrowleft","arrowright"
];

let konamiIndex = 0;

window.addEventListener("keydown", e => {

    if (e.key.toLowerCase() === konami[konamiIndex]) {

        konamiIndex++;

        if (konamiIndex === konami.length) {

            activateGodMode();

            konamiIndex = 0;
        }

    } else {

        konamiIndex = 0;

    }

});

function activateGodMode() {
    gsap.fromTo("body", 
        { filter: "invert(1) brightness(2)" }, 
        { filter: "invert(0) brightness(1)", duration: 0.4 }
    );

    starMat.color.setHex(0xFF0000);
    starMat.size = 6; 
    
    gsap.to(starMesh.scale, {
        x: 1.5,
        y: 1.5,
        z: 1.5,
        duration: 2,
        ease: "elastic.out(1, 0.3)"
    });

    lineMat.color.setHex(0xFF0000);
    lineMat.opacity = 0.4;

    console.log("GOD_MODE_ACTIVE: System Overclocked.");
}


fetch("https://api.github.com/users/ingli0/repos")
.then(res => res.json())
.then(repos => {

  const container = document.getElementById("github-projects");

  const filtered = repos
    .filter(repo => repo.description && repo.description.trim() !== "")

    .sort((a, b) => b.stargazers_count - a.stargazers_count)

    .slice(0, 3);

  filtered.forEach(repo => {

    const el = document.createElement("div");
    el.className = "glass-card p-6";

    el.innerHTML = `
      <h3 class="text-xl font-bold">${repo.name}</h3>

      <p class="opacity-50 text-sm">
        ${repo.description}
      </p>

      <div class="flex justify-between items-center mt-4">
        <span class="text-xs opacity-60">
          ⭐ ${repo.stargazers_count}
        </span>

        <a href="${repo.html_url}" target="_blank"
        class="text-xs inline-block border px-3 py-1">
          View Repo
        </a>
      </div>
    `;

    container.appendChild(el);

  });

});
 
 