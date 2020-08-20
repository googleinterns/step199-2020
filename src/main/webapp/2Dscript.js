const apiKey = 'AIzaSyDCgKca9sLuoQ9xQDfHUvZf1_KAv06SoTU';

"use strict";
let test;
let map;
let maps = {};
let pose;
let data;
let id;
let type;
let currentLat;
let currentLong;
let flightPath;
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
    .then(() => { return fetch('\data') })
    .then(response => response.json())
    .then(json => data = json)
    .then(() => {
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

  flightPath = new google.maps.Polyline({
    path: poseCoordinates,
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });

  flightPath.setMap(map);



  const centerControlDiv = document.createElement('div');
  CenterControl(centerControlDiv);
  centerControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);

  // Add event listeners for selection box
  map.addListener("mousemove", function (event) {
    const latLng = event.latLng;
    currentLat = latLng.lat();
    currentLong = latLng.lng();
  })
  table = createSideTable(data);
  console.log(table);
  const sideControlDiv = document.createElement("div");
  SelectionPane(sideControlDiv, table);
  console.log(sideControlDiv);
  sideControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(sideControlDiv);

}

function SelectionPane(sideControlDiv, innerContent) {
  // Set CSS for the selection pane border.
  const selectionUI = document.createElement('div');
  selectionUI.className = 'selectionUI';
  selectionUI.title = 'Select the pose runs to view/render in 3D.';
  sideControlDiv.appendChild(selectionUI);

  // Set CSS for the selectin pane interior.
  const selectionText = document.createElement('div');
  selectionText.className = 'selectionText';
  selectionText.appendChild(innerContent);
  // Need to call a function to create a table with checkboxes here, likely write some generic function to do it with any JSON file possible. Also add checkbox as column and an eyeball icon with event listeners.
  selectionUI.appendChild(selectionText);
}

function CenterControl(controlDiv) {

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

function createSideTable(json) {
  const table = document.createElement('table');
  let headerRow = document.createElement('tr');
  let columnOne = document.createElement("th");
  columnOne.innerText = "RunID";
  let columnTwo = document.createElement("th");
  columnTwo.innerText = "Select";
  headerRow.appendChild(columnOne);
  headerRow.appendChild(columnTwo);
  table.appendChild(headerRow);
  let even = false;
  for (const key in json) {
    let currentRow = document.createElement('tr');
    currentRow.className = "visible";
    if (even) {
      currentRow.className += " even";
    }
    let keyEntry = document.createElement('td');
    keyEntry.innerText = key;
    currentRow.appendChild(keyEntry);

    let checkBoxEntry = document.createElement("td");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = key;
    input.addEventListener("click", function (event) {
      // Get the necessary content for this runId if not stored in the local cache.
      console.log("Checkbox event");
      const checkboxElement = event.target;
      // First check the localStorage cache. Instead of checking local storage, could instead fetch from the dictionary instead.
      let dataEntries = JSON.parse(sessionStorage.getItem(event.target.id));
      console.log("The id is:" + event.target.id);
      console.log("The event is" + event.target.toString());
      console.log("The checkbox is " + this.checked);
      if (this.checked) {
        if (dataEntries === null) {
          console.log("The id is:" + event.target.id);
          fetch("/getrun?id=" + event.target.id + "&dataType=pose").then(response => response.json())
            .then(data => dataEntries = data).then(() => {
              sessionStorage.setItem(event.target.id.toString(), JSON.stringify(dataEntries));
              plotLine(dataEntries);
            });
        }
        else {
          // Unplot this line.
          plotLine(dataEntries);
        }
      }
      else {
        // Handle this behavior here.
      }

    });
    checkBoxEntry.appendChild(input);
    currentRow.appendChild(checkBoxEntry);
    table.appendChild(currentRow);
    console.log(currentRow);
    even = !even;

  }
  return table;

}

function plotLine(dataEntries) {
  let currentLine = [];
  // now add the map with the selected color of the element
  for (let i = 0; i < dataEntries.length; i++) {
    currentLine.push({ lat: dataEntries[i].lat, lng: dataEntries[i].lng });
  }
  console.log(currentLine);
  currentLineGraph = new google.maps.Polyline({
    path: currentLine,
    geodesic: true,
    strokeColor: 'blue',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });
  flightPath.setMap(null);
  console.log("The value of map is " + map);
  currentLineGraph.setMap(map);
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
  let markerBottom;
  let markerTop;
  let subPath;
  let infoWindow;

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
            $('.widget').remove();
            if (infoWindow !== undefined)
              infoWindow.setMap(null);
            console.log("Mousedown set to false");
            ismousedown = false;
            // Here check the intersection by looping over the current different bounding rectangles and determining if they intersect.
            // Assume that the selection window doesn't contain any multiple parallel lines for simplicity (only chooose to display top if this is the case).
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
              if (withinBound(minLat, maxLat, minLng, maxLng, loopLat, loopLng)) {
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
            // console.log(subLine2D);
            // Can leave in extra parameters and that has no effect on the graphing.
            subPath = new google.maps.Polyline({
              path: subLine,
              geodesic: true,
              strokeColor: 'blue',
              strokeOpacity: 1.0,
              strokeWeight: 2
            });
            // Setup event listener to show option for 3D window when polyline is clicked.
            google.maps.event.addListener(subPath, 'click', function (event) {
              const latLng = event.latLng;
              console.log("Polyline clicked at lat: " + latLng.lat() + " lng: " + latLng.lng());
              infoWindow = new google.maps.InfoWindow({
                content: "<a href=/home.html?id=" + id + "&dataType=" + type + "&subSection=" + subSectionNumber + "&stored=true" + "> View in 3D </a>",
                position: latLng
              });
              infoWindow.setMap(map);
            }
            );

            subPath.setMap(map);

            markerBottom = new google.maps.Marker({
              position: { lat: discoveredMinLat, lng: discoveredMinLatPair },
              title: "Lat: " + discoveredMinLat + " Lng: " + discoveredMinLatPair
            });
            markerTop = new google.maps.Marker({
              position: { lat: discoveredMaxLngPair, lng: discoveredMaxLng },
              title: "Lat: " + discoveredMaxLngPair + " Lng: " + discoveredMaxLng
            });
            // At this point iterate through all the values to contruct a new line with the appropriate markers.
            markerBottom.setMap(map);
            markerTop.setMap(map);
            // Constant to account for possibility of multiple subsections.

            sessionStorage.setItem(id + '_' + type + '_' + subSectionNumber, JSON.stringify(subLine));

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
