# 3D Perspective Using WebGL

## Summary

The goal of this was to explore the mathematics behind 3D graphics. This module models a Cube in 3D space using WebGL.

## Glossary (because words spark ideas...)

* __Euler Angles__ (not Eigen Vectors/Values) 
	- The Euler angles are three angles introduced by Leonhard Euler to describe the orientation of a rigid body with respect to a fixed coordinate system. They can also represent the orientation of a mobile frame of reference in physics or the orientation of a general basis in 3-dimensional linear algebra. You know 2D rotations but in 3D.
* __Gimbal Locking__ 
	- Loss of degrees of freedom. Occurs when axes are aligned and become parallel to each other. Resolved by reset? or adding an extra degree of freedom (Quats).
		- i.e. When the pitch (xz) and yaw (yz) gimbals become aligned, changes to roll (xy) and yaw (yz) apply the same rotation to the airplane. Given the following order of rotations, roll, yaw, pitch? or pitch, yaw, roll? --- you get the idea.
* __Quaternions__
	- Basically polar coordinate (complex number) notation of more than 2D space. Can be used to perform some interesting maths. "Specifically, they encode information about an axis-angle rotation about an arbitrary axis." 
* __Rotation Matrices__
* __Rotation Vectors__
* __Unit Circle/Vector__
### Euler's Formula! :)
$$
	r * e^{i\theta} = r * cos({\theta}) + r * isin({\theta})
$$
$$
	e = 2.71 \\
	i = imaginary \: number \\
	r = distance \: from \: origin\\
	\theta = rotation \: angle \\
$$

This has many applications related to sinusoids, like electronics (impedance, and the like, for modeling capacitors and inductors).

## The Maths
### Let's Isolate the Problem to the Field of View Calculation

#### Glossary again
* __Focal Point__
	- Defined as the point from which you are viewing the world/space - the camera's location.
* __Field of View__
	- A triangle (2d) or cone with origin at the __Focal Point__ and representing the world/space.
* __Field of View Angle__ 
	- The angle of the intersection at the __Focal Point__.
* __Z Distance__
	- Represents the distance from __Focal Point__ to the object in question or the right-angle-adjecent edge of the two right triangles (or cones) that make up the __Field of View__.
* __Object__ 
	- A group of coordinates in the world/space which represent some entity. To keep things simple you can think of this as a single point.

#### Core Concept

The idea is that we are modeling the world using the parameters defined above.

Let's define a __Field of View Angle__ of 180 degrees. That is, a triangle who's angle at the __Focal Point__ is 180 degrees. In 2D space, the triangle can be represented as two equally sized right-angle triangles.

As the Z-distance increases, we want to scale the coordinate plane - which is defined by the parameters described above. To keep things simple let's also define an initial 'Identity' coordinate plane that ranges from -1 to 1 (think Unit Circle).

That being said, we can define the following relations:
$$
	min = sin(-\theta/2) * z \\
	max = sin({\theta/2}) * z \\
$$
$$
	\theta = the \: fov \: angle \: in \: radians \\
	z = z \: distance
$$
When projecting onto space, the __Object__ and __Field of View__ coordinate plane need to match. You can either choose to scale the relations defined above or the coordinates representing you're object to the Identity coordinate plane (perspective). Keep in mind you will also want to crop out any coordinates that are out of range, that is coordinates of the object not within the __Field of View__.

 The __Z Distance__ described so far is distance from the camera to center of object, since we have been thinking this in terms of a flat plane. The size of the object displayed is consequently a function of __Field of View Angle__ and __Z Distance__. 
```
	Identity is defined as when min = -1 and max = 1

	this means, a fov of 180 deg and z = 1 is identity.
		y = sin(fov) * z =  1
		fov = arcsin(1/z) * 2 = 90 degrees * 2

	for example, fov of approx. 16 deg and z = 7 is also identity.
```

The __Field of View__ calculation described above applies to both 3D and 2D space.

To expand on this further, we want to keep the math as simple as possible.
	Let's not choose an arbitrary point in space for the math calculations - we decide to do maths relative to the reference point (__Focal Point__). Similarly, when projecting objects onto the space defined by the __Focal Point__ and __Field of View__, it doesn't make sense to complicate things and move both entities (__Focal Point__ and __Object__). I think regardless of how you get there (normalize object to space or space to object), it's important to think about this in two ways.
1. Does the object move?
	- Most probably see it this way, at least originally?
2. Does the camera move?
	- Do we tend to think of things moving away from the point of reference (us) instead of towards?

It's effectively the same thing. Just perspective.

I have a feeling this idea is especially important when working with multiple objects and perspectives.

### The 3D Rotations are Independent from the Field of View Calculation (kind of? for convinience?, resulting coordinates are normalized to the fov,)
In 3D space, the rotations are defined as 3 independent transformations.

#### Glossary again
* __Yaw trick Yaw__
	- Represents the rotation angle between two planes, in 3D space. It can be arbitrarily defined, but in the code, I chose to define it as the angle between the X and Z planes. 
* __Pitch__
	- Represents the rotation angle between two planes, in 3D space. It can be arbitrarily defined, but in the code, I chose to define it as the angle between the Y and Z planes. 
* __Roll__
	- Represents the rotation angle between two planes, in 3D space. It can be arbitrarily defined, but in the code, I chose to define it as the angle between the X and Y planes. 

#### Core Concept

In this example, we represent an object in 3D space. Rotate the object in yaw and pitch, then normalize to field view. 
This works, but I think might want to support multiple camera's field of views. right, so I mean I suppose I can recalculate the rotation for each fov are they coupled? Memoize and cross-section? The rotation is the cross-section calculation... okay. stable.

##### Procedure
1. perform rotation in yaw
2. perform pitch rotation of *rotated yaw point(s)*
3. perform roll rotation of *rotated pitch point(s)* (not supported in this example)

##### Matrix Notation

See [Rotation Matrix (Wikipedia)](https://en.wikipedia.org/wiki/Rotation_matrix)

##### Lessons Learned

I was originally trying to derive the rotation matrix stuff from scratch ("B-eulerrrrr"). That didn't go very well. I forget exactly what was missing but I think it was a matter of perspective, gimbal locking? Some folding of the third dimension? 

You know given that you generally want to specialize the problem (divide and conquer). I thought I would be clever and represent the 3D cube in 2D space (where each surface is connected to the adjacent surface) - that didn't work obviously? - need the information the third dimension provides.

R-ggggg

### 2D Rotations are a Less Complex but not a Specialization of the 3D Rotations (R-ggg)
#### Glossary again
* __Rotation__
	- In 2D space, if we think of the __Unit Circle__, a rotation is defined as a tranformation whereby a point is rotated about the origin as if it were tied with a string - think tetherball.
* __Rotation Vector__
	- A vector where when added to some point vector results in a point representing the __Rotation__ described above.

Given basic trigonmetry (__Euler's formula__ and the __Unit Circle__), you can probably come up with a program that performs the rotation relatively easily.

#### Core Concept

Let's define the following:

Original Point
$$
0.5 + i0.5 
$$
Rotation Angle
$$
{\pi}/2 \: rads = 90 \: degrees
$$
Point Representing Rotation Angle
$$
	0 + i1
$$


We can look at it in many different ways. Let's explore that, I think that's were the magic is here.
1. __Polar Coordinates Angles and Euler's Formula__
	1. We can use euler's formula (soh,cah,toa) to get the angle of the original point, 
	2. Sum the angles. 
	3. Euler's Formula with summed angle to get each component.
$$
	e^{i\theta} = cos({\theta}) + isin({\theta})
$$

2. __Vector Math__
	1. Define the a new vector which represents the rotation from the initial angle of zero.
	2. Vector addition in order (from tip of other). 
```
You can start from the vector representing the rotation angle (1) or the original vector (2):
In both instances, you want to basically get the vector's (fixed) value based on the coordinate system of the other where the other vector is equal to [-1, 0].

1. To normalize to get from [0, 1] to [-1, 0]: [-1, -1] -> [-0.5, -0.5] then normalize to the unit circle based on the range of transformation or get 360 - angle using __Euler's Formula__... same thing. The resulting (normalized) vector should contain an angle where 360 - angle is the vector along the unit circle that we expect.
2. To normalize to get from [0.5, 0.5] to [-1, 0]: [-1.5, -0.5] -> [-1.5, 1.5] then normalize to unit circle based on range of the tranformation or get the angle using __Euler's Formula__. The resulting (normalized) vector is the vector along the unit circle that we expect.
```
$$
x' = x * cos({\theta}) - y * sin({\theta}) \\
y' = x * sin({\theta}) - y * cos({\theta})
$$
In summary, the contribution to either component is a function of the angle of the original vector. 
Again, the inverse will also work, it's a matter of defining coordinate planes in a convenient way to simplify the problem. You can also, get the value of the rotation vector based on the original vector's coordinate plane. (360 - New Angle).

3. __The Rotation Matrix__
$$
\left[ {\begin{array}{cc}
  x' \\
  y' \\
\end{array} } \right] = 
\left[ {\begin{array}{cc}
  cos({\theta}) & -sin({\theta}) \\
  sin({\theta}) & cos({\theta}) \\
\end{array} } \right] * 
\left[ {\begin{array}{cc}
  x \\
  y \\
\end{array} } \right] 
$$

Again, these are expressing the same idea in different notation. I think it's important to provide perspective. Another interesting tidbit is that you can also think of this purely geometrically - drawing triangles in open space and in a convienient way, leveraging basic triangle properties and the pythagorean theorem. Very similar to option 1.

##### Relevant Notation
$$
\left[ {\begin{array}{cc}
  x' \\
  y' \\
\end{array} } \right] = 
\left[ {\begin{array}{cc}
  cos({\theta}) & -sin({\theta}) \\
  sin({\theta}) & cos({\theta}) \\
\end{array} } \right] * 
\left[ {\begin{array}{cc}
  x \\
  y \\
\end{array} } \right] 
$$
$$
x' = x * cos({\theta}) - y * sin({\theta}) \\
y' = x * sin({\theta}) - y * cos({\theta})
$$
###### All together now
$$
e^{i\theta} = cos({\theta}) + isin({\theta}) =
  \left[ {\begin{array}{cc}
    cos({\theta}) & -sin({\theta}) \\
    sin({\theta}) & cos({\theta}) \\
  \end{array} } \right]
$$

## Misc. Notes

3D Rotation - Need to figure out why rotation matrix defined is producing the rotated point when multiplied by the original point instead of a rotation vector as described by "Wikipedia" and my testing in 2D space lol... Just another way of describing the rotation? probably. but why isn't it consistent?

2D Rotation (Vector Maths) - Dear future me, this is still rough... but I sort of understand what I am thinking about. Could use some clean up. What I'm trying to identify here is the extra information, some thing that matrices, vector math (or space embeds)... I think it's just that we choose to define a rotation about the origin of unit circle so it's traveling rotationally...? The below is what the rotation matrix is saying. I suppose... such an odd mathematical operation - like do I understand matrices really? - next rabbit hole.


Such a vivrant thingg....

## TODO
More exercises and testing using euler angles and rotation matricies.