const apiKey = 'AIzaSyDCgKca9sLuoQ9xQDfHUvZf1_KAv06SoTU';

"use strict";
let test;
let map;
let pose;
let id;
let type;

fetchData();
function fetchData() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    id = urlParams.get('id');
    type = urlParams.get('dataType');
    fetch('/getrun?id=' + id + '&dataType=' + type)
    .then(response => response.json())
    .then(data => pose = data)
    .then(() => {
        console.log(pose);
        initMap();
    })
}

function initMap() {
  let poseCoordinates = [];
  for(let i = 0; i<pose.length; i++) {
    poseCoordinates.push({lat: pose[i].lat, lng: pose[i].lng});
  }

  map = new google.maps.Map(document.getElementById("map"), {
    center: {lat: pose[0].lat, lng: pose[0].lng},
    zoom: 18
  });

  let flightPath = new google.maps.Polyline({
    path: poseCoordinates,
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });

  flightPath.setMap(map);

  const centerControlDiv = document.createElement('div');
  const centerControl = new CenterControl(centerControlDiv, map);
  centerControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);
}

function CenterControl(controlDiv, map) {

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
    window.location.href = "/home.html?id=" + id + "&dataType=" + type;
  });

}

