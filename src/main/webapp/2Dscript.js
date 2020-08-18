const apiKey = 'AIzaSyDCgKca9sLuoQ9xQDfHUvZf1_KAv06SoTU';

"use strict";
let test;
let map;
let pose;
let id;
let type;
let currentLat;
let currentLong;
// Define bounding box around the different data sets to quickly determined whether they should be included in the calculation or not
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
  // Occurs when google map api calls all promises, which is getting this function called somehow, according to stack trace.
  if (pose === undefined)
    return;

  console.log("initMap called");
  let poseCoordinates = [];
  for (let i = 0; i < pose.length; i++) {
    poseCoordinates.push({ lat: pose[i].lat, lng: pose[i].lng });
  }

  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: pose[0].lat, lng: pose[0].lng },
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

  // Add event listeners for selection box
  map.addListener("mousemove", function (event) {
    const latLng = event.latLng;
    currentLat = latLng.lat();
    currentLong = latLng.lng();
  })

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
  controlUI.addEventListener('click', function () {
    window.location.href = "/home.html?id=" + id + "&dataType=" + type;
  });

}

// When finished drawing the box, instead of leaving the widget, create markers at the current lat and intersection with the line.
$(function () {
  let widget;
  let x;
  let y;
  let finX;
  let finY;
  let priorLat;
  let priorLng;
  let ismousedown = false;

  $(document).on({
    mousedown: function (event) {
      console.log("event occurred");
      if (event.ctrlKey) {
        if (!ismousedown) {
          console.log("mousedown triggered");
          x = event.pageX;
          y = event.pageY;
          priorLat = currentLat;
          priorLng = currentLong;

          console.log("Remove widget");
          $('.widget').remove();
          $('body').append('<div class="widget" style="top:' + y + 'px; left: ' + x + 'px;"></div>');
          widget = $('.widget').last();
          ismousedown = true;
        }
        // Toggle the mouseDown state so same click used to set final.
      }
      else {
        // On the left click action.
        if (event.which === 1) {
          if (ismousedown) {
            console.log("Mousedown set to false");
            ismousedown = false;
            // Here check the intersection by looping over the current different bounding rectangles and determining if they intersect.
            // Assume that the selection window doesn't contain any multiple parallel lines for simplicity (only chooose to display top if this is the case).
            const minLat = Math.min(currentLat, priorLat);
            const maxLat = Math.max(currentLat, priorLat);
            const minLng = Math.min(currentLong, priorLng);
            const maxLng = Math.max(currentLong, priorLng);

            withinBound(minLat, maxLat, minLng, maxLng, currentVal)
            let marker = new google.maps.Marker({
              position: { lat: currentLat, lng: currentLong },
            });
            //at this point iterate through all the values to contruct a new line with the appropriate markers

            marker.setMap(map);

          }
        }
      }
    },
    mousemove: function (event) {
      if (ismousedown === true) {
        console.log("Set width triggered");
        finX = event.pageX;
        finY = event.pageY;
        widget.width(finX - x);
        widget.height(finY - y);
        widget.css({
          'width': (finX - x) + '!important',
          'height': (finY - y) + '!important',
          'display': 'block',
          'border': '2px dashed #ccc'
        });
      }
    }
  })
});

function withinBound(minLat, maxLat, minLng, maxLng, valLat, valLng) {
  if ((valLat >= minLat && valLat <= maxLat) && (valLng >= minLng && valLng <= maxLng)) {
    return true;
   }
   return false;
}
