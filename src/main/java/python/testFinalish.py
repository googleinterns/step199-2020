import ee
import json
import sys
import numpy as np

ee.Initialize()
expectedNumArgs = 4
if(len(sys.argv) != expectedNumArgs + 1):
    print("Wrong number of args provided")
    exit(-1)

argList = sys.argv
# This code has been simplifed dramatically, if one wants to graph these values in
# 2D they should look at the example that inspired this code
minLat = float(argList[1])
minLng = float(argList[2])
maxLat = float(argList[3])
maxLng = float(argList[4])
area = ee.Geometry.Polygon([[minLng, minLat],
                            [maxLng, minLat],
                            [maxLng, maxLat],
                            [minLng, maxLat],
                            [minLng, minLat]])


def imageToNpArray(img, bandName, toScale=30):
    # It is important the scale parameter is correct.
    # In this case as our scan is a 30 DEM scan, we use a scale parameter of 30.
    img = img.reduceRegion(reducer=ee.Reducer.toList(),
                           geometry=area,
                           scale=toScale)
    data = np.array((ee.Array(img.get(bandName)).getInfo()))
    return data

# For this dataset and band combination, elevation is given in meters above sea level.
dsmName = 'JAXA/ALOS/AW3D30/V2_2'
bandName = 'AVE_DSM'

# Take the image dataset and select the subset in this range of latitude and longitude.
dataset = ee.Image(dsmName).clip(area)
# Convert the image.
data = imageToNpArray(dataset, bandName)
# Change np array into list.
lists = data.tolist()
# Generate JSON.
json_str = json.dumps(lists)
# Print out results to stdout for redirection in Java call.
print(json_str)