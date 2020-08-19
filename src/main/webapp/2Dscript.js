// Gobal variables.
let map;
let pose;
let runId;
let dataType;

fetchData();
/**
 * Fetchs pose data from the RunInfo servlet,
 * it is an asynchronous call requiring initMap() to be
 * called after the data is fully loaded.
 */
function fetchData() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  runId = urlParams.get('id');
  dataType = urlParams.get('dataType');
  fetch('/getrun?id=' + runId + '&dataType=' + dataType)
      .then((response) => response.json())
      .then((data) => pose = data)
      .then(() => initMap());
}

/**
 * Embeds the Google map interface within the html
 * along with drawing the pose trajectory and adding a button link.
 */
function initMap() {
  // Intitalizes the map.
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
  // Adds the button called from CenterControl().
  const centerControlDiv = document.createElement('div');
  addCenterControl(centerControlDiv, map);
  centerControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);
}

/**
 * Changes the pose data to a format
 * the Google maps javascript api can read.
 * @return {dictionary} Returns the formatted pose data dictionary.
 */
function formatPoseData() {
  const poseCoordinates = [];
  for (point of pose) {
    poseCoordinates.push({lat: point.lat, lng: point.lng});
  }
  return poseCoordinates;
}

/**
 * Creates the html elements inside of the button,
 * along with adding a link to the 3DVisual.html page.
 * @param {Element} controlDiv This is the main/parent element of the button.
 */
function addCenterControl(controlDiv) {
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
    window.location.href = '/3DVisual.html?id=' +
    runId + '&dataType=' + dataType;
  });
}
