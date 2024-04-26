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
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

const drawShape = (angle_delta, scale_factor, origin) => {
	var position = origin
	var angle = 0
	var i = 2
	//console.log(`${position} scalefactor: ${scale_factor}`)
	while (angle < 2*Math.PI + angle_delta) {
		const a = Math.cos(angle)
		const b = Math.sin(angle)

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

// TODO: initialize to random number

// center point == 0,0
const BALL_RADIUS = 7

//const LEFT_BOUNDS = -canvas.width/2
//const RIGHT_BOUNDS = canvas.width/2
//const TOP_BOUNDS = canvas.height/2
//const BOTTOM_BOUNDS = -canvas.height/2

// TODO:
// 	ASPECT RATIO ADJUST

const LEFT_BOUNDS = 0
const RIGHT_BOUNDS = canvas.width
const TOP_BOUNDS = canvas.height
const BOTTOM_BOUNDS = 0

// i, j
var position_vector = [getRandomInRange(LEFT_BOUNDS + BALL_RADIUS, RIGHT_BOUNDS - BALL_RADIUS), getRandomInRange(BOTTOM_BOUNDS + BALL_RADIUS, TOP_BOUNDS - BALL_RADIUS)]
var velocity_vector = [7, 7]
// since we move in a straight line, this can probably be a single dimension until gravity is implemented... LOL
var acceleration_vector = [0, -1]
// position{t} = position{t-1} dot velocity{t-1} (element wise multiplication)
// velocity{t} = velocity{t - 1} + acceleration{t}

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

var stop = false
const tick = (t) => {
	//console.log(`${BOTTOM_BOUNDS}, ${TOP_BOUNDS}, ${LEFT_BOUNDS}, ${RIGHT_BOUNDS}, ${position_vector}, ${velocity_vector}`)
	drawFrame(position_vector)

	// bounds check,
	// 	if outside of bounds, adjust velocity and acceleration vectors accordingly
	if (position_vector[1] < BOTTOM_BOUNDS + BALL_RADIUS || position_vector[1] > TOP_BOUNDS - BALL_RADIUS) { // bottom bounds // top bounds (y component negated -- around position)
		velocity_vector[1] = -velocity_vector[1]
	} else if (position_vector[0] < LEFT_BOUNDS + BALL_RADIUS || position_vector[0] > RIGHT_BOUNDS - BALL_RADIUS) { // left bounds // right bounds (x component negated -- around position)
		// this adjust direction of ball
		velocity_vector[0] = -velocity_vector[0]
		stop = true
		// also adjust acceleration vector because "elasticity"
		//	acceleration (spring) depends on (is function of) what?, velocity
		
		// then "dot operation"??? to scale magnitude based on acceleration calculated...
		
		// but for now, assume no dampening (no change in acceleration)...
	} else {
		// 	else, per usual

		// lol
		velocity_vector = vecAdd(velocity_vector, acceleration_vector, 2)
	}
	position_vector = vecAdd(position_vector, velocity_vector, 2)
	requestAnimationFrame(tick)
}

//console.log(position_vector)
requestAnimationFrame(tick)