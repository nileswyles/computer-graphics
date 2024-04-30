TODO: hmmmm...... shouldn't this result in same? lol why you know work?
	*** (while also cropping any x values outside of field of range?? - let's ignore that edge case for now... and assume fov and Z is large enough for 45 degree rotation) ***
}
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
	

 Things to know:
	At most 3 surfaces displayed on screen at any given moment for a combination of zx-zy-angles
	Those 3 surfaces are a "projection" of the closest to camera (min(distance)).
 	

 can we think of cube surfaces (for instance), like this:
/*
					* * *
					* 6 *
					* * *
					- - -
					* * *
					* 4 *
					* * * 
					- - -
	* * * |	* * * | * * * | * * * | * * *
	* 6 * |	* 3 * | * 1 * | * 2 * | * 6 *
	* * * |	* * * | * * * | * * * | * * *
					- - -
					* * *
					* 5 *
					* * * 
					- - -
					* * *
					* 6 *
					* * *
					
	this structure can apply to all shapes/polygons?
		1 || 6
		2 || 3
		4 || 5
		
	Creating this data structure, means rotations are just shifts? Then we don't even need to care about identifying which surface is being displayed and just bring vertices in as needed?
	
	Can create the array buffer before hand... then use element index buffer to select verticies being selected?
	
	How search converges so nicely lol (DFS)... this was only made possibly by deciding to shift instead of scale...
	
	Let's see how this actually plays out in practice.
	
	Can I build a graph of surfaces?
		where surface points to adjacent surfaces...
		{
			vertices,
			left,
			right,
			top,
			bottom
		}
		
	Turns out this flat representation of the object really only facilitates single axis rotations... obviously? 
	
	In any case, let's start by defining the object surfaces in 3D space...
		
	GLSL do this?
	
	 For a sphere, ?
	 
	 
	Hmm....
	
	Journey notes/summary:
		THIS?
		When viewing a 3D object even if it's rotated.
			How to represent depth in 2D? you don't! right? so just show sin-component of rotations, and center orient axis appropriately... 
		
		Why didn't what I had work?
		
		hmm... derp... each successive rotation is from the rotated point, meaning... need to rotate per axis individually then flatten... I thought I could leverage the fact that zx_angle, zy_angle were perpindicular (orthogonal) to each other but that was wrong because z-axis common to both? The logic I had would probabbly work for all combinations of angles if the 2 axis were zx and xy or zy and xy? - actually no, that's also wrong.... 
		
		the only correct way to do it is.... represent object in 3D space...
		perform rotation in yaw (can define that however you want?)
		perform pitch rotation of *rotated yaw point*
		perform roll rotation of *rotated pitch point*
		
		Then you get a point that can be expressed by rotation in all degrees of freedom, AND/OR none at all (obviously)...

			The rotation matrix defined in the code, captures those transformations in a concise way.

		Need to figure out why rotation matrix defined is producing the rotated point when multiplied by the original point instead of a rotation vector as described by "Wikipedia" and my testing in 2D space lol... Just another way of describing the rotation? probably. but why isn't it consistent?
		
		More exercises and testing using euler angles and rotation matricies TBD....
*/		    
