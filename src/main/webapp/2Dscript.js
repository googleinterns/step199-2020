const apiKey = 'AIzaSyDCgKca9sLuoQ9xQDfHUvZf1_KAv06SoTU';

"use strict";
let map;
let maps = {}; // Cache for map elements that have been loaded.
let datas = {}; // Cache for data elements that have been loaded.
let subsections ={} // An object in JSON format as follows:
/*
runId:{
 color: colorValue in hex,
 data: runData in (lat, lng)  Object
}
*/
let selectedSubSections = [] // A list of all the subsections that have been selected and should thus be displayed.
let boundingRectanges = {} // A map from the runId to the 4 coordinates of bounding rectangle, in the order [bottom left, bottom right, top left, top right]
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
  const headerRow = document.createElement('tr');
  const headerRowText = ["RunId", "Select", "Color", "View"];
  for (header of headerRowText) {
    let currentColumn = document.createElement("th");
    currentColumn.innerText = header;
    headerRow.appendChild(currentColumn);
  }

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
      console.log("The id is:" + event.target.id);
      console.log("The event is" + event.target.toString());
      console.log("The checkbox is " + this.checked);
      if (this.checked) {
        // First check the cache for this value.
        dataEntries = datas[event.target.id];
        console.log("The value of dataentries is " + dataEntries);
        // if the value is not found in the cache then fetch it.
        if (dataEntries === undefined) {
          console.log("Data Entries was false");
          console.log("The id is:" + event.target.id);
          fetch("/getrun?id=" + event.target.id + "&dataType=pose").then(response => response.json())
            .then(data => dataEntries = data).then(() => {
              datas[event.target.id] = dataEntries;
              const color = document.getElementById("color_" + event.target.id).value;
              const toGraph = plotLine(dataEntries, color);
              maps[event.target.id] = toGraph;
              toGraph.setMap(map);
            });
        }
        else {
          // Still plot the line, doesn't need to be asynchronous.
          // TODO(morleyd): abstract this out into a function.
          console.log("Dataentries was true");
          const color = document.getElementById("color_" + event.target.id).value;
          const toGraph = plotLine(dataEntries, color);
          maps[event.target.id] = toGraph
          toGraph.setMap(map);
        }
      }
      else {
        // In this case the box has become unchecked. We want to remove this graph.
        // We can only remove this box if it has been generated before and then can be removed appropriately.
        const toRemove = maps[event.target.id];
        if (toRemove)
          toRemove.setMap(null);
      }

    });
    let colorPickerEntry = document.createElement("td");
    const colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.id = "color_" + key;
    // Initialize each value to a random starting color.
    colorPicker.value = "#" + Math.floor(Math.random() * 16777215).toString(16);
    // Change the map graph color whenever a different color is selected.
    colorPicker.addEventListener("input", function (event) {
      const colorId = event.target.id;
      const runId = colorId.split("_")[1];
      console.log("Parsed run id is " + runId);
      const checkboxValue = document.getElementById(runId).checked;
      // Only add the run if the checkbox is checked and we have selected a new color.
      if (maps[runId] !== undefined && checkboxValue) {
        maps[runId].setMap(null);
        // Create plot with new color;
        maps[runId] = plotLine(datas[runId], event.target.value);
        maps[runId].setMap(map);
      }
    });
    colorPickerEntry.appendChild(colorPicker)

    let viewIconEntry = document.createElement("td");
    const viewIcon = document.createElement("div");
    viewIcon.id = "view_" + key;
    viewIcon.innerHTML = "<i class='fa fa-eye'></i>";
    viewIcon.addEventListener("click", function () {
      const viewId = this.id;
      const runId = viewId.split("_")[1];
      console.log("run id is " + runId);
      // Get latlng of the current element if there is one.
      const checkbox = document.getElementById(runId).checked;
      console.log("The checkbox value is " + checkbox);
      if (checkbox && datas[runId] !== undefined && maps[runId] !== undefined) {
        // Set the new center to be the first latlng value fetched from the data.
        const mapObject = datas[runId][0];
        map.setCenter({lat: mapObject.lat, lng: mapObject.lng});
      }


    });
    viewIconEntry.appendChild(viewIcon);

    // Create the color picker element to add to the table. Change color of the element (if it exists on its selection).

    checkBoxEntry.appendChild(input);
    currentRow.appendChild(checkBoxEntry);
    currentRow.appendChild(colorPickerEntry);
    currentRow.appendChild(viewIconEntry);
    table.appendChild(currentRow);
    console.log(currentRow);
    even = !even;

  }
  return table;

}

function plotLine(dataEntries, color) {
  let currentLine = [];
  // now add the map with the selected color of the element
  for (let i = 0; i < dataEntries.length; i++) {
    currentLine.push({ lat: dataEntries[i].lat, lng: dataEntries[i].lng });
  }
  console.log(currentLine);
  currentLineGraph = new google.maps.Polyline({
    path: currentLine,
    geodesic: true,
    strokeColor: color,
    strokeOpacity: 1.0,
    strokeWeight: 2
  });
  flightPath.setMap(null);
  console.log("The value of map is " + map);
  return currentLineGraph
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
