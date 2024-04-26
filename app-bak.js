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

//const vsSource = `
//	attribute vec4 a_position;
//	void main() {
//		a_position = vec4(1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0);
//		glBindBuffer(GL_ARRAY_BUFFER, a_position);
//		gl_Position = a_position;
//	}
//`;

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

// black canvas
gl.clearColor(0.0, 0.0, 0.0, 1.0)
gl.clear(gl.STENCIL_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

// TODO: color as param
const fieldOfView = (45 * Math.PI) / 180 // in radians
const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
const zNear = 0.1;
const zFar = 100.0;

console.log(`${gl.canvas.width}, ${gl.canvas.height} BLAH`);

resizeCanvasToDisplaySize(gl.canvas);

console.log(`${gl.canvas.width}, ${gl.canvas.height} BLAH BLAH`);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

// Create a buffer for the square's positions.
const positionBuffer = gl.createBuffer();

// Select the positionBuffer as the one to apply buffer
// operations to from here out.
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// Now create an array of positions for the square.

// TOP_RIGHT?, TOP_LEFT?, BOTTOM_RIGHT?, BOTTOM_LEFT?
// x, y? , x, y?
//
// (-1, 1) x x (1, 1)
// 		 x x x x
//       x x x x
// (-1,-1) x x (1,-1)

// Draws square, second triangle completes square when using TRIANGLE primitives?
// const positions = [
// 	// triangle 1
// 	1.0, 1.0, 
// 	-1.0, 1.0, 
// 	1.0, -1.0, 
// 	// triangle 2
// 	1.0, 1.0, 
// 	1.0, -1.0, 
// 	-1.0, -1.0
// ];

// Draws square, second triangle completes square when using TRIANGLE_STRIP primitives?
//onst positions = [
//	1.0, 1.0, 
//	-1.0, 1.0, 
//	1.0, -1.0,
//	-1.0, -1.0
//;

// Let's draw a hexagon using TRIANGLE_FAN
// x B x C x
// x x x x x
// G x A x D
// x x x x x
// x F x E x

// c^2 = a^2 + b^2 
// = 1 + 2 = 3 
// c = sqrt(3)
//const positions = [
//	0.0, 0.0, // CENTER point 
//	-0.5, 1.0, // B
//	0.5, 1.0, // C
//	0.0, 1.0, // D
//	0.5, -1.0, // E
//	-0.5, -1.0, // F
//	-1.0, 0.0, // G
//];

// how to draw equilateral?
//const triangle_side = 0.5

// centered at 0,0 
// VERTICES = 7 for hexagon

// generate list of angles....
// get x and y coordinates centered 0,0 using
// (cos(rads), sin(rads))
// done.. 
// then we can draw circles by making the change in angles infinitesimally small?

// pi == 180
// pi/3 = 60

// shape defined by change in angles...
// 	in other words, 60 degrees == hexagon?
// 	45 degrees = octagon? nice

// rads or degrees? that is the question...

// can this be moved or at least scaling be moved to GLSL might not be necessary...  
const draw_round_adjacent_shape = (angle_delta, scale_factor) => {
	var position = [0,0]
	var angle = 0
	var i = 2
	while (angle < 2*Math.PI + angle_delta) {
		console.log(angle/Math.PI * 180)
		// cos(angle) == x component
		// sin(angle) == y component
		position[i++] = scale_factor * Math.cos(angle)
		position[i++] = scale_factor * Math.sin(angle)
		angle += angle_delta
	}
	return position
}

// hexagon
//const angle_delta = Math.PI/2
const angle_delta = Math.PI/700
const positions = draw_round_adjacent_shape(angle_delta, 0.5)

// can scale from unit circle however we want?

//for (let i = 0; i < 7; i++) {
//	positions[i] = 0.75 * positions[i]
//}

// Now pass the list of positions into WebGL to build the
// shape. We do this by creating a Float32Array from the
// JavaScript array, then use it to fill the current buffer.
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

positionAttributeLocation = gl.getAttribLocation(program, "a_position")

//positionAttributeLocation = gl.getAttribLocation(program, "a_position")

const numComponents = 2; // pull out 2 values per iteration, // 2D space so 2 components?
const type = gl.FLOAT; // the data in the buffer is 32bit floats
const normalize = false; // don't normalize
const stride = 0; // how many bytes to get from one set of values to the next
// 0 = use type and numComponents above
var offset = 0; // how many bytes inside the buffer to start from
gl.vertexAttribPointer(
    positionAttributeLocation,
    numComponents,
    type,
    normalize,
    stride,
    offset,
 );
gl.enableVertexAttribArray(positionAttributeLocation);

// Tell WebGL how to pull out the positions from the position
// buffer into the vertexPosition attribute.
//setPositionAttribute(gl, buffers, programInfo);

// Tell WebGL to use our program when drawing
gl.useProgram(program);

// circle with TRIANGLE_FAN primitive type...? compresses data a bit? 
//var primitiveType = gl.TRIANGLE;
//var primitiveType = gl.TRIANGLE_STRIP;
//var primitiveType = gl.TRIANGLE_FAN;
var primitiveType = gl.TRIANGLE_FAN;
offset = 0;
//var count = 6;
//var count = 4;
console.log(positions)
var count = (positions.length)/2;
console.log(`COUNT ${count}, SHOULD == 7 for hexagon`)
gl.drawArrays(primitiveType, offset, count);

setTimeout(() => {
	// gl.clear(gl.COLOR_BUFFER_BIT)
	// let's just clear the shape drawn
	
	// TODO: 
	// once this figured out, add perspective (camera/viewport)... 
	// extend shape to 3D
	// redraw with background color????
	gl.clearBufferiv(gl.COLOR, gl.ARRAY_BUFFER, [0.0, 0.0, 0.0, 0.0]);
	console.log("STALLION")
	//gl.deleteBuffer(positionBuffer)
}, 5000)


const getRandomInRange = (min, max) => {
	return Math.random() * (max-min) + min
}
//
// 0.5 * (7 - 2) = 2.5 + 2 = 4.5

// TODO: initialize to random number
const BALL_RADIUS = 27

// is this necessary?
const LEFT_BOUNDS = BALL_RADIUS
const RIGHT_BOUNDS = 1024 - BALL_RADIUS
const TOP_BOUNDS = BALL_RADIUS
const BOTTOM_BOUNDS = 1024 - BALL_RADIUS
// i, j
var position_vector = [getRandomInRange(LEFT_BOUNDS, RIGHT_BOUNDS), getRandomInRange(TOP_BOUNDS, BOTTOM_BOUNDS)]
var velocity_vector = [0, 0]
// since we move in a straight line, this can probably be a single dimension until gravity is implemented... LOL
var acceleration_vector = [0, 0]
// position{t} = position{t-1} dot velocity{t-1} (element wise multiplication)
// velocity{t} = velocity{t - 1} + acceleration{t}

//
const vecAdd = (a, b, dims) => {
	let res = []
	for (let i = 0; i < dims; i++) {
		res[i] = a[i] + b[i]
	}
	return res
}

const tick = (t) => {
	position_vector = vecAdd(position_vector, velocity_vector, 2)
	
	// bounds check,
	// 	if outside of bounds, adjust velocity and acceleration vectors accordingly
	if (position_vector[1] > BOTTOM_BOUNDS || position_vector[1] < TOP_BOUNDS) { // bottom bounds // top bounds (y component negated -- around position)
		velocity_vector[1] = -velocity_vector[1]
	} else if (position_vector[0] > RIGHT_BOUNDS || position_vector[0] < LEFT_BOUNDS) { // left bounds // right bounds (x component negated -- around position)
		// this adjust direction of ball
		velocity_vector[0] = -velocity_vector[0]
		// also adjust acceleration vector because "elasticity"
		//	acceleration (spring) depends on (is function of) what?, velocity
		
		// then "dot operation"??? to scale magnitude based on acceleration calculated...
		
		// but for now, assume no dampening (no change in acceleration)...
	} else {
		// 	else, per usual
		velocity_vector = vecAdd(velocity_vector, acceleration_vector, 2)
	}
	requestAnimationFrame(tick)
}

requestAnimationFrame(tick)