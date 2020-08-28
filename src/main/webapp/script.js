/* Eslint disables ensure no warning for functions that are referenced within
the .html file. */
/**
* Create a table from the data service, loading all entries.
* As some point should likely fetch only part of the values at a time.
* @return {void}
*/
function createTable() { // eslint-disable-line no-unused-vars
  fetch('\data').then((response) => response.json()).then((json) => {
    const table = document.getElementById('pose-data');
    const headerRow = document.createElement('tr');
    const columnOne = document.createElement('th');
    columnOne.innerText = 'RunID';
    const columnTwo = document.createElement('th');
    columnTwo.innerText = 'DataType';
    headerRow.appendChild(columnOne);
    headerRow.appendChild(columnTwo);
    table.appendChild(headerRow);
    let even = false;
    for (const key in json) {
      if (json.hasOwnProperty(key)) {
        const currentRow = document.createElement('tr');
        currentRow.className = 'visible';
        if (even) {
          currentRow.className += ' even';
        }
        const keyEntry = document.createElement('td');
        keyEntry.innerText = key;
        currentRow.appendChild(keyEntry);
        console.log('The key is ' + key);
        // Create row goes here
        initializeRow(json, key, currentRow);
        table.appendChild(currentRow);
        even = !even;
      }
    }
  });
}
/**
 * Create a row in the given table.
 * @param {Object} json The JSON that is currently being parsed.
 * @param {String} key The key to lookup in the JSON element.
 * @param {Object} currentRow The currentRow to append the new elements too.
 * @return {Element}
 */
function initializeRow(json, key, currentRow) {
  let index = 0;
  for (const type of json[key]) {
    const columnEntry = document.createElement('td');
    console.log(type);
    console.log(type.toUpperCase());
    if ((type.toUpperCase() === 'POSE' && index === 0) ||
      (type.toUpperCase() === 'POINTCLOUD' && index === 1)) {
      const link = document.createElement('a');
      link.href = '/2DVisual.html?id=' + key + '&dataType=' + json[key];
      link.innerText = type;
      columnEntry.appendChild(link);
    } else {
      columnEntry.innerText = '';
    }
    currentRow.appendChild(columnEntry);
    index++;
  }
  return currentRow;
}
/**
* Filter table to only show elements that start with the input value
* @return {void}
*/
function filterTable() { // eslint-disable-line no-unused-vars
  const input = document.getElementById('searchQuery');
  // Change to capital when filtering so case doesn't matter (though in theory
  // two runs could be the same with different case)
  const filter = input.value.toUpperCase();
  const table = document.getElementById('pose-data');
  const tr = table.getElementsByTagName('tr');

  // Hide entries that don't start with the proper value.
  let even = false;
  for (i = 0; i < tr.length; i++) {
    // Grab the runId entry.
    td = tr[i].getElementsByTagName('td')[0];
    if (td) {
      txtValue = td.textContent || td.innerText;
      console.log('The text value is ' + txtValue);
      if (txtValue.toUpperCase().startsWith(filter)) {
        tr[i].className = 'visible';
        if (even) {
          tr[i].className += ' even';
        }
        even = !even;
      } else {
        tr[i].className = 'hidden';
      }
    }
  }
}
