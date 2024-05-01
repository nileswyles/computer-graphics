// Data structures
const OPPOSITE_COLOR = [0.34, 1.0, 0.87, 1.0]
const cube = {
	unit_dimensions: [-1.0, 1.0],
	// parallel to XY-plane
	FRONT: {
		color: [0.777, 0.214, 0.820, 1.0],
		// X == -1 - 1 (LEFT - RIGHT)
		// Y == -1 - 1 (BOTTOM - TOP)
		// Z == -1 - 1 (BACK - FRONT)
		positions: [
			-1.0, 1.0, 1.0,		// TOP LEFT
			1.0, 1.0,  1.0,		// TOP RIGHT
			-1.0, -1.0, 1.0,		// BOTTOM LEFT

			1.0, 1.0,   1.0,		// TOP RIGHT
			1.0, -1.0,  1.0,		// BOTTOM RIGHT
			-1.0, -1.0, 1.0 	// BOTTOM LEFT
		]
	},
	BACK: {
		color: [0.777, 0.901, 0.820, 1.0],
		// X == -1 - 1 (LEFT - RIGHT)
		// Y == -1 - 1 (BOTTOM - TOP)
		// Z == -1 - 1 (BACK - FRONT)
		positions: [
			-1.0, 1.0, -1.0,		// TOP LEFT
			1.0, 1.0, -1.0,		// TOP RIGHT
			-1.0, -1.0, -1.0,	// BOTTOM LEFT

			1.0, 1.0, -1.0,		// TOP RIGHT
			1.0, -1.0, -1.0,		// BOTTOM RIGHT
			-1.0, -1.0, -1.0 	// BOTTOM LEFT
		]
	},
	
	// parallel to YZ-plane
	LEFT: {
		color: [0.27, 0.5, 0.37, 1.0],
		// X == -1 - 1 (LEFT - RIGHT)
		// Y == -1 - 1 (BOTTOM - TOP)
		// Z == -1 - 1 (BACK - FRONT)
		positions: [
			-1.0, -1.0, 1.0,		
			-1.0, 1.0, 1.0,	
			-1.0, -1.0, -1.0,		

			-1.0, 1.0, 1.0,	
			-1.0, 1.0, -1.0,	
			-1.0, -1.0, -1.0	
		]
	},
	RIGHT: {
		color: [0.60, 1.0, 0.7, 1.0],
		positions: [
			1.0, -1.0, 1.0,		
			1.0, 1.0, 1.0,	
			1.0, -1.0, -1.0,

			1.0, 1.0, 1.0,	
			1.0, 1.0, -1.0,		
			1.0, -1.0, -1.0 
		]
	},
	
	// parallel to XZ-plane
	
	BOTTOM: {
		// X == -1 - 1 (LEFT - RIGHT)
		// Y == -1 - 1 (BOTTOM - TOP)
		// Z == -1 - 1 (BACK - FRONT)
		color: [0.09, 0.28, 0.81, 1.0],
		positions: [
			-1.0, -1.0, 1.0,	
			1.0, -1.0, 1.0,	
			-1.0, -1.0, -1.0,	

			1.0, -1.0, 1.0,	
			1.0, -1.0, -1.0,
			-1.0, -1.0, -1.0 	
		]
	},
	TOP: {
		color: [0.49, 0.58, 0.69, 1.0],
		positions: [
			-1.0, 1.0, 1.0,	
			1.0, 1.0, 1.0,	
			-1.0, 1.0, -1.0,	

			1.0, 1.0, 1.0,	
			1.0, 1.0, -1.0,
			-1.0, 1.0, -1.0 
		]
	}
}

// Vertex shader program

// uniform? because not really varying? 
// LOL gross
const vsSource = `
	attribute vec4 a_position;
	attribute vec4 lol;
	
	varying highp vec4 vColor;

	void main() {
	gl_Position = a_position;
	vColor = lol;
	}
`
const fsSource = `
	in vColor;
	void main() {
	gl_FragColor = vColor; 
	}
`;

const normalize = (min, max, value, new_min, new_max) => {
	const norm_per = (value - min)/(max - min)
	return (norm_per * (new_max - new_min)) + new_min
}
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
const gl = canvas.getContext("webgl2")
if (gl === null) {
	alert("Unable to initialize WebGL. Checking your bearings.")
}
console.log(gl.drawingBufferColorSpace)

// black canvas
gl.clearColor(0.0, 0.0, 0.0, 1.0)
gl.clear(gl.STENCIL_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
resizeCanvasToDisplaySize(gl.canvas)
console.log(`${gl.canvas.width}, ${gl.canvas.height} BLAH BLAH`)

// TODO: this here makes no sense...
gl.viewport(gl.canvas.width/2 - 250, gl.canvas.height/2 - 250, 500, 500)

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

// Initialize a shader program this is where all the lighting
// for the vertices and so forth is established.
const program = initShaderProgram(gl, vsSource, fsSource)

const handleDrawEvent = (object) => {
	document.getElementById("zxangle-label").textContent = document.getElementById("zxangle").value
	document.getElementById("zyangle-label").textContent = document.getElementById("zyangle").value
	document.getElementById("ztransform-label").textContent = document.getElementById("ztransform").value
	
	gl.clearColor(0.0, 0.0, 0.0, 1.0)
	gl.clear(gl.STENCIL_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
	
	gl.useProgram(program)
	draw(object, document.getElementById("ztransform").valueAsNumber, document.getElementById("zxangle").valueAsNumber, document.getElementById("zyangle").valueAsNumber, program)
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

// TODO: clean up args...
const setColor = (pg, color) => {
	// TODO: create beforehand
	const buffer = gl.createBuffer()
	const colorAttributeLocation = gl.getAttribLocation(pg, "lol")
	
	const numComponents = 4;
	const type = gl.FLOAT;
	const normalize = false;
	const stride = 0;
	const offset = 0;
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(
		colorAttributeLocation,
		numComponents,
		type,
		normalize,
		stride,
		offset
	);
	gl.enableVertexAttribArray(colorAttributeLocation);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW)
	// There must be a better way than passing this through the vertex shader program. Can we pass data directly to fragment shader?
	//gl.deleteBuffer(buffer);
}

const drawSurface = (pg, surface) => {
	setColor(pg, surface.color)
	
	console.log("drawing surface...")
	
	const positionBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(surface.positions), gl.STATIC_DRAW)
	const positionAttributeLocation = gl.getAttribLocation(pg, "a_position")
	// TODO: the object coordinates make no sense, since not normalizing...
	const numComponents = 3
	gl.vertexAttribPointer(
		positionAttributeLocation,
		numComponents,
		gl.FLOAT,
		false, // normalization flag does nothing?
		0,
		0, // how many bytes inside the buffer to start from
	)
	gl.enableVertexAttribArray(positionAttributeLocation)
	gl.drawArrays(gl.TRIANGLES, 0, (surface.positions.length)/numComponents)
	
	// cleanup
	gl.deleteBuffer(positionBuffer)
}

const draw = (object, z, zxangle, zyangle, pg) => {	
	zxangle = zxangle/180 * Math.PI
	zyangle = zyangle/180 * Math.PI
	
	console.log(`${z}, zxangle: ${zxangle}, zyangle: ${zyangle}`)
	// this is how you listen to events just for this element no?	
	// because vector attribute stuff isn't normalizing..
	z = normalize(1.0, 1000.0, z, 1.0, 5.0)
	console.log(`z_normalized: ${z}`)
	// adjust z by zx angle
	z_primex = (z * Math.cos(zxangle))
	z_primey = (z * Math.cos(zyangle))
	
	// if z == 1 and angle 0, then 1 duh... 
	console.log(`z_primex: ${z_primex}, z_primey: ${z_primey}`)
	
	const fov = 180
	const fov_rads = fov / 180 * Math.PI
	const fov_range = [Math.sin(-fov_rads/2) * z, Math.sin(fov_rads/2) * z]
	console.log(`fov: ${fov}, min: ${fov_range[0]}, max: ${fov_range[1]}`)
	
	for (const [LABEL, SURFACE] of Object.entries(object)) {
		console.log(SURFACE)
		const surface_in_view = { color: SURFACE.color, positions: [] }
		
		let i = 0;
		while (i < SURFACE.positions.length) {			
			// because 3 dims
			const vertex = SURFACE.positions.slice(i, i + 3)
			i += 3 
			// NO ROLLING! :)
			// gamma, LOL
			xyangle = 0
			
			// x horizontal, y vertical, z towards me
			// yaw = zxangle
			// pitch = zyangle
			// roll = xyangle
			
			// alpha == zxangle, beta == zyangle
			const alpha = zxangle
			const beta = zyangle
			const gamma = xyangle
			// see included PDF for reference.
			// 	only defining needed? hmm... all are needed for calculating rotation lol..
			
			// Describing it in code as described in the README, is probably better in the long run... Much more intuitive but much less performant?
			const rotation = [
				[
					Math.cos(alpha)*Math.cos(gamma), 	
					Math.cos(alpha)*Math.sin(beta)*Math.sin(gamma) - Math.sin(alpha)*Math.cos(gamma),	
					Math.cos(alpha)*Math.sin(beta)*Math.cos(gamma) + Math.sin(alpha)*Math.sin(gamma)
				],
				[
					Math.sin(alpha)*Math.cos(beta),	
					Math.sin(alpha)*Math.sin(beta)*Math.sin(gamma) + Math.cos(alpha)*Math.cos(gamma),
					Math.cos(alpha)*Math.sin(beta)*Math.sin(gamma) - Math.sin(alpha)*Math.cos(gamma)
				],
				[
					-Math.sin(beta), 
					Math.cos(beta)*Math.sin(gamma),
					Math.cos(beta)*Math.cos(gamma)
				]
			]
						
			// rotated == vertex * rotation
			//				1x3 * 3x3 = 1x3? 
			rotated = [] // rotation_vector??? so need to add to original?
			
			// don't forget to sum... lol... ? foooobarrrrrr 
			rotated[0] = (vertex[0] * rotation[0][0] + vertex[1] * rotation[0][1] + vertex[2] * rotation[0][2]) + vertex[0]
			rotated[1] = (vertex[0] * rotation[1][0] + vertex[1] * rotation[1][1] + vertex[2] * rotation[1][2]) + vertex[1]
			rotated[2] = (vertex[0] * rotation[2][0] + vertex[1] * rotation[2][1] + vertex[2] * rotation[2][2]) + vertex[2]
			
			console.log(`ROTATED: ${rotated}`)
			rotated[0] = normalize(...fov_range, rotated[0], ...object.unit_dimensions)
			rotated[1] = normalize(...fov_range, rotated[1], ...object.unit_dimensions)
			rotated[2] = normalize(...fov_range, rotated[2], ...object.unit_dimensions)
			
			// have rotated object, now 
			console.log(`ROTATED AND NORMALIZED: ${rotated}`)

			// okay so this isn't it, but progress?? lol 
			surface_in_view.positions.push(rotated[0])
			surface_in_view.positions.push(rotated[1])
			surface_in_view.positions.push(rotated[2])
		}
		console.log(surface_in_view)
		drawSurface(pg, surface_in_view)
	}
}

window.addEventListener("change", (event) => {
	console.log(event)
	if (event.target.id === "ztransform" || event.target.id === "zxangle" || event.target.id === "zyangle") { 
		handleDrawEvent(cube)
	}
})

document.addEventListener("mousemove", logKey);

var previous_x = 0
var previous_y = 0
function logKey(e) {
  //console.log(`Screen X/Y: ${e.screenX}, ${e.screenY}
    //Client X/Y: ${e.clientX}, ${e.clientY}`);
	const delta_x = e.clientX - previous_x
	const delta_y = e.clientY - previous_y
	if (Math.abs(delta_y) > 17 || Math.abs(delta_x) > 17) {
		//document.getElementById("zxangle").value = `${document.getElementById("zxangle").valueAsNumber + delta_x}`
		//document.getElementById("zyangle").value = `${document.getElementById("zyangle").valueAsNumber + delta_y}`
		//previous_x = e.clientX
		//		previous_y = e.clientY
		//handleDrawEvent()

	}
}

handleDrawEvent(cube)