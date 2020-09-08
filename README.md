# Stellarpoint

The StellarPoint Project aims to build a 3D viewer which is able to
visualize different kinds of sensor data, e.g. the pose trajectory,
point cloud, imu data, etc... We hope to create a web-based visualization
tool that can efficiently and accurately display sensor data that is not
only visually appealing, but user friendly. The open-source viewer should
allow users to conveniently debug and quickly upload pose data to
visualize, making this project impactful inside and outside Google.

The name StellarPoint is in reference to the various points which make up
the 3D scene. The pose trajectory is made up of latitude and longitude
coordinates which, along with altitude, create a path of thousands of
x, y, z points in our 3D space. Point cloud data is composed of hundreds
of thousands of lidar data points describing their distance relative to
the lidar sensor. Inertial Measurement Unit (IMU) data is also an
important part of our data visualization. Its data describes the linear
and rotational acceleration of the IMU sensor using an accelerometer
and gyroscope. The name is meant to accentuate how we manipulate these
seemingly simple data points into such a stellar project.

[PR #39 : showing multruns feature integrate](https://drive.google.com/file/d/1vgGwR3QjZNX1plJUvNNQTPGEnu1c2vDF/view)

To interact with the 2D-viewer of the application the user can either ctr-click or shift-click to get a selection rectangle which will select a partial
region, or the whole region based on those respective clicks. Here is a
brief demo of this functionality/the overall application flow.

[![StellarPoint 2D Viewer](http://img.youtube.com/vi/lUKZUFxjdkA/0.jpg)](http://www.youtube.com/watch?v=lUKZUFxjdkA "StellarPoint 2D Viewer")

The terrain data is currently loaded from a 30m DEM scan using the Google Earth
Engine platform to fetch this data. Load times our relatively fast with this low
resolution scan; web workers may be required for much more precise scans. Here
is an example rendering terrain to scale with not to scale pose data.

[![Terrain Example](http://img.youtube.com/vi/vb1T0t8_fOU/0.jpg)](http://www.youtube.com/watch?v=vb1T0t8_fOU "Terrain Example")