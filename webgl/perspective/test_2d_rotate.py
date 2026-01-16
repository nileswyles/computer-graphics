import math

# square - top right
point = (0.7, 0.7)

def rotate(point, deg):
    deg = deg/180 * math.pi
    rotation_vector = (point[0]*math.cos(deg)-point[1]*math.sin(deg), point[0]*math.sin(deg)+point[1]*math.cos(deg))
    print(rotation_vector)
    return (rotation_vector[0] + point[0], rotation_vector[1] + point[1])


print(rotate(point, 90))