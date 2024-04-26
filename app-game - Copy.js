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

const drawShape = (angle_delta, scale_factor, origin) => {
	var position = origin
	var angle = 0
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

// because vector attribute stuff isn't normalizing..
const normalize = (min, max, value) => {
	const abs_min = Math.abs(min)
	const abs_max = Math.abs(max)
	
	const scaled_value = Math.abs(abs_min + value)
	const range = abs_min + abs_max

	const norm_per = scaled_value/range

	return (norm_per * 2) - 1 // because -1 to 1
}

const getRandomInRange = (min, max) => {
	return Math.random() * (max-min) + min
}

const WORLD = {
	bounds: {
		left: 0
		right: canvas.width
		
	},
	ball: {
		radius: 7
	},
	

}

// TODO: initialize to random number

// center point == 0,0
const BALL_RADIUS = 7

//const LEFT_BOUNDS = -canvas.width/2
//const RIGHT_BOUNDS = canvas.width/2
//const TOP_BOUNDS = canvas.height/2
//const BOTTOM_BOUNDS = -canvas.height/2

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

const LEFT_BOUNDS = 0
const RIGHT_BOUNDS = canvas.width
const TOP_BOUNDS = canvas.height
const BOTTOM_BOUNDS = 0

// i, j
var position_vector = [getRandomInRange(LEFT_BOUNDS + BALL_RADIUS, RIGHT_BOUNDS - BALL_RADIUS), getRandomInRange(BOTTOM_BOUNDS + BALL_RADIUS, TOP_BOUNDS - BALL_RADIUS)]
var velocity_vector = [0, 0]
// since we move in a straight line, this can probably be a single dimension until gravity is implemented... LOL
var acceleration_vector = [0, 0]
// position{t} = position{t-1} dot velocity{t-1} (element wise multiplication)
// velocity{t} = velocity{t - 1} + acceleration{t}

// TODO:
// obj that includes mag state and/or acceleration delta.
// 	that way removal/reset, somewhat easier.
var key_state = []

var down_mag = 1;
var up_mag = 1;
var left_mag = 1;
var right_mag = 1;

window.addEventListener(
  "keydown",
  (event) => {
    if (event.defaultPrevented) {
      return; // Do nothing if the event was already processed
    }

    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
      case "ArrowLeft":
      case "ArrowRight":
		if (key_state.find((element) => event.key === element) === undefined) {
			key_state.push(event.key)
		}
        break;
      default:
        return; // Quit when this doesn't handle the key event.
    }

	console.log(`keydown: ${key_state}`)

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
		acceleration_vector[1] = 0
		velocity_vector[1] = 0
		down_mag = 1
		break;
      case "ArrowUp":
		acceleration_vector[1] = 0
		velocity_vector[1] = 0
		up_mag = 1
		break;
      case "ArrowLeft":
		acceleration_vector[0] = 0
		velocity_vector[0] = 0
		left_mag = 1
		break;
      case "ArrowRight":
		acceleration_vector[0] = 0
		velocity_vector[0] = 0
		right_mag = 1
		break;
    }

    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
      case "ArrowLeft":
      case "ArrowRight":
		const new_key_state = []
		for (let i = 0; i < key_state.length; i++) {
			if (event.key !== key_state[i]) {
				new_key_state.push(key_state[i])
			}
		}
		key_state = Array.from(new_key_state) // copy? 
        break;
      default:
        return; // Quit when this doesn't handle the key event.
    }

	console.log(`keyup: ${key_state}`)

    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
  },
  false,
);

const vecAdd = (a, b, dims) => {
	let res = []
	for (let i = 0; i < dims; i++) {
		res[i] = a[i] + b[i]
	}
	return res
}

const drawFrame = (ball_position) => {
	// black canvas
	gl.clearColor(0.0, 0.0, 0.0, 1.0)
	gl.clear(gl.STENCIL_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

	const angle_delta = Math.PI/100

	const normalized_ball_position = [normalize(LEFT_BOUNDS, RIGHT_BOUNDS, ball_position[0]), normalize(BOTTOM_BOUNDS, TOP_BOUNDS, ball_position[1])]
	
	const positions = drawShape(angle_delta, BALL_RADIUS/100, normalized_ball_position)
	
	// Create a buffer for the square's positions.
	const positionBuffer = gl.createBuffer();

	// Select the positionBuffer as the one to apply buffer
	// operations to from here out.
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	// Now pass the list of positions into WebGL to build the
	// shape. We do this by creating a Float32Array from the
	// JavaScript array, then use it to fill the current buffer.
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
	
	// Tell WebGL to use our program when drawing
	gl.useProgram(program);
	
	var primitiveType = gl.TRIANGLE_FAN;
	var count = positions.length/numComponents;
	gl.drawArrays(primitiveType, 0, count);
}

var TICKS = 0

// TODO:
// 	define, different accel curves?

const tick = (t) => {
	//console.log(`${BOTTOM_BOUNDS}, ${TOP_BOUNDS}, ${LEFT_BOUNDS}, ${RIGHT_BOUNDS}, ${position_vector}, ${velocity_vector}`)
	drawFrame(position_vector)

	// check key state, to get direction... update acceleration vector 
	//	if up, acceleration vector == [0, 1] * ACCEL_MAG
	// 	if left, acceleration vector == [-1, 0] * ACCEL_MAG
	// 	if down, acceleration_vector == [0, -1] * ACCEL_MAG
	//  if right, acceleration_vector == [1, 0] * ACCEL_MAG
	if (TICKS++ === 2) {
		const acceleration_delta = [0, 0]
		for (let i = 0; i < key_state.length; i++) {
			switch (key_state[i]) {
			case "ArrowDown":
				// acceleration_delta[1] += -1 * down_mag++
				acceleration_delta[1] += -1
				break;
			case "ArrowUp":
				// acceleration_delta[1] += 1 * up_mag++
				acceleration_delta[1] += 1
				break;
			case "ArrowLeft":
				// acceleration_delta[0] += -1 * left_mag++
				acceleration_delta[0] += -1
				break;
			case "ArrowRight":
				// acceleration_delta[0] += 1 * right_mag++
				acceleration_delta[0] += 1
				break;
			}
		}
		acceleration_vector = vecAdd(acceleration_vector, acceleration_delta, 2)
		TICKS = 0
	}
	velocity_vector = vecAdd(velocity_vector, acceleration_vector, 2)
	position_vector = vecAdd(position_vector, velocity_vector, 2)

	// if out of bounds, set position to bounds
	// TODO:
	// 		expected behaviour is edge of circle on edge of screen, but not the case for some reason... scaling issue? 
	if (position_vector[1] < BOTTOM_BOUNDS + BALL_RADIUS) {
		position_vector[1] = BOTTOM_BOUNDS + BALL_RADIUS
	} else if (position_vector[1] > TOP_BOUNDS - BALL_RADIUS) {
		position_vector[1] = TOP_BOUNDS - BALL_RADIUS
	} else if (position_vector[0] < LEFT_BOUNDS + BALL_RADIUS) { 
		position_vector[0] = LEFT_BOUNDS + BALL_RADIUS
	} else if (position_vector[0] > RIGHT_BOUNDS - BALL_RADIUS) {
		position_vector[0] = RIGHT_BOUNDS - BALL_RADIUS
	} 
	requestAnimationFrame(tick)
}

//console.log(position_vector)
requestAnimationFrame(tick)