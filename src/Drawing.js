const BRUSH_SIZE = 5;

class Drawing {
  constructor(canvas, imageBitmap) {
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const mouse = { x: 0, y: 0, right: false, left: false };
    const lastMouse = { x: 0, y: 0 };
    canvas.addEventListener("mousedown", (e) => {
      if (e.button == 0) {
        mouse.left = true;
      }
      if (e.button == 2) {
        mouse.right = true;
      }

      lastMouse.x = mouse.x;
      lastMouse.y = mouse.y;
    });

    canvas.addEventListener("mouseup", async (e) => {
      if (e.button == 0) {
        mouse.left = false;
      }
      if (e.button == 2) {
        mouse.right = false;
      }
    });

    canvas.addEventListener("mousemove", (e) => {
      const rect = event.target.getBoundingClientRect();
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;

      mouse.x = x;
      mouse.y = y;
    });
    canvas.addEventListener("contextmenu", (event) => event.preventDefault());

    this.canvas = canvas;
    this.mouse = mouse;
    this.lastMouse = lastMouse;
    this.imageBitmap = imageBitmap;

    const update = () => {
      requestAnimationFrame(update);

      const mouseDown = mouse.left || mouse.right;
      if (mouseDown) {
        const dx = lastMouse.x - mouse.x;
        const dy = lastMouse.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        for (let i = 0; i < dist / BRUSH_SIZE; i++) {
          const x = Math.cos(angle) * i * BRUSH_SIZE;
          const y = Math.sin(angle) * i * BRUSH_SIZE;
          this.draw(x + mouse.x, y + mouse.y);
        }

        if (dist < BRUSH_SIZE) {
          this.draw(mouse.x, mouse.y);
        }
      }

      lastMouse.x = mouse.x;
      lastMouse.y = mouse.y;
    };
    update();
  }

  draw(X, Y) {
    const ctx = this.canvas.getContext("2d");
    const sx = X;
    const sy = Y;
    const dx = sx;
    const dy = sy;

    const w = BRUSH_SIZE;
    const h = BRUSH_SIZE;

    if (this.mouse.left) {
      ctx.drawImage(this.imageBitmap, sx, sy, w, h, dx, dy, w, h);
    } else {
      ctx.fillStyle = "black";
      ctx.fillRect(sx, sy, w, h);
    }
  }
}

export default Drawing;
