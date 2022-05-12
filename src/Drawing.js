const BRUSH_SIZE = 5;

class Drawing {
  constructor(canvas, imageBitmap) {
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const mouse = { x: 0, y: 0, right: false, left: false };
    const lastMouse = { x: 0, y: 0 };
    const bbox = {minX: null, minY:null, maxX: null, maxY: null}

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
    this.bbox = bbox

    const update = () => {
      requestAnimationFrame(update);

      const mouseDown = mouse.left || mouse.right;
      if (mouseDown) {
        this.updateBounds()

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

  resetBounds() {
    this.bbox.minX = null;
    this.bbox.maxX = null;
    this.bbox.minY = null;
    this.bbox.maxY = null;

    this.lastMouse.x = 0;
    this.lastMouse.y = 0;
    this.mouse.x = 0;
    this.mouse.y = 0;
  }
  updateBounds() {
    const {bbox,mouse} = this;
    if (bbox.minX == null) {
      bbox.minX = mouse.x;
      bbox.maxX = mouse.x;

      bbox.minY = mouse.y;
      bbox.maxY = mouse.y;
    }
    bbox.minX = Math.min(bbox.minX, mouse.x)
    bbox.maxX = Math.max(bbox.maxX, mouse.x)

    bbox.minY = Math.min(bbox.minY, mouse.y)
    bbox.maxY = Math.max(bbox.maxY, mouse.y)
  }

  drawFull() {
    const canvas = this.canvas
    const ctx = this.canvas.getContext("2d");
    ctx.drawImage(this.imageBitmap, 0, 0, canvas.width, canvas.height)

    const bbox = this.bbox;
    bbox.minX = 0;
    bbox.maxX = canvas.width;

    bbox.minY = 0;
    bbox.maxY = canvas.height
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
