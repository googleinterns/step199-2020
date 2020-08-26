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
    const columnThree = document.createElement('th');
    columnThree.innerText = 'Select';
    headerRow.appendChild(columnOne);
    headerRow.appendChild(columnTwo);
    headerRow.appendChild(columnThree);
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

    if ((type.toUpperCase() === 'POSE' && index === 0) ||
      (type.toUpperCase() === 'POINTCLOUD' && index === 1)) {
      const link = document.createElement('a');
      link.href = '/getrun?id=' + key + '&dataType=' + json[key];
      link.innerText = type;
      columnEntry.appendChild(link);
      currentRow.appendChild(columnEntry);
      /* Makes checkboxes for each data entry. */
      const checkbox = document.createElement('INPUT');
      checkbox.type = 'checkbox';
      checkbox.setAttribute('name', 'check');
      checkbox.setAttribute('value', link.getAttribute('name'));
      currentRow.appendChild(checkbox);
    } else {
      columnEntry.innerText = '';
      currentRow.appendChild(columnEntry);
    }
    index++;
  }
  return currentRow;
}

/* Select all Checkboxes function. */
function toggle(source) {
  checkboxes = document.getElementsByName('check');
  for (let i=0, n=checkboxes.length; i<n; i++) {
    checkboxes[i].checked = source.checked;
  }
}

/*
 * Make url for multiple runs selected. should be in the style of
 ** link.href = "/home.html?id=" + key + "&dataType=" + json[key]
 */
function makeMultiRunURL() {
  const checkboxes = document.getElementsByName('check');
  let count =0;
  const link = document.createElement('a');
  link.href = '/home.html?';

  for (let i=0, n=checkboxes.length; i<n; i++) {
    if (checkboxes[i].checked) {
      count++;
      console.log('here what we are splitting!' +
       checkboxes[i].getAttribute('value'));
      const splitInfo = checkboxes[i].getAttribute('value').split('_');
      link.href += 'id' + count + '=' + splitInfo[0] + '&type' +
      count + '=' + splitInfo[1]+ '-';
    }
  }
  link.href += 'count=' + count;
}
/*
 * Make json for multiple runs selected. should be in the same style of
 * fetch all files json from database.
 */
function makeMultiRunJson() {
  const checkboxes = document.getElementsByName('check');
  let str= '{';
  for (let i=0, n=checkboxes.length; i<n; i++) {
    if (checkboxes[i].checked) {
      console.log('here what we are splitting!' +
      checkboxes[i].getAttribute('value'));
      const splitInfo = checkboxes[i].getAttribute('value').split('_');
      str += '\n' + '"' + splitInfo[0] + '": [' + '\n "' +
      splitInfo[1] + '" \n ], \n';
    }
  }
  str += '}';
  console.log(str);
  sessionStorage.setItem('selected', str);
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
