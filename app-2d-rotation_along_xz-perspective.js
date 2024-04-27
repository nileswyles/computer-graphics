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

// wtf is this then? viewport transform???? 
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

////// After thinking about it? or some help? idk? GOD? 
/////	I think this is at least on the right track...

// position vector is 2d cross section of object from perspective defined by camera...

// start with some 3D representation of object...
// what makes a cube for instance?
// 6 square sides,
// [x00,y00,z00] ... [x53,y53,z53]
// 4 points per side, * 6 == 24 total points describing the cube in 3D space.

// now if I want to rotate about z-axis? (horizontally?) (xz-plane?) 
// you only rotate about a point right? but along an axis/plane?
//  
// rotating about a point causes all other points to change... 
// so, update all other points parallel to plane using the following rules...
// 		or actually, you update all of the components corresponding to plane?
		
// i.e. 
// 		xz-plane

//		z = Math.sin(angle)
// 		x = Math.cos(angle)

// that's it...?

// lol?, now you build the 2d cross section of object???

// grab "visible cross section"
//	how that's defined is TBD
//	how do we do this?
//		drop z?
//		that's interesting...
//		what does that mean for depth?
//		where do uniforms come into this? does that help with depth perception?
//			isn't it just another transformation on the data? let's that for now?
//		angles enough for depth perception? shadows? 
// 		it's getting complicated.... lol

// 
//////

//// Ideas for building 3D vertex vector...

// SPHERE
// build xy-plane starting z at 0.
// 	do rotation about origin along xz-plane at some infinitesimely small angle... we now have another plane, repeat until angle >= 360 + angle_delta.
//
//  hmmmm.. I am starting to think there's no universal function that builds a cube AND sphere (sphere adjacent)? in 3d space? wowzers
// 		lol special ed... special relativity
// how the fuck complex "polygons" (LOL) then?
//	do I even have all the tools to figure that out? maybe?

// remember primitive types but I think most common is triangle?

// CUBE
//	


// 0,0,0    2,0,0    2,2,0     0,2,0
const cube_side_1 = [ // xy-plane
	-1,-1,-1,
	1,-1,-1,
	1,1,-1,
	-1,1,-1
]
const cube_side_2 = [ // xy-plane but z maxed lol
	-1,-1,1,
	1,-1,1,
	1,1,1,
	-1,1,1
]

const create_plane_verticies = (angle_delta, scale_factor, plane_mask) => {
	var position = [0,0,0]
	var angle = 0
	var i = 3
// hmm.. on second thought, can I somehow just transform a standard xy_plane? to get other
	while (angle < 2*Math.PI + angle_delta) {
		// plane_mask_selects
		// yz plane vertices
		const x_y_component_tranformation = 0
		const x_y_angle = angle + x_y_component_tranformation
	
		position[i++] = scale_factor * Math.cos(x_y_angle) // X
		position[i++] =  -1 // Y
		position[i++] = scale_factor * Math.sin(x_y_angle) // Z	
		angle += angle_delta
	}
	return position
}

// hexagon
const angle_delta = Math.PI/2
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

const numComponents = 3; // pull out 3 values per iteration,
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

// Tell WebGL to use our program when drawing
gl.useProgram(program);

// circle with TRIANGLE_FAN primitive type...? compresses data a bit? 
var primitiveType = gl.TRIANGLE_FAN;
offset = 0;
console.log(positions)
var count = (positions.length)/numComponents / 2;
console.log(`COUNT ${count}, SHOULD == 7 for hexagon`)
var count = (positions.length)/numComponents / 2;
gl.drawArrays(primitiveType, count, count);


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
		//velocity_vector[1] = -velocity_vector[1]
	} else if (position_vector[0] > RIGHT_BOUNDS || position_vector[0] < LEFT_BOUNDS) { // left bounds // right bounds (x component negated -- around position)
		// this adjust direction of ball
		//velocity_vector[0] = -velocity_vector[0]
		// also adjust acceleration vector because "elasticity"
		//	acceleration (spring) depends on (is function of) what?, velocity
		
		// then "dot operation"??? to scale magnitude based on acceleration calculated...
		
		// but for now, assume no dampening (no change in acceleration)...
	} else {
		// 	else, per usual
		//velocity_vector = vecAdd(velocity_vector, acceleration_vector, 2)
	}
	requestAnimationFrame(tick)
}

requestAnimationFrame(tick)