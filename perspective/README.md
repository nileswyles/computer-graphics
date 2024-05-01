 Let's revisit from the beginning...
 Z shift - only:
 define field of view angle... let's set it to 135 degrees for now...
 As Z increases, we want to scale
	get range of field of view on -1 to 1 coordinate plane 
		min = Math.sin(-fov/2) * z
		max = Math.sin(fov/2) * z

		TODO:
		this means, a fov of 180 deg and z = 1 is identity?
			y = sin(fov) * z =  1
			fov = arcsin(1/z) = 90 degrees
		fov of approx. 16 deg and z = 7 is also identity?

 	normalize data to that range... (while also cropping any x values outside of field of range?? - let's ignore that edge case for now... and assume fov and Z is large enough for 45 degree rotation)
			
 now, if we rotate in horizontal (zx plane) we get a shift in x-component that's a function of the angle...			
	x = positions[i] - z * Math.sin(zxangle)
  positions[i] = normalize(min, max, x, -1.0, 1.0)

 repeat for zy-plane, fov makes up a cone, so same normalization applies

 Now, need to do this for all surfaces in 3D space...

 The z value described so far is distance from the camera to center of object, since we have been operating in 2D space... 
	The size of the object displayed is consequently a function of fov angle and z-distance lol.
	
Journey notes/summary:
	THIS?
	When viewing a 3D object even if it's rotated.
		How to represent depth in 2D? you don't! right? so just show sin-component of rotations, and center orient axis appropriately... 
	
	Why didn't what I had work?
	
	hmm... derp... each successive rotation is from the rotated point, meaning... need to rotate per axis individually then flatten... 
	
	I thought I could leverage the fact that we only considered the sin-component of rotation but that didnt work out as expected? Thought it might have something to do with Gimbal locking or at least the phenonemon behind it (coupling of the 3 dimensions, or rather "shape" of 3 dimensions?)... still TBD....

	The logic I had would probabbly work for all combinations of angles if the 2 axis were zx and xy or zy and xy? - actually no, that's also wrong.... 
	
	the only correct way to do it is.... represent object in 3D space...
	perform rotation in yaw (can define that however you want?)
	perform pitch rotation of *rotated yaw point*
	perform roll rotation of *rotated pitch point*
	
	Then you get a point that can be expressed as rotations of a point over varying degrees of freedom...

		The rotation matrix defined in the code, captures those transformations in a concise way.

	Need to figure out why rotation matrix defined is producing the rotated point when multiplied by the original point instead of a rotation vector as described by "Wikipedia" and my testing in 2D space lol... Just another way of describing the rotation? probably. but why isn't it consistent?
	
	More exercises and testing using euler angles and rotation matricies TBD....  
	
	
Let's think about what the best/correct way of thinking about rotations or movement in space... 
	- Doesn't make sense to complicate things and move both objects. So pick one as reference instead of arbitrary point.
	- Move object?
		- Most probably see it this way, at least originally?
	- Move camera?
		- Then maybe when you go and actually try to math, you might see it this way? Maybe if you consider shifting in the Z-axis?
			- Do we tend to think of things moving away from point of reference (us) instead of towards?
			
	If you continue this train of thought, you can easily map a path that someone is "most likely" to follow.... Given some information about the person, you might be pretty spot on.... until they catch on? lol
		Idk, probably, no definetly, reading too much into it... 
			- contradictions, we are all hypocrites! lol

- It's effectively the same thing? Just perspective?