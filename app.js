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

resizeCanvasToDisplaySize(gl.canvas);

console.log(`${gl.canvas.width}, ${gl.canvas.height} BLAH BLAH`);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

// Create a buffer for the square's positions.
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

const angle_delta = Math.PI/2

// hardcoded square... 

const SCALE = 0.25
const positions = [
	// triangle 1
	1.0, 1.0, 
	-1.0, 1.0, 
	1.0, -1.0, 
	// triangle 2
	1.0, 1.0, 
	1.0, -1.0, 
	-1.0, -1.0
];

// can scale from unit circle however we want?
for (let i = 0; i < positions.length; i++) {
	positions[i] = SCALE * positions[i]
}

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
console.log(positions)
gl.drawArrays(gl.TRIANGLE, 0, (positions.length)/numComponents)