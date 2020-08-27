const apiKey = 'AIzaSyDCgKca9sLuoQ9xQDfHUvZf1_KAv06SoTU';

"use strict";
let map;
// Maps and data to be to one variable associated with the runId
let runs = {};
/*
runId:{
  map
  data
  subSection
  subData
  checkBox Element
  colorElement
  topMarker
  bottomMarker
}
*/

/*
Changes overview for tomorrow:
Change event listener for lines to generate the same popup
Create session storage element for all runs with their colors
Load in three.js and change color as well
Add shift click to select whole area instead of just intersect
*/


let subsections = {} // An object in JSON format as follows:
/*
runId:{
 color: colorValue in hex,
 data: runData in (lat, lng)  Object
}
*/
let selectedSubSections = [] // A list of all the subsections that have been selected and should thus be displayed.
let boundingRectangles = {} // A map from the runId to the 4 coordinates of bounding rectangle, in the order [bottom left, bottom right, top left, top right]
let initialPose;
let data;
let type;
let currentLat;
let currentLng;
let initialPoseData;

fetchData();
function fetchData() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  id = urlParams.get('id');
  type = urlParams.get('dataType');
  fetch('/getrun?id=' + id + '&dataType=' + type)
    .then(response => response.json())
    .then(data => initialPose = data)
    .then(() => { return fetch('\data') })
    .then(response => response.json())
    .then(json => data = json)
    .then(() => {
      initMap();
    })
}

function initMap() {
  // Occurs when google map api calls all promises, which is getting this function called somehow, according to stack trace.
  if (initialPose === undefined)
    return;

  let poseCoordinates = [];

  for (let i = 0; i < initialPose.length; i++) {
    poseCoordinates.push({ lat: initialPose[i].lat, lng: initialPose[i].lng });
  }
  if (initialPose.length === 0)
    return;
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: initialPose[0].lat, lng: initialPose[0].lng },
    zoom: 18
  });




  // Generate the central map button.
  const centerControlDiv = document.createElement('div');
  CenterControl(centerControlDiv);
  centerControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);
  // Generate the side selection pane.
  table = createSideTable(data);
  const sideControlDiv = document.createElement("div");
  SelectionPane(sideControlDiv, table);
  sideControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(sideControlDiv);

  // Add event listener to globally update lat and lng variables.
  map.addListener("mousemove", function (event) {
    const latLng = event.latLng;
    currentLat = latLng.lat();
    currentLng = latLng.lng();
  });
  // Click the selected run.
  runs[id].checkBox.click();
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
    // Initialize all runs in this loop.
    runs[key] = {};
    let currentRow = document.createElement('tr');
    currentRow.className = "visible";
    if (even) {
      currentRow.className += " even";
    }
    let keyEntry = document.createElement('td');
    keyEntry.innerText = key;
    currentRow.appendChild(keyEntry);

    let checkBoxEntry = document.createElement("td");
    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.id = key;
    checkBox.addEventListener("click", function (event) {
      // Get the necessary content for this runId if not stored in the local cache.
      console.log("Checkbox event");
      const checkboxElement = event.target;
      const targetId = checkboxElement.id;
      console.log("The id is:" + targetId);
      console.log("The event is" + checkboxElement.toString());
      console.log("The checkbox is " + this.checked);
      if (this.checked) {
        // First check the cache for this value.
        dataEntries = runs[event.target.id].data;
        // if the value is not found in the cache then fetch it.
        if (dataEntries === undefined) {
          console.log("Data Entries was false");
          console.log("The id is:" + event.target.id);
          fetch("/getrun?id=" + event.target.id + "&dataType=pose").then(response => response.json())
            .then(data => dataEntries = data).then(() => {
              console.log(targetId);
              console.log(runs);
              const color = runs[targetId].color.value;
              const toGraph = plotLine(dataEntries, color);
              runs[targetId].data = dataEntries;
              runs[targetId].map = toGraph;
              toGraph.setMap(map);
            });
        }
        else {
          // Still plot the line, doesn't need to be asynchronous.
          // TODO(morleyd): abstract this out into a function.
          console.log("Dataentries was true");
          console.log(event.target.id);
          console.log(runs);
          const color = runs[event.target.id].color.value;
          const toGraph = plotLine(dataEntries, color);
          runs[event.target.id].map = toGraph
          toGraph.setMap(map);
        }
      }
      else {
        // In this case the box has become unchecked. We want to remove this graph.
        // We can only remove this box if it has been generated before and then can be removed appropriately.
        const toRemove = runs[event.target.id].map;
        if (toRemove !== undefined)
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
      const checkboxValue = runs[runId].checkBox.checked;
      // Only add the run if the checkbox is checked and we have selected a new color.
      if (runs[runId].map !== undefined && checkboxValue) {
        runs[runId].map.setMap(null);
        // Create plot with new color;
        runs[runId].map = plotLine(runs[runId].data, event.target.value);
        runs[runId].map.setMap(map);
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
      const isChecked = runs[runId].checkBox.checked;
      console.log("The checkbox value is " + isChecked);
      if (isChecked && runs[runId].data !== undefined && runs[runId].map !== undefined) {
        // Set the new center to be the first latlng value fetched from the data.
        const mapObject = runs[runId].data[0];
        map.setCenter({ lat: mapObject.lat, lng: mapObject.lng });
      }


    });

    // Also save all these values to the object storing information on runId.
    runs[key].color = colorPicker;
    runs[key].checkBox = checkBox;
    viewIconEntry.appendChild(viewIcon);
    // Create the color picker element to add to the table. Change color of the element (if it exists on its selection).
    checkBoxEntry.appendChild(checkBox);
    currentRow.appendChild(checkBoxEntry);
    currentRow.appendChild(colorPickerEntry);
    currentRow.appendChild(viewIconEntry);
    table.appendChild(currentRow);
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
  const currentLineGraph = getPolyLine(currentLine, color, 1.0, 2);
  return currentLineGraph;
}

function getPolyLine(linePoints, color, opacity, weight, index = 1) {
  const polyLine = new google.maps.Polyline({
    path: linePoints,
    geodesic: true,
    strokeColor: color,
    strokeOpacity: opacity,
    strokeWeight: weight,
    zIndex: index
  });
  return polyLine;
}

let widget;
let x;
let y;
let finX;
let finY;
let priorLat;
let priorLng;
let isMouseDown = false;
let subPath;
let infoWindow;
const LEFTCLICK = 1;


// When finished drawing the box, instead of leaving the widget, create markers at the current lat and intersection with the line.
$(function () {
  $(document).on({
    mousedown: function (event) {
      console.log("event occurred");
      // Inital selection to draw the box.
      if (event.ctrlKey) {
        if (!isMouseDown) {
          console.log("mousedown triggered");
          placeRectangleStart();
        }
      }
      else {
        // Place the box.
        if (event.which === LEFTCLICK) {
          if (isMouseDown) {
            placeRectangleEnd();
          }
        }
      }
    },
    mousemove: genChangingBox
  })
});

function computeSubSection(pose, currentLat, priorLat, currentLng, priorLng) {
  const minLat = Math.min(currentLat, priorLat);
  const maxLat = Math.max(currentLat, priorLat);
  const minLng = Math.min(currentLng, priorLng);
  const maxLng = Math.max(currentLng, priorLng);
  console.log(pose);
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

  return { subLine, discoveredMinLat, discoveredMinLatPair, discoveredMaxLng, discoveredMaxLngPair };
}

function placeRectangleStart() {
  x = event.pageX;
  y = event.pageY;
  priorLat = currentLat;
  priorLng = currentLng;
  $('body').append('<div class="widget" style="top:' + y + 'px; left: ' + x + 'px;"></div>');
  widget = $('.widget').last();
  isMouseDown = true;
}
function placeRectangleEnd() {
  $('.widget').remove();

  // Iterate over all data values here, need to find a way to check the checkbox value, should likely store this in an object somewhere to prevent excess DOM queries.
  const mapRuns = Object.entries(runs);
  // Clear pop up window.
  if (infoWindow !== undefined)
    infoWindow.setMap(null);
  clearSelectedPaths(["subSection", "markerBottom", "markerTop"]);
  for ([id, currentRun] of mapRuns) {
    if (currentRun.checkBox.checked) {
      let { subLine, discoveredMinLat, discoveredMinLatPair, discoveredMaxLng, discoveredMaxLngPair } = computeSubSection(currentRun.data, currentLat, priorLat, currentLng, priorLng);
      // Clear prior paths, only display newly selected ones.
      const subSectionNumber = 1;
      currentRun.subData = subLine;
      currentRun.subSection = getPolyLine(subLine, "blue", 1.0, 2, 1000);
      // Setup event listener to show option for 3D window when polyline is clicked.
      currentRun.markerBottom = genMarker(discoveredMinLat, discoveredMinLatPair);
      currentRun.markerTop = genMarker(discoveredMaxLngPair, discoveredMaxLng);
      // Show the created elements.
      showAll([currentRun.subSection, currentRun.markerBottom, currentRun.markerTop]);
      // Constant to account for possibility of multiple subsections.
      // sessionStorage.setItem(id + '_' + type + '_' + subSectionNumber, JSON.stringify(subLine));
      isMouseDown = false;
    }
  }
  let subSectionObject = {};
  for ([id, currentRun] of mapRuns) {
    if (currentRun.checkBox.checked) {
      subSectionObject[id] = {};
      subSectionObject[id].color = currentRun.color.value;
      subSectionObject[id].data = currentRun.subData;
      console.log(subSectionObject);
      google.maps.event.addListener(currentRun.subSection, 'click', function (event) {
        console.log("subsection clicked");
        if (infoWindow !== undefined)
          infoWindow.setMap(null);

        const latLng = event.latLng;
        console.log("the latlng is" + latLng);

        const link = document.createElement("a");
        link.innerText = "View in 3D";
        link.href = "null";
        link.addEventListener("click", function (event) {
          event.preventDefault();
          sessionStorage.setItem("subsection", JSON.stringify(subSectionObject));
          window.location.href = "home.html?subsection=true";
        });
        infoWindow = new google.maps.InfoWindow({
          content: link,
          position: { lat: latLng.lat(), lng: latLng.lng() }
        });
        console.log(infoWindow);
        infoWindow.setMap(map);
      });
    }
  }
}
function genChangingBox(event) {
  if (isMouseDown) {
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
function genMarker(latitude, longitude) {
  const marker = new google.maps.Marker({
    position: { lat: latitude, lng: longitude },
    title: "Lat: " + latitude + " Lng: " + longitude
  });
  return marker;
}
function clearSelectedPaths(pathArray) {
  // Clear prior markers/path if they exist.
  const objects = Object.values(runs);
  for (val of objects) {
    // Now take all these 
    pathArray.forEach(function (current) {
      const property = val[current];
      if (property !== undefined) {
        property.setMap(null);
      }
    });
  }
}
function withinBound(minLat, maxLat, minLng, maxLng, valLat, valLng) {
  if ((valLat >= minLat && valLat <= maxLat) && (valLng >= minLng && valLng <= maxLng)) {
    return true;
  }
  return false;
}
function linkTo3D(event, id, type) {
  console.log("The value of the event is " + event);
  const latLng = event.latLng;
  infoWindow = new google.maps.InfoWindow({
    content: "<a href=/home.html?id=" + id + "&dataType=" + type + "&subSection=" + "1" + "&stored=true" + "> View in 3D </a>",
    position: latLng
  });
  infoWindow.setMap(map);
}

function showAll(elems) {
  elems.forEach(function (current) { current.setMap(map) });
}