// Gobal variables.
let map;
let pose;
let id;
let type;
let currentLat;
let currentLong;
// Define bounding box around the different data sets to quickly determined
// whether they should be included in the calculation or not

/**
 * A Point object with a lat and lng.
 * @typedef {Object<number, number>} Point
 * @property {number} lat The lat of the point.
 * @property {number} lng The lng of the point.
 */
fetchData();
/**
 * Fetchs pose data from the RunInfo servlet, it is an asynchronous call
 * requiring initMap() to be called after the data is fully loaded.
 */
function fetchData() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  id = urlParams.get('id');
  type = urlParams.get('dataType');
  fetch('/getrun?id=' + id + '&dataType=' + type)
      .then((response) => response.json())
      .then((data) => pose = data)
      .then(() => {
        console.log(pose);
        initMap();
      });
}

/**
 * Embeds the Google map interface within the html along with drawing the pose
 * trajectory and adding a button link.
 */
function initMap() {
  // Occurs when google map api calls all promises, which is getting this
  // function called somehow, according to stack trace.
  if (pose === undefined) {
    return;
  }

  console.log('initMap called');
  const poseCoordinates = [];
  for (let i = 0; i < pose.length; i++) {
    poseCoordinates.push({lat: pose[i].lat, lng: pose[i].lng});
  }

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: pose[0].lat, lng: pose[0].lng},
    zoom: 18,
  });
  // Draws the pose trajectory.
  const poseTrajectory = new google.maps.Polyline({
    path: formatPoseData(),
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2,
  });

  poseTrajectory.setMap(map);
  const sideControlDiv = document.createElement('div');
  selectionPane(sideControlDiv);
  console.log(sideControlDiv);
  sideControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(sideControlDiv);


  const centerControlDiv = document.createElement('div');
  centerControl(centerControlDiv);
  centerControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);

  // Add event listeners for selection box
  map.addListener('mousemove', function(event) {
    const latLng = event.latLng;
    currentLat = latLng.lat();
    currentLong = latLng.lng();
  });
}

/**
 * Changes the pose data to a format the Google maps javascript api can read.
 * @return { Array <Point> } Returns an array of Points.
 */
function formatPoseData() {
  const poseCoordinates = [];
  for (point of pose) {
    poseCoordinates.push({lat: point.lat, lng: point.lng});
  }
  return poseCoordinates;
}

/**
 * Create a selection element containing a table which allows easy modification
 * of map data displayed.
 * @param {HTMLElement} sideControlDiv
 */
function selectionPane(sideControlDiv) {
  // Set CSS for the selection pane border.
  const selectionUI = document.createElement('div');
  selectionUI.className = 'selectionUI';
  selectionUI.title = 'Select the pose runs to view/render in 3D.';
  sideControlDiv.appendChild(selectionUI);

  // Set CSS for the selectin pane interior.
  const selectionText = document.createElement('div');
  selectionText.className = 'selectionText';
  selectionText.innerHTML = '<table id="pose-data"> <tr><th>RunID</th>' +
    '<th>DataType</th></tr><tr class="visible"><td>qKuu3BFO7R</td><td>' +
    '<a href="/2DVisual.html?id=qKuu3BFO7R&amp;dataType=pose">pose' +
    '</a></td></tr></table>';
  selectionUI.appendChild(selectionText);
}

/**
 * Creates the html elements inside of the button, along with adding a link to
 * the 3DVisual.html page.
 * @param {HTMLElement} controlDiv
 * This is the main/parent element of the button.
 */
function centerControl(controlDiv) {
  // Set CSS for the control border.
  const controlUI = document.createElement('div');
  controlUI.className = 'controlUI';
  controlUI.title = 'Click to switch to 3D visualization';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  const controlText = document.createElement('div');
  controlText.className = 'controlText';
  controlText.textContent = 'Switch to 3D';
  controlUI.appendChild(controlText);

  // Setup the click event listeners: simply set the map to Chicago.
  controlUI.addEventListener('click', function() {
    window.location.href = '/3DVisual.html?id=' + id + '&dataType=' + type;
  });
}

// When finished drawing the box, instead of leaving the widget, create markers
// at the current lat and intersection with the line.
$(function() {
  let widget;
  let x;
  let y;
  let finX;
  let finY;
  let priorLat;
  let priorLng;
  let ismousedown = false;
  let markerBottom;
  let markerTop;
  let subPath;
  let infoWindow;

  $(document).on({
    mousedown: function(event) {
      console.log('event occurred');
      if (event.ctrlKey) {
        if (!ismousedown) {
          console.log('mousedown triggered');
          x = event.pageX;
          y = event.pageY;
          priorLat = currentLat;
          priorLng = currentLong;

          console.log('Remove widget');
          $('.widget').remove();
          $('body').append('<div class="widget" style="top:' +
            y + 'px; left: ' + x + 'px;"></div>');
          widget = $('.widget').last();
          ismousedown = true;
        }
        // Toggle the mouseDown state so same click used to set final.
      } else {
        // On the left click action.
        if (event.which === 1) {
          if (ismousedown) {
            $('.widget').remove();
            if (infoWindow !== undefined) {
              infoWindow.setMap(null);
            }
            console.log('Mousedown set to false');
            ismousedown = false;
            // Here check the intersection by looping over the current different
            // bounding rectangles and determining if they intersect. Assume
            // that the selection window doesn't contain any multiple parallel
            // lines for simplicity (only chooose to display top if this is the
            // case).
            const minLat = Math.min(currentLat, priorLat);
            const maxLat = Math.max(currentLat, priorLat);
            const minLng = Math.min(currentLong, priorLng);
            const maxLng = Math.max(currentLong, priorLng);
            const poseLength = pose.length;
            // Lat can be from [-90,90].
            let discoveredMinLat = 91;
            let discoveredMinLatPair = 181;
            // Lng can be from [-180,180].

            let discoveredMaxLng = -181;
            let discoveredMaxLngPair = -91;
            subLine = [];
            for (let i = 0; i < poseLength; i++) {
              const loopLat = pose[i].lat;
              const loopLng = pose[i].lng;
              if (withinBound(minLat, maxLat, minLng,
                  maxLng, loopLat, loopLng)) {
                // While iterating save the max and min lat, same for the lng.
                if (discoveredMinLat > loopLat) {
                  discoveredMinLatPair = loopLng;
                  discoveredMinLat = loopLat;
                }
                if (discoveredMaxLng < loopLng) {
                  discoveredMaxLngPair = loopLat;
                  discoveredMaxLng = loopLng;
                }
                subLine.push(pose[i]);
              }
            }

            // Clear prior markers/path if they exist.
            if (markerBottom !== undefined) {
              markerBottom.setMap(null);
            }
            if (markerTop !== undefined) {
              markerTop.setMap(null);
            }
            if (subPath !== undefined) {
              subPath.setMap(null);
            }
            const subSectionNumber = 1;
            //   const subLine2D = subLine.filter((inputArray) => ();
            // console.log(subLine2D); Can leave in extra parameters and that
            // has no effect on the graphing.
            subPath = new google.maps.Polyline({
              path: subLine,
              geodesic: true,
              strokeColor: 'blue',
              strokeOpacity: 1.0,
              strokeWeight: 2,
            });
            // Setup event listener to show option for 3D window when polyline
            // is clicked.
            google.maps.event.addListener(subPath, 'click', function(event) {
              const latLng = event.latLng;
              console.log('Polyline clicked at lat: ' + latLng.lat() +
                ' lng: ' + latLng.lng());
              infoWindow = new google.maps.InfoWindow({
                content: '<a href=/home.html?id=' + id + '&dataType=' +
                  type + '&subSection=' + subSectionNumber +
                  '&stored=true' + '> View in 3D </a>',
                position: latLng,
              });
              infoWindow.setMap(map);
            },
            );

            subPath.setMap(map);

            markerBottom = new google.maps.Marker({
              position: {lat: discoveredMinLat, lng: discoveredMinLatPair},
              title: 'Lat: ' + discoveredMinLat +
                ' Lng: ' + discoveredMinLatPair,
            });
            markerTop = new google.maps.Marker({
              position: {lat: discoveredMaxLngPair, lng: discoveredMaxLng},
              title: 'Lat: ' + discoveredMaxLngPair +
                ' Lng: ' + discoveredMaxLng,
            });
            // At this point iterate through all the values to contruct a new
            // line with the appropriate markers.
            markerBottom.setMap(map);
            markerTop.setMap(map);
            // Constant to account for possibility of multiple subsections.

            sessionStorage.setItem(id + '_' + type + '_' +
              subSectionNumber, JSON.stringify(subLine));
          }
        }
      }
    },
    mousemove: function(event) {
      if (ismousedown === true) {
        console.log('Set width triggered');
        finX = event.pageX;
        finY = event.pageY;
        widget.width(finX - x);
        widget.height(finY - y);
        widget.css({
          'width': (finX - x) + '!important',
          'height': (finY - y) + '!important',
          'display': 'block',
          'border': '2px dashed #ccc',
        });
      }
    },
  });
});

/**
 * Check whether the given lat, lng is within the bounding rectangle.
 * @param {number} minLat
 * @param {number} maxLat
 * @param {number} minLng
 * @param {number} maxLng
 * @param {number} valLat
 * @param {number} valLng
 * @return {boolean}
 */
function withinBound(minLat, maxLat, minLng, maxLng, valLat, valLng) {
  if ((valLat >= minLat && valLat <= maxLat) &&
    (valLng >= minLng && valLng <= maxLng)) {
    return true;
  }
  return false;
}
