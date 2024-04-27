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
	attribute vec4 a_color;
	void main() {
	gl_FragColor = a_color;
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
	if (event.target.id === "ztransform") {
		draw(event.target.valueAsNumber, document.getElementById("zxangle").value)
		draw(document.getElementById("ztransform").value, 90 - document.getElementById("zxangle").value)
	} else if (event.target.id === "zxangle") { 
		draw(document.getElementById("ztransform").value, event.target.valueAsNumber)
		// draw other
		vec4(0.34, 1.0, 0.87, 1.0)
		draw(document.getElementById("ztransform").value, 90 - event.target.valueAsNumber)
	}
	document.getElementById("zxangle-label").textContent = document.getElementById("zxangle").value
	document.getElementById("ztransform-label").textContent = document.getElementById("ztransform").value
});

const draw_outline = () => {
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

const set_color = () => {
	const positionBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(outline_positions), gl.STATIC_DRAW)
}

const draw = (z, zxangle, color) => {
	gl.clearColor(0.0, 0.0, 0.0, 1.0)
	gl.clear(gl.STENCIL_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

	// hardcoded square... 
	//const positions = [
	//	// triangle 1
	//	1.0, 1.0, 
	//	-1.0, 1.0, 
	//	1.0, -1.0, 
	//	// triangle 2
	//	1.0, 1.0, 
	//	1.0, -1.0, 
	//	-1.0, -1.0
	//]
	const positions = [
		1.0, 1.0, 
		-1.0, 1.0, 
		1.0, -1.0,
		-1.0, -1.0
	]
	// 180 == Math.PI
	// 60 == in radians 60/180 * Math.PI
	// convert to radians

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
	var mins = [-1, -1]
	var maxs = [1, 1]
	
	// 
	// And so basically as an optimization, rotation matrix includes -z * Math.sin(angle) for every element...
	// 	then do vec addition in shader program?
	
	for (let i = 0; i < positions.length; i++) {
		// TODO:
		// tan function / arctan doing something interesting here... but because I don't have to scale by Z and just set to y component of that angle? that's interesting... look into why ... more pythagorean theorem/unit circle magic

		// TODO: just realized, perspective means y value changes too...
		// skip y components.
		if (i % 2 == 0) { // x component
			// get angle from perspective of camera
			// okay, so it looks like, this results in a range of -1 * delta_x --- 1 * delta_x (i.e. camera coordinates...)
			// scaled_x component - point in range 1 to -1
			var x_prime = positions[i] - z * Math.sin(zxangle)
			positions[i] = x_prime
			//mins[0] = Math.min(mins[0], x_prime)
			//maxs[0] = Math.max(maxs[0], x_prime)
		} else { // y component
			// adjust y along xy-plane? due to zx-rotation.
			var y_prime = positions[i] - z * Math.sin(zyangle)
			positions[i] = y_prime
			//mins[1] = Math.min(mins[1], y_prime)
			//maxs[1] = Math.max(maxs[1], y_prime)
			// get angle from perspective of camera
			//var y_prime = (z * Math.sin(zyangle)) - positions[i]
			//const range = 2
			// x value * scaled by 
			//const x_position_scaled = -positions[i - 1] 
			//const y_component = Math.sin(Math.PI/2 - zxangle)
			//console.log(`${x_position_scaled}, ${y_component} ${x_position_scaled * y_component/2}`)
			//positions[i] = positions[i] - (x_position_scaled * y_component)/2
			//mins[1] = Math.min(mins[1], y_prime)
			//maxs[1] = Math.max(maxs[1], y_prime)
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
	draw_outline()
}

draw(document.getElementById("ztransform").valueAsNumber, document.getElementById("zxangle").valueAsNumber)
