// UTILS

const vecAdd = (a, b, dims) => {
	let res = []
	for (let i = 0; i < dims; i++) {
		res[i] = a[i] + b[i]
	}
	return res
}

// because vector attribute stuff isn't normalizing..
const normalize = (min, max, value) => {
	const norm_per = (value - min)/(max - min)
	return (norm_per * 2) - 1 // because -1 to 1
}

const getRandomInRange = (min, max) => {
	return Math.random() * (max-min) + min
}

// WEBGL

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
	
	// Create the shader program
	
	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
	
	// If creating the shader program failed, alert
	
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert(
			`Unable to initialize the shader program: ${gl.getProgramInfoLog(
				shaderProgram,
			)}`,
		);
		return null;
	}
	
	return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
	const shader = gl.createShader(type);
	
	// Send the source to the shader object
	
	gl.shaderSource(shader, source);
	
	// Compile the shader program
	
	gl.compileShader(shader);
	
	// See if it compiled successfully
	
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(
			`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
		);
		gl.deleteShader(shader);
		return null;
	}
	
	return shader;
}

const canvas = document.getElementById("canvas")

const gl = canvas.getContext("webgl2")
if (gl === null) {
	alert("Unable to initialize WebGL. Checking your bearings.")
}
	
// Vertex shader program
const vsSource = `
	attribute vec4 a_position;
	void main() {
	gl_Position = a_position;
	}
`;

function resizeCanvasToDisplaySize(canvas) {
  // Lookup the size the browser is displaying the canvas in CSS pixels.
  const displayWidth  = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;
 
  // Check if the canvas is not the same size.
  const needResize = canvas.width  !== displayWidth ||
                     canvas.height !== displayHeight;
 
  if (needResize) {
    // Make the canvas the same size
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }
 
  return needResize;
}

const fsSource = `
	void main() {
	gl_FragColor = vec4(0.34, 1.0, 0.87, 1.0);
	}
`;
// Initialize a shader program; this is where all the lighting
// for the vertices and so forth is established.
const program = initShaderProgram(gl, vsSource, fsSource);

console.log(`${gl.canvas.width}, ${gl.canvas.height} BLAH`);

console.log(`${window.innerWidth}, ${window.innerHeight}`)

//canvas.clientWidth = window.innerWidth
//canvas.clientHeight = window.innerHeight
//
//canvas.style = `height: ${window.innerHeight - 27}px; width: ${window.innerWidth - 27}px` // because scrollbar

resizeCanvasToDisplaySize(gl.canvas);
console.log(`${gl.canvas.width}, ${gl.canvas.height} BLAH BLAH`);
gl.viewport(0, 0, canvas.width, canvas.height);

// DRAW

const drawShape = (angle_delta, scale_factor, origin) => {
	var position = origin
	var angle = 0
	// TODO: global dims variable?
	var i = 2
	//console.log(`${position} scalefactor: ${scale_factor}`)
	while (angle < 2*Math.PI + angle_delta) {
		position[i++] = origin[0] + (scale_factor * Math.cos(angle))
		position[i++] = origin[1] + (scale_factor * Math.sin(angle))
		//console.log(`${origin[0]},${origin[1]} - ${position[i - 2]}, ${position[i-1]}`)
		angle += angle_delta
	}
	return position
}

const drawFrame = () => {
	gl.clearColor(0.0, 0.0, 0.0, 1.0)
	gl.clear(gl.STENCIL_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

	const normalized_ball_position = [normalize(WORLD.bound.left, WORLD.bound.right, WORLD.ball.position[0]), normalize(WORLD.bound.bottom, WORLD.bound.top, WORLD.ball.position[1])]
	const positions = drawShape(Math.PI/100, WORLD.ball.radius/100, normalized_ball_position)
	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
	positionAttributeLocation = gl.getAttribLocation(program, "a_position")
	const numComponents = 2; // pull out 2 values per iteration, // 2D space so 2 components?
	const type = gl.FLOAT; // the data in the buffer is 32bit floats
	const stride = 0; // how many bytes to get from one set of values to the next
	// 0 = use type and numComponents above
	gl.vertexAttribPointer(
		positionAttributeLocation,
		numComponents,
		type,
		false, // don't normalize
		stride,
		0, // how many bytes inside the buffer to start from
	);
	gl.enableVertexAttribArray(positionAttributeLocation);
	gl.useProgram(program);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, positions.length/numComponents);
}

// GLOBAL STATE

const WORLD = {
	//const WORLD.bound.left = -canvas.width/2
	//const WORLD.bound.right = canvas.width/2
	//const WORLD.bound.top = canvas.height/2
	//const WORLD.bound.bottom = -canvas.height/2
	bound: {
		// TODO: global dims variable? group bounds by axis?
		left: 0,
		right: canvas.width,
		top: canvas.height,
		bottom: 0
	},
	ball: {
		radius: 7,
		velocity: [0, 0],
		acceleration: [0, 0]
	},
	// example element
	// "ArrowDown": [x, y] // acceleration vector 
	key: {},
}
// lol... because relies on other WORLD state.
// TODO: maybe use a class or init function to 'encapsulate' this better???
WORLD.ball.position = [getRandomInRange(WORLD.bound.left + WORLD.ball.radius, WORLD.bound.right - WORLD.ball.radius), getRandomInRange(WORLD.bound.bottom + WORLD.ball.radius, WORLD.bound.top - WORLD.ball.radius)]

// TODO:
// 	ASPECT RATIO ADJUST
// 		/

// * * * * * *
// * . . . . *
// * . . . . *
// * * * * * *

// what exactly is the problem?
// 	shape being created in square coordinate system?
//	but canvas is rectangular?
//	so, it get's stretched?

//	solution? ==
//		independent vertical and horizontal scaling factors?

// also (similarly?), try leveraging the normalization functionality opengl provides, and use a integer - based coordinate system instead of floating point?

// KEY EVENTS

window.addEventListener(
  "keydown",
  (event) => {
    if (event.defaultPrevented) {
      return; // Do nothing if the event was already processed
    }
    switch (event.key) {
      case "ArrowDown":
		if (WORLD.key[event.key] === undefined) {
			WORLD.key[event.key] = [0,-1]
		}
        break;
      case "ArrowUp":
		if (WORLD.key[event.key] === undefined) {
			WORLD.key[event.key] = [0,1]
		}
        break;
      case "ArrowLeft":
		if (WORLD.key[event.key] === undefined) {
			WORLD.key[event.key] = [-1,0]
		}
        break;
      case "ArrowRight":
		if (WORLD.key[event.key] === undefined) {
			WORLD.key[event.key] = [1,0]
		}
        break;
      default:
        return; // Quit when this doesn't handle the key event.
    }
	console.log(`keydown: ${WORLD.key}`)
    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
  },
  false,
);

window.addEventListener(
  "keyup",
  (event) => {
    if (event.defaultPrevented) {
      return; // Do nothing if the event was already processed
    }
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
		WORLD.ball.acceleration[1] = 0
		WORLD.ball.velocity[1] = 0
		break;
      case "ArrowLeft":
      case "ArrowRight":
		WORLD.ball.acceleration[0] = 0
		WORLD.ball.velocity[0] = 0
		break;
    }
	delete WORLD.key[event.key];
	console.log(`keyup: ${WORLD.key}`)
    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
  },
  false,
);

// FRAME LOOP

var TICKS = 0
const tick = (t) => {
	//console.log(`${WORLD.bound.bottom}, ${WORLD.bound.top}, ${WORLD.bound.left}, ${WORLD.bound.right}, ${position_vector}, ${WORLD.ball.velocity}`)
	
	// TODO: 
	// pass state by value instead of global variable?
	drawFrame(WORLD.ball.position)

	// check key state, to get direction... update acceleration vector 
	//	if up, acceleration vector == [0, 1] * ACCEL_MAG
	// 	if left, acceleration vector == [-1, 0] * ACCEL_MAG
	// 	if down, WORLD.ball.acceleration == [0, -1] * ACCEL_MAG
	//  if right, WORLD.ball.acceleration == [1, 0] * ACCEL_MAG
	if (TICKS++ === 2) {
		const acceleration_delta = [0,0]
		for (const [key, acceleration] of Object.entries(WORLD.key)) {
			acceleration_delta[0] += acceleration[0]
			acceleration_delta[1] += acceleration[1]
			// TODO:
			// 	define, different accel curves?
			//  requires updating the global per-key acceleration vector?
		}
		// TODO: global dims variable?
		WORLD.ball.acceleration = vecAdd(WORLD.ball.acceleration, acceleration_delta, 2)
		TICKS = 0
	}
	// TODO: global dims variable?
	WORLD.ball.velocity = vecAdd(WORLD.ball.velocity, WORLD.ball.acceleration, 2)
	WORLD.ball.position = vecAdd(WORLD.ball.position, WORLD.ball.velocity, 2)
	// if out of bounds, set position to bounds
	// TODO:
	// 		expected behaviour is edge of circle on edge of screen, but not the case for some reason... scaling issue? 
	if (WORLD.ball.position[1] < WORLD.bound.bottom + WORLD.ball.radius) {
		WORLD.ball.position[1] = WORLD.bound.bottom + WORLD.ball.radius
	} else if (WORLD.ball.position[1] > WORLD.bound.top - WORLD.ball.radius) {
		WORLD.ball.position[1] = WORLD.bound.top - WORLD.ball.radius
	} else if (WORLD.ball.position[0] < WORLD.bound.left + WORLD.ball.radius) { 
		WORLD.ball.position[0] = WORLD.bound.left + WORLD.ball.radius
	} else if (WORLD.ball.position[0] > WORLD.bound.right - WORLD.ball.radius) {
		WORLD.ball.position[0] = WORLD.bound.right - WORLD.ball.radius
	} 
	requestAnimationFrame(tick)
}

//console.log(position_vector)
requestAnimationFrame(tick)