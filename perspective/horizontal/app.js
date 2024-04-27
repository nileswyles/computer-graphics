//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)
	
	// Create the shader program
	const shaderProgram = gl.createProgram()
	gl.attachShader(shaderProgram, vertexShader)
	gl.attachShader(shaderProgram, fragmentShader)
	gl.linkProgram(shaderProgram)
	
	// If creating the shader program failed, alert
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert(
			`Unable to initialize the shader program: ${gl.getProgramInfoLog(
				shaderProgram,
			)}`,
		)
		return null
	}
	return shaderProgram
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
	const shader = gl.createShader(type)
	
	// Send the source to the shader object
	gl.shaderSource(shader, source);
	
	// Compile the shader program
	gl.compileShader(shader)
	
	// See if it compiled successfully
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(
			`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
		)
		gl.deleteShader(shader)
		return null
	}
	return shader
}

const canvas = document.getElementById("canvas")

const gl = canvas.getContext("webgl")
if (gl === null) {
	alert("Unable to initialize WebGL. Checking your bearings.")
}

function resizeCanvasToDisplaySize(canvas) {
  // Lookup the size the browser is displaying the canvas in CSS pixels.
  const displayWidth  = canvas.clientWidth
  const displayHeight = canvas.clientHeight
  // Check if the canvas is not the same size.
  const needResize = canvas.width  !== displayWidth ||
                     canvas.height !== displayHeight
  if (needResize) {
    // Make the canvas the same size
    canvas.width  = displayWidth
    canvas.height = displayHeight
  }
  return needResize
}

// Vertex shader program
const vsSource = `
	attribute vec4 a_position;
	void main() {
	gl_Position = a_position;
	}
`
const fsSource = `
	void main() {
	gl_FragColor = vec4(0.34, 1.0, 0.87, 1.0);
	}
`
// Initialize a shader program this is where all the lighting
// for the vertices and so forth is established.
const program = initShaderProgram(gl, vsSource, fsSource)
// black canvas
gl.clearColor(0.0, 0.0, 0.0, 1.0)
gl.clear(gl.STENCIL_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
resizeCanvasToDisplaySize(gl.canvas)
console.log(`${gl.canvas.width}, ${gl.canvas.height} BLAH BLAH`)

// TODO: this here makes no sense...
gl.viewport(gl.canvas.width/2 - 250, gl.canvas.height/2 - 250, 500, 500)
// Tell WebGL to use our program when drawing
gl.useProgram(program)
// 
window.addEventListener("change", (event) => {
	console.log(event)
	if (event.target.id === "ztransform" || event.target.id === "zxangle") { 
		drawAll()
		document.getElementById("zxangle-label").textContent = document.getElementById("zxangle").value
		document.getElementById("ztransform-label").textContent = document.getElementById("ztransform").value
	}

})

const drawAll = (z, zxangle) => {
	draw(document.getElementById("ztransform").valueAsNumber, document.getElementById("zxangle").valueAsNumber)
	// draw other
	//vec4(0.34, 1.0, 0.87, 1.0)
	//draw(document.getElementById("ztransform").value, )
	drawOutline()
}

const drawOutline = () => {
	// LOL, how the hell? OPEN GL ?
	// TODO: still need to figure out the buffer/object coordinate thing
	const outline_positions = [
		1.0, 1.0, 
		-1.0, 1.0,
		1.0, 1.0, 
		1.0, -1.0,
		1.0, -1.0,
		-1.0, -1.0,
		-1.0, 1.0,
		-1.0, -1.0,
	]
	const positionBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(outline_positions), gl.STATIC_DRAW)
	const positionAttributeLocation = gl.getAttribLocation(program, "a_position")
	console.log("OUTLINE_POSITIONS")
	// the object coordinates make no sense, since not normalizing...
	const numComponents = 2
	gl.vertexAttribPointer(
		positionAttributeLocation,
		numComponents,
		gl.FLOAT,
		false, // don't normalize
		0,
		0, // how many bytes inside the buffer to start from
	)
	gl.enableVertexAttribArray(positionAttributeLocation)
	gl.drawArrays(gl.LINES, 0, (outline_positions.length)/numComponents)
}

const setColor = () => {
	const positionBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(outline_positions), gl.STATIC_DRAW)
}

const draw = (z, zxangle, color) => {
	gl.clearColor(0.0, 0.0, 0.0, 1.0)
	gl.clear(gl.STENCIL_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
	const positions = [
		1.0, 1.0, 
		-1.0, 1.0, 
		1.0, -1.0,
		-1.0, -1.0
	]
	// this will rotate about origin which is middle of shape, which might not be desired behaviour but let's see. Might need to shift 90 degrees?
	zxangle = zxangle/180 * Math.PI
	zyangle = 0
	console.log(`${z}, ${zxangle}`)
	// this is how you listen to events just for this element no?	
	// because vector attribute stuff isn't normalizing..
	const normalize = (min, max, value, new_min, new_max) => {
		const norm_per = (value - min)/(max - min)
		return (norm_per * (new_max - new_min)) + new_min
	}
	z = normalize(1.0, 1000.0, z, 1.0, 5.0)
	console.log(`z_normalized: ${z}`)
	// adjust z by zx angle
	z_primex = (z * Math.cos(zxangle))
	z_primey = (z * Math.cos(zyangle))

	// if z == 1 and angle 0, then 1 duh... 
	console.log(`z_primex: ${z_primex}, z_primey: ${z_primey}`)
	console.log(positions)
	
	const fov = 135
	const fov_rads = fov / 180 * Math.PI
	
	min = Math.sin(-fov_rads/2) * z
	max = Math.sin(fov_rads/2) * z
	// 
	// And so basically as an optimization, rotation matrix includes -z * Math.sin(angle) for every element...
	// 	then do vec addition in shader program?
	for (let i = 0; i < positions.length; i++) {
		if (i % 2 == 0) { // x component
			var x_prime = positions[i] - z * Math.sin(zxangle)
			positions[i] = normalize(min, max, x_prime, -1.0, 1.0)
			// I think this is more correct than what I had before, but since viewport stuff is not making much sense, can't say for sure...
			
			// Let's revisit from the beginning...
			// Z shift - only:
			// define field of view angle... let's set it to 135 degrees for now...
			// As Z increases, we want to scale
			//	get range of field of view on -1 to 1 coordinate plane 
			//		min = Math.sin(-fov/2) * z
			//		max = Math.sin(fov/2) * z
			
			//		TODO:
			//		this means, a fov of 90 deg and z = 1 is identity?
			//			y = sin(fov) * z =  1
			//			fov = arcsin(1/z) = 90 degrees
			//		fov of approx. 8 deg and z = 7 is also identity?
			
			// 	normalize data to that range... (while also cropping any x values outside of field of range?? - let's ignore that edge case for now... and assume fov and Z is large enough for 45 degree rotation)
						
			// now, if we rotate in horizontal (zx plane) we get a shift in x-component that's a function of the angle...			
			//	x = positions[i] - z * Math.sin(zxangle)
			//  positions[i] = normalize(min, max, x, -1.0, 1.0)
			
			// repeat for zy-plane, fov makes up a cone, so same normalization applies
		} else { // y component
			// adjust y along xy-plane? due to zx-rotation.
			var y_prime = positions[i] - z * Math.sin(zyangle)
			positions[i] = normalize(min, max, y_prime, -1.0, 1.0)
		}
	}
	console.log(positions)
	// Create a buffer for the square's positions.
	const positionBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
	const positionAttributeLocation = gl.getAttribLocation(program, "a_position")
	// TODO: the object coordinates make no sense, since not normalizing...
	const numComponents = 2
	gl.vertexAttribPointer(
		positionAttributeLocation,
		numComponents,
		gl.FLOAT,
		true, // normalization flag does nothing?
		0,
		0, // how many bytes inside the buffer to start from
	)
	gl.enableVertexAttribArray(positionAttributeLocation)
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, (positions.length)/numComponents)
}

drawAll()