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


Glossary (because words spark ideas...)

Quaternions - Basically polar coordinate (complex number) notation of more than 2D space. Can be used to perform some interesting maths. "Specifically, they encode information about an axis-angle rotation about an arbitrary axis." 

Gimbal Locking - Loss of degrees of freedom. Occurs when axis are aligned and become parallel to each other. Resolved by reset? or adding an extra degree of freedom (Quats).
		- i.e. When the pitch (xz) and yaw (yz) gimbals become aligned, changes to roll (xy) and yaw (yz) apply the same rotation to the airplane. Given the following order of rotations, roll, yaw, pitch? or pitch, yaw, roll? --- you get the idea.

Euler Angles (not Eigen Vectors/Values) - The Euler angles are three angles introduced by Leonhard Euler to describe the orientation of a rigid body with respect to a fixed coordinate system. They can also represent the orientation of a mobile frame of reference in physics or the orientation of a general basis in 3-dimensional linear algebra. You know 2D rotations but in 3D.

Unit Circle/Vector

Rotation Matrices

More euler stuff - 
	eulers identity! :)
		e^i*pi + 1 = 0
		when x == pi
		# cosign is real son!
		e^ix = cos(x) + isin(x)?
	
	e = 2.71 ...
	
	
