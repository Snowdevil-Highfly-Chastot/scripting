document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // CONFIGURATION VARIABLES
  // ==========================================
  
  const TOTAL_OBJECTS = 40; // Total number of items on screen
  const ANIMATION_DURATION_MS = 6000; // Time before dropping the platform
  const TEXT_UPDATE_INTERVAL_MS = 2000; // How often the loading text changes
  
  const LOADING_MESSAGES = [
    "Initializing parameters...",
    "Compiling HTML and CSS...",
    "Waking up the hamsters...",
    "Applying Bootstrap grid...",
    "Ready for launch."
  ];

  // Key-value pair configuration for objects
  const OBJECT_TYPES = [
    {
      id: "code_symbols",
      percentage: 40, // 40% of total objects
      size: "2rem",
      colors: ["#00ffcc", "#ffffff", "#ff007f"],
      gravity: 0.15,
      bounce: 0.6,
      geometryClass: "shape-code"
    },
    {
      id: "sheets_icon",
      percentage: 30, // 30% of total objects
      size: "1.5rem",
      colors: ["#0f9d58", "#4285f4"],
      gravity: 0.25,
      bounce: 0.4,
      geometryClass: "shape-sheet"
    },
    {
      id: "space_invader",
      percentage: 30, // 30% of total objects
      size: "15px", // Base size for em-based box-shadow
      colors: ["#ff00ff", "#00ffff", "#ffff00"],
      gravity: 0.1,
      bounce: 0.75,
      geometryClass: "shape-invader"
    }
  ];

  // ==========================================
  // INITIALIZATION & STATE
  // ==========================================

  const container = document.getElementById("objects-container");
  const platformEl = document.getElementById("platform");
  const textEl = document.getElementById("loading-text");
  
  let isExiting = false;
  let activeObjects = [];
  
  // Platform bounds & state
  let platW = window.innerWidth * 0.3; // Platform is 30% of screen width
  if (platW < 200) platW = 200; // Min width
  let platH = 20;
  
  let platformState = {
    x: (window.innerWidth / 2) - (platW / 2),
    y: window.innerHeight * 0.6, // 60% down the screen
    vy: 0,
    gravity: 0.4
  };

  // Text bounds & state
  let textState = {
    y: window.innerHeight * 0.75, // Below platform
    vy: 0,
    gravity: 0.3
  };

  // Set initial styles
  platformEl.style.width = platW + "px";
  platformEl.style.height = platH + "px";
  platformEl.style.left = platformState.x + "px";
  platformEl.style.top = platformState.y + "px";
  textEl.style.top = textState.y + "px";

  // Generate Objects based on percentages
  OBJECT_TYPES.forEach(type => {
    let count = Math.floor(TOTAL_OBJECTS * (type.percentage / 100));
    for (let i = 0; i < count; i++) {
      createObject(type);
    }
  });

function createObject(config) {
    const el = document.createElement("div");
    el.classList.add("physics-object", config.geometryClass);
    el.style.fontSize = config.size;
    
    // Pick random color from array
    const color = config.colors[Math.floor(Math.random() * config.colors.length)];
    el.style.color = color;

    // Calculate spawn area (10% wider than platform -> 5% overhang on each side)
    const spawnWidth = platW * 1.10; 
    const spawnStartX = platformState.x - (platW * 0.05);

    // Append first to calculate exact rendered dimensions
    container.appendChild(el);
    const rect = el.getBoundingClientRect();
    const actualWidth = rect.width > 0 ? rect.width : 30;
    const actualHeight = rect.height > 0 ? rect.height : 30;

    // Initial physics state
    const state = {
      el: el,
      x: spawnStartX + (Math.random() * spawnWidth),
      y: -50 - (Math.random() * 500), 
      vx: (Math.random() - 0.5) * 1, 
      vy: 0,
      rot: Math.random() * 360,
      vrot: (Math.random() - 0.5) * 5,
      gravity: config.gravity,
      bounce: config.bounce,
      w: actualWidth,  // Dynamic exact width
      h: actualHeight  // Dynamic exact height
    };

    activeObjects.push(state);
  }

  // ==========================================
  // TEXT ROTATION LOGIC
  // ==========================================
  let msgIndex = 0;
  const textInterval = setInterval(() => {
    msgIndex = (msgIndex + 1) % LOADING_MESSAGES.length;
    textEl.innerText = LOADING_MESSAGES[msgIndex];
  }, TEXT_UPDATE_INTERVAL_MS);

  // ==========================================
  // EXIT TRANSITION LOGIC
  // ==========================================
  setTimeout(() => {
    isExiting = true;
    clearInterval(textInterval);
    
    // Fade out background, fade in website
    document.getElementById("loader-overlay").classList.add("fade-out");
    document.getElementById("main-content").classList.add("visible");
    document.body.style.overflow = "auto"; // Restore scrolling
    
  }, ANIMATION_DURATION_MS);

  // ==========================================
  // PHYSICS RENDER LOOP
  // ==========================================
  function renderLoop() {
    // 1. Update Platform & Text if exiting
    if (isExiting) {
      platformState.vy += platformState.gravity;
      platformState.y += platformState.vy;
      platformEl.style.top = platformState.y + "px";

      textState.vy += textState.gravity;
      textState.y += textState.vy;
      textEl.style.top = textState.y + "px";
    }

    // 2. Update Objects
    activeObjects.forEach(obj => {
      // Apply gravity
      obj.vy += obj.gravity;
      obj.x += obj.vx;
      obj.y += obj.vy;
      obj.rot += obj.vrot;

      // Platform Collision Detection (Only if not exiting)
      if (!isExiting) {
        
        // Calculate the center of the object to prevent "edge hanging"
        let objCenterX = obj.x + (obj.w / 2);

        // Strict Center-of-Gravity Collision
        if (
          obj.y + obj.h >= platformState.y && 
          obj.y <= platformState.y + platH &&
          objCenterX >= platformState.x && 
          objCenterX <= platformState.x + platW
        ) {
          // Snap to top of platform
          obj.y = platformState.y - obj.h;
          
          // Reverse velocity with bounce factor
          obj.vy = -obj.vy * obj.bounce;
          
          // Tumbling effect on hit
          obj.vrot = (Math.random() - 0.5) * 15;

          // Push them slightly outward so they eventually fall off the edges
          let centerPlatform = platformState.x + (platW / 2);
          if (objCenterX < centerPlatform) {
            obj.vx -= 0.1; // Push left
          } else {
            obj.vx += 0.1; // Push right
          }
        }
      }

      // Apply transform
      obj.el.style.transform = `translate(${obj.x}px, ${obj.y}px) rotate(${obj.rot}deg)`;
    });

    requestAnimationFrame(renderLoop);
  }

  // Start Loop
  requestAnimationFrame(renderLoop);
});