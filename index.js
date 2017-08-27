const Victor = require('victor');
const chance = require('chance')();


const canvasWidth = 500

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var cw = canvas.width;
var ch = canvas.height;
var id = ctx.getImageData(0, 0, 500, 500);

ctx.clearRect(0, 0, cw, ch);

class Particle {
  constructor(position, displacement) {
    // t in milliseconds. 1000ms == 1s
    this.lastUpdated = Date.now();
    this.createdAt = this.lastUpdated;
    // Previous sum of the last vectors including the start position
    this.position = position;
    // Current displacement vector. Unit vector. Will be multiplied by t. 
    // Then summed to the possition
    this.displacement = displacement;
    this.maxLife = 1000 * 2;
  }

  active() {
    if ((Date.now() - this.createdAt) < this.maxLife) {
      return true;
    } else {
      return false;
    }
  }

  destroy() {
    ctx.fillStyle="white";
    ctx.fillRect(this.position.x, this.position.y, 1, 1);
  }

  // Will add mouse vector to the step fuction
  step() {
    // Sets an initial speed of 1px per ms
    const t = (Date.now() - this.lastUpdated);

    // Add Gravity vectory
    this.displacement.add(Victor(0, 0.01))

    const new_position = Victor(0, 0)
      .add(this.position)
      .add(this.displacement.clone().multiplyScalar(t))
      .unfloat();

    // Overwrite with a white pixel
    ctx.fillStyle="white";
    ctx.fillRect(this.position.x, this.position.y, 1, 1);
    // Draw a blue pixel
    ctx.fillStyle="blue";
    ctx.fillRect(new_position.x, new_position.y, 1, 1);

    this.position = new_position;
    this.lastUpdated = Date.now()
  }
}

particles = []

function createParticles (x, y) {
  for (var i = 0; i < 100; i++) {
    // Starting pos randomly at the top of the canvas
    starting_position = Victor(
        x + (10 * Math.sin(chance.floating({min: 0, max: 2 * Math.PI}))),
        y + (10 * Math.cos(chance.floating({min: 0, max: 2 * Math.PI})))
    )

    // The initial direction of the particle
    initial_displacement = Victor(
        chance.floating({min: -0.1, max: 0.1}),
        chance.floating({min: -0.2, max: -0})
    )

    particle = new Particle(starting_position, initial_displacement);

    particles.push(particle);
  }
}

var framesPerSecond = 40;

function animate() {
    setTimeout(function() {
        requestAnimationFrame(animate);

        particles.forEach(p => p.step())
        particles.filter(p => p.active() != true).forEach(p => p.destroy())
        particles = particles.filter(p => p.active() == true)

    }, 1000 / framesPerSecond);
}

canvas.addEventListener('click', onClick, false)

function onClick(e) {
    var element = canvas;
    var offsetX = 0, offsetY = 0

        if (element.offsetParent) {
      do {
        offsetX += element.offsetLeft;
        offsetY += element.offsetTop;
      } while ((element = element.offsetParent));
    }

    x = e.pageX - offsetX;
    y = e.pageY - offsetY;

    createParticles(x, y);
}

animate();
