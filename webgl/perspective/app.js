// Data structures
const cube = {
	// TODO: typescript? static checking???? LMAO 
	
	// parallel to XY-plane
	FRONT: {
		//color: [0.777, 0.214, 0.820, 1.0],
		color: [1.0, 1.0, 1.0, 1.0],
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
		//color: [0.777, 0.901, 0.820, 1.0],
		color: [1.0, 0.0, 0.0, 1.0],
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
		//color: [0.27, 0.5, 0.37, 1.0],
		color: [0.0, 1.0, 0.0, 1.0],
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
		//color: [0.60, 1.0, 0.7, 1.0],
		color: [0.0, 0.0, 1.0, 1.0],
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
		//color: [0.09, 0.28, 0.81, 1.0],
		color: [1.0, 1.0, 0.0, 1.0],
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
		//color: [0.49, 0.58, 0.69, 1.0],
		color: [1.0, 0.0, 1.0, 1.0],
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
	
	varying lowp vec4 vColor;

	void main() {
	gl_Position = a_position;
	vColor = lol;
	}
`
const fsSource = `
	varying lowp vec4 vColor;
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
	document.getElementById("xzangle-label").textContent = document.getElementById("xzangle").value
	document.getElementById("yzangle-label").textContent = document.getElementById("yzangle").value
	document.getElementById("ztransform-label").textContent = document.getElementById("ztransform").value
	
	gl.clearColor(0.0, 0.0, 0.0, 1.0)
	gl.clear(gl.STENCIL_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
	
	gl.useProgram(program)
	console.log(object)
	draw(object, document.getElementById("ztransform").valueAsNumber, document.getElementById("xzangle").valueAsNumber, document.getElementById("yzangle").valueAsNumber, program)
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
	
	var colors = [...color, ...color, ...color, ...color, ...color, ...color];
	
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
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)
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
	
	// Per MDN Docs, webgl_modelview_projection pdf included (grain-of-salt?):
	// The Z depth in the squares determines what gets drawn on top when the squares share the same space. The smaller Z values are rendered on top of the larger Z values.
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

const draw = (object, z, xzangle, yzangle, pg) => {	
	xzangle = xzangle/180 * Math.PI
	yzangle = yzangle/180 * Math.PI
	console.log(`${z}, xzangle: ${xzangle}, yzangle: ${yzangle}`)
	z = normalize(1.0, 1000.0, z, 1.0, 5.0)
	console.log(`z_normalized: ${z}`)
	z_primex = (z * Math.cos(xzangle))
	z_primey = (z * Math.cos(yzangle))	
	console.log(`z_primex: ${z_primex}, z_primey: ${z_primey}`)
	
	const fov = 180
	const fov_rads = fov / 180 * Math.PI
	const fov_range = [Math.sin(-fov_rads/2) * z, Math.sin(fov_rads/2) * z]
	console.log(`fov: ${fov}, min: ${fov_range[0]}, max: ${fov_range[1]}`)
	for (const [LABEL, SURFACE] of Object.entries(object)) {
		console.log(`SURFACE ${SURFACE}`)
		const surface_in_view = { color: SURFACE.color, positions: [] }
		
		let i = 0;
		while (i < SURFACE.positions.length) {			
			// because 3 dims
			const vertex = SURFACE.positions.slice(i, i + 3)
			i += 3 
			// NO ROLLING! :)
						
			// x horizontal, y vertical, z towards me
			// yaw = xzangle
			// pitch = yzangle
			// roll = xyangle

			// 2D rotation matrix
			//X' = Xcos(90) - Ysin(90)
			//Y' = Xsin(90) + Ycos(90)
			// vertex == x,y,z
			
			// TODO: move this operation to OPENGL land. So that only data required by OPENGL on each draw are angles?....
			//		Also load objects (including textures, etc) ahead of time, if possible....?
			
			// 	or generate LARGE table of all possible rotations ahead of time in JS runtime? over optimization?
			
			// yaw rotation	- xz axis	
			const yaw_rotated = []
			yaw_rotated[0] = vertex[0]*Math.cos(xzangle) - vertex[2]*Math.sin(xzangle)
			yaw_rotated[1] = vertex[1]
			yaw_rotated[2] = vertex[0]*Math.sin(xzangle) + vertex[2]*Math.cos(xzangle)

			// pitch rotation - yz axis
			const yaw_pitch_rotated = []
			yaw_pitch_rotated[0] = yaw_rotated[0]
			yaw_pitch_rotated[1] = yaw_rotated[1]*Math.cos(yzangle) - yaw_rotated[2]*Math.sin(yzangle)
			yaw_pitch_rotated[2] = yaw_rotated[1]*Math.sin(yzangle) + yaw_rotated[2]*Math.cos(yzangle)
			
			const UNIT_DIMENSIONS = [-1.0, 1.0]
			// remember this does z shift (shrinks object in view)
			const rotated = []
			rotated[0] = normalize(...fov_range, yaw_pitch_rotated[0], ...UNIT_DIMENSIONS)
			rotated[1] = normalize(...fov_range, yaw_pitch_rotated[1], ...UNIT_DIMENSIONS)
			rotated[2] = normalize(...fov_range, yaw_pitch_rotated[2], ...UNIT_DIMENSIONS)
			
			console.log(`ROTATED AND NORMALIZED: ${rotated}`)

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
	if (event.target.id === "ztransform" || event.target.id === "xzangle" || event.target.id === "yzangle") { 
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
		document.getElementById("xzangle").value = `${document.getElementById("xzangle").valueAsNumber + delta_x}`
		document.getElementById("yzangle").value = `${document.getElementById("yzangle").valueAsNumber + delta_y}`
		previous_x = e.clientX
		previous_y = e.clientY
		handleDrawEvent(cube)

	}
}

handleDrawEvent(cube)