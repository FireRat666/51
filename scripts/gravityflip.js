class GravityFlip {
  constructor() {
    this.isFlipping = false;
    this.originalGravity = { x: 0, y: -9.8, z: 0 }; // Default gravity
  }

  startFlip(rotationAxes, duration, rotations = 1) {
    if (!this.isFlipping) {
      if (rotationAxes.x === 0 && rotationAxes.y === 0 && rotationAxes.z === 0) { // Check if all rotationAxes components are 0
        console.error("Invalid rotation axis: All components are 0.");
        return;
      }
      this.performFlip(rotationAxes, duration, rotations); 
    }
  }

  async performFlip(rotationAxes, duration, rotations) {
    this.isFlipping = true;
    const rotationAxis = this.normalizeVector(rotationAxes); // Determine the axis of rotation based on input
    const totalRotation = 360 * rotations; // Total degrees for the specified number of flips
    const startTime = performance.now(); // Track elapsed time
    
    while (true) {
      const elapsedTime = performance.now() - startTime;
      if (elapsedTime >= duration * 1000) break;
      const angle = (elapsedTime / (duration * 1000)) * totalRotation; // Calculate the current rotation angle based on time progression
      const newGravity = this.rotateVector(this.originalGravity, rotationAxis, angle); // Calculate the new gravity direction by rotating the original vector
      this.applyGravity(newGravity); // Apply the new gravity (simulate applying gravity in your environment)
      await new Promise((resolve) => setTimeout(resolve, 16)); // Approx. 60 FPS
    }
    this.applyGravity(this.originalGravity); // Reset gravity to original direction
    this.isFlipping = false;
  }

  normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
    return {
      x: vector.x / magnitude,
      y: vector.y / magnitude,
      z: vector.z / magnitude,
    };
  }

  rotateVector(vector, axis, angle) {
    const rad = (Math.PI / 180) * angle;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
   
    return { // Rodrigues' rotation formula for vector rotation
      x: vector.x * cos + (axis.y * vector.z - axis.z * vector.y) * sin + axis.x * (axis.x * vector.x + axis.y * vector.y + axis.z * vector.z) * (1 - cos),
      y: vector.y * cos + (axis.z * vector.x - axis.x * vector.z) * sin + axis.y * (axis.x * vector.x + axis.y * vector.y + axis.z * vector.z) * (1 - cos),
      z: vector.z * cos + (axis.x * vector.y - axis.y * vector.x) * sin + axis.z * (axis.x * vector.x + axis.y * vector.y + axis.z * vector.z) * (1 - cos),
    };
  }

  applyGravity(gravity) {
    console.log(`Applying gravity: x=${gravity.x}, y=${gravity.y}, z=${gravity.z}`);
    BS.BanterScene.GetInstance().Gravity({x: gravity.x, y: gravity.y, z: gravity.z}, 0, true);
  }
}

// Example Usage
const gravityFlip = new GravityFlip();
gravityFlip.startFlip({ x: 1, y: 0, z: 0 }, 1.5); // Start a flip with 1.5 seconds duration

gravityFlip.startFlip({ x: 1, y: 0, z: 0 }, 1.5, 2); // Start a flip with 2 rotations and 1.5 seconds duration
