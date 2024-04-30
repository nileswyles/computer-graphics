// Vertex shader program
//const vsSource = `
//	
//	struct surface {
//		vec4 position;
//		// can this be a thing? else use vec4?
//		surface left;
//		surface right;
//		surface top;
//		surface bottom;		
//	};
//	
//	attribute vec4 a_position;
//	
//	void createObject(in vec4 front, in vec4 back, in vec4 left, in vec4 right, in vec4 top, in vec4 bottom) {
//		surface front = surface(front);
//		surface back = surface(back);
//		surface left = surface(left);
//		surface right = surface(right);
//		surface top = surface(top);
//		surface back = surface(bottom);
//	} 
//	
//	void main() {
//	gl_Position = a_position;
//	}
//`

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
} // lol

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

console.log(`${'drawingBufferColorSpace' in gl}`)

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
const program2 = initShaderProgram(gl, vsSource, fsSource2)

// black canvas
gl.clearColor(0.0, 0.0, 0.0, 1.0)
gl.clear(gl.STENCIL_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
resizeCanvasToDisplaySize(gl.canvas)
console.log(`${gl.canvas.width}, ${gl.canvas.height} BLAH BLAH`)

// TODO: this here makes no sense...
gl.viewport(gl.canvas.width/2 - 250, gl.canvas.height/2 - 250, 500, 500)
// 
window.addEventListener("change", (event) => {
	console.log(event)
	if (event.target.id === "ztransform" || event.target.id === "zxangle" || event.target.id === "zyangle") { 
		drawAll()
	}
})

const drawAll = (z, zxangle) => {
	document.getElementById("zxangle-label").textContent = document.getElementById("zxangle").value
	document.getElementById("zyangle-label").textContent = document.getElementById("zyangle").value
	document.getElementById("ztransform-label").textContent = document.getElementById("ztransform").value
	gl.clearColor(0.0, 0.0, 0.0, 1.0)
	gl.clear(gl.STENCIL_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
	gl.useProgram(program)
	draw(document.getElementById("ztransform").valueAsNumber, document.getElementById("zxangle").valueAsNumber, document.getElementById("zyangle").valueAsNumber, program)
	// draw other
	//vec4(0.34, 1.0, 0.87, 1.0)
	//draw(document.getElementById("ztransform").value, )
	//drawOutline()
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
}

const drawSurface = (pg, surface) => {
	setColor(pg, surface.color)
	
	const positionBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(surface.positions), gl.STATIC_DRAW)
	const positionAttributeLocation = gl.getAttribLocation(pg, "a_position")
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
	gl.drawArrays(gl.TRIANGLES, 0, (surface.positions.length)/numComponents)
	
	// cleanup
	gl.deleteBuffer(positionBuffer)
}

const draw = (z, zxangle, zyangle, pg) => {
	const surface_dimensions = [-1.0, 1.0]
	const surfaces = {
		FRONT: {
			color: [0.777, 0.214, 0.820, 1.0],
			positions: [
				-1.0, 1.0, // TOP LEFT
				1.0, 1.0, // TOP RIGHT
				-1.0, -1.0, // BOTTOM LEFT
						
				1.0, 1.0, // TOP RIGHT
				1.0, -1.0, // BOTTOM RIGHT
				-1.0, -1.0, // BOTTOM LEFT
			]
		},
	}
	// the following creates the datastructure representing the 3D surfaces (for, in this instance, a cube...)
	const side_length = surfaces.FRONT.positions.length
	
	const OPPOSITE_COLOR = [0.34, 1.0, 0.87, 1.0]
	
	surfaces.LEFT = {
		color: [0.27, 0.5, 0.37, 1.0],
		positions: []
	}
	for (let i = 0; i < side_length; i++) {
		// x - 2, == LEFT ADJACENT SIDE,
		if (i % 2 == 0) { // x - component
			surfaces.LEFT.positions.push(surfaces.FRONT.positions[i] - 2.0);
		} else {
			surfaces.LEFT.positions.push(surfaces.FRONT.positions[i])
		}
	}
	
	surfaces.RIGHT = {
		color: [0.60, 1.0, 0.7, 1.0],
		positions: []
	}
	for (let i = 0; i < side_length; i++) {
		// x + 2, == RIGHT ADJACENT SIDE,
		if (i % 2 == 0) { // x - component
			surfaces.RIGHT.positions.push(surfaces.FRONT.positions[i] + 2.0);
		} else {
			surfaces.RIGHT.positions.push(surfaces.FRONT.positions[i])
		}
	}
	
	surfaces.LEFT_OPPOSITE = {
		color: OPPOSITE_COLOR,
		positions: []
	}
	for (let i = 0; i < side_length; i++) {
		// x - 4, == OPPOSITE/FAR SIDE,
		if (i % 2 == 0) { // x - component
			surfaces.LEFT_OPPOSITE.positions.push(surfaces.FRONT.positions[i] - 4.0);
		} else {
			surfaces.LEFT_OPPOSITE.positions.push(surfaces.FRONT.positions[i])
		}
	}
	
	surfaces.RIGHT_OPPOSITE = {
		color: OPPOSITE_COLOR,
		positions: []
	}
	for (let i = 0; i < side_length; i++) {
		// x + 4, == OPPOSITE FAR SIDE,
		if (i % 2 == 0) { // x - component
			surfaces.RIGHT_OPPOSITE.positions.push(surfaces.FRONT.positions[i] + 4.0);
		} else {
			surfaces.RIGHT_OPPOSITE.positions.push(surfaces.FRONT.positions[i])
		}
	}	
	
	surfaces.BOTTOM = {
		color: [0.09, 0.28, 0.81, 1.0],
		positions: []
	}
	for (let i = 0; i < side_length; i++) {
		// y - 2, == BOTTOM ADJACENT SIDE,
		if (i % 2 == 1) { // y - component
			surfaces.BOTTOM.positions.push(surfaces.FRONT.positions[i] - 2.0);
		} else {
			surfaces.BOTTOM.positions.push(surfaces.FRONT.positions[i])
		}
	}
	
	surfaces.TOP = {
		color: [0.49, 0.58, 0.69, 1.0],
		positions: []
	}
	for (let i = 0; i < side_length; i++) {
		// y + 2, == TOP ADJACENT SIDE,
		if (i % 2 == 1) { // y - component
			surfaces.TOP.positions.push(surfaces.FRONT.positions[i] + 2.0);
		} else {
			surfaces.TOP.positions.push(surfaces.FRONT.positions[i])
		}
	}
	
	surfaces.OPPOSITE_BOTTOM = {
		color: OPPOSITE_COLOR,
		positions: []
	}
	for (let i = 0; i < side_length; i++) {
		// y - 4, == OPPOSITE/FAR SIDE,
		if (i % 2 == 1) { // y - component
			surfaces.OPPOSITE_BOTTOM.positions.push(surfaces.FRONT.positions[i] + 4.0);
		} else {
			surfaces.OPPOSITE_BOTTOM.positions.push(surfaces.FRONT.positions[i])
		}
	}
	
	surfaces.OPPOSITE_TOP = {
		color: OPPOSITE_COLOR,
		positions: []
	}
	for (let i = 0; i < side_length; i++) {
		// y + 4, == OPPOSITE FAR SIDE,
		if (i % 2 == 1) { // y - component
			surfaces.OPPOSITE_TOP.positions.push(surfaces.FRONT.positions[i] + 4.0);
		} else {
			surfaces.OPPOSITE_TOP.positions.push(surfaces.FRONT.positions[i])
		}
	}	

	// TODO:
	// this will rotate about origin which is middle of shape, which might not be desired behaviour but let's see. Might need to shift 90 degrees? 
	// 90 deg == 45 deg?
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
	
	for (const [LABEL, SURFACE] of Object.entries(surfaces)) {
		console.log(SURFACE)
		const surface_in_view = { color: SURFACE.color, positions: [] }
		for (let i = 0; i < SURFACE.positions.length; i++) {
			let angle = 0
			if (i % 2 == 0) { // x component
				angle = zxangle
			} else { // y component
				angle = zyangle
			}
			// p_prime == point after rotation about origin of object (in other words, bottom end of object when rotated... LOL)
				// but satelites YO!
			// 	since it's all relative, moving camera by angle about origin is same as rotating the object about origin?
			// 		Assuming Z = 1 at least?
			
			// don't actually want to subtract by y-component to get p_prime but instead by distance between c and c_prime?
			// 	don't think it matters... This just controls how much it rotates... It can be remapped to whatever scale in the frontend.
			let p_prime = SURFACE.positions[i] - Math.sin(angle)
			// select only vertices within surface_dimensions centered at p_prime...
			
			// cap any edge vertices down past surface_dimensions to surface_dimensions...
			//	But only for surface within surface_dimensions window?
			// 		If I cap all, do triangle primitives it get drawn as straight line or not at all?? 
			// 		Let's assume open gl has a way of handling that for now...
			//			check for duplicates?
			
			if (p_prime < surface_dimensions[0]) {
				p_prime = surface_dimensions[0]
			} else if (p_prime > surface_dimensions[1]) {
				p_prime = surface_dimensions[1]
			}
			// finish the triangles, 
			// done?
			// hm.... no, this is wrong....
			// want to select vertices in 
			
			// check for duplicates????
			
			console.log(p_prime)
			
			
			// new data structure because surfaces might have other attributes? like, color, texture?
			
			//surface_in_view.positions.push(normalize(fov_range[0], fov_range[1], p_prime, surface_dimensions[0], surface_dimensions[1]))
			surface_in_view.positions.push(normalize(...fov_range, p_prime, ...surface_dimensions))

		}
		console.log(surface_in_view)
		
		// brevvvvvvvvv cmon brevvvvvvvvvv wtf
		// gl.clearColor(...SURFACE.color)
		// gl.clear(gl.COLOR_BUFFER_BIT)
		
		// huh??//???????????????????
		
		drawSurface(pg, surface_in_view)
	}
}

drawAll()

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
		previous_x = e.clientX
				previous_y = e.clientY
		//drawAll()

	}
}