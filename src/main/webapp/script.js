let currentJson;
function loadUrls() {
    fetch('/data').then(response => response.json()).then(json => {
        const links = document.getElementById('myUL');
        currentJson = json;
        for (const key in json) {
            let li = document.createElement('li');
            let att = document.createElement('a');
            att.textContent = key + ":" + json[key];
            att.setAttribute('href', "/home.html?id=" + key + "&dataType=" + json[key]);
            console.log(att);
            li.appendChild(att);
            links.appendChild(li);
        }
    })
}

// table syntax <table> <tr> <th> </th> <th> </th> <th> </th> </tr> </table>.
// predefine expected table columns pose pointcloud.
// Use row span to have header span multiple entries.

// At some point likely will not load all entries as there will be too many for this to be efficient, find better way to handle this.
function createTable() {
    fetch('\data').then(response => response.json()).then(json => {
        const table = document.getElementById('pose-data');
        let headerRow = document.createElement('tr');
        let columnOne = document.createElement("th");
        columnOne.innerText = "RunID";
        let columnTwo = document.createElement("th");
        columnTwo.innerText = "DataType";
        headerRow.appendChild(columnOne);
        headerRow.appendChild(columnTwo);
        table.appendChild(headerRow);
        let even = false;
        for (const key in json) {
            let currentRow = document.createElement('tr');
            currentRow.className = "visible";
            if(even){
                currentRow.className += " even";
            }
            let keyEntry = document.createElement('td');
            keyEntry.innerText = key;
            currentRow.appendChild(keyEntry);
            console.log("The key is " + key);
            let index = 0;
            for (const type of json[key]) {
                let columnEntry = document.createElement("td");
                console.log(type);
                console.log(type.toUpperCase())
                if ((type.toUpperCase() === "POSE" && index === 0) || (type.toUpperCase() === "POINTCLOUD" && index === 1)) {
                    let link = document.createElement("a");
                    link.href = "/2DVisual.html?id=" + key + "&dataType=" + json[key];
                    link.innerText = type;
                    columnEntry.appendChild(link);
                }
                else {
                    columnEntry.innerText = "";
                }
                currentRow.appendChild(columnEntry);
                index++;
            }
            table.appendChild(currentRow);
            even = !even;
        }
        // Loop through all the keys and add those as a table element, then add all their respective keys.
    })
}

function filterTable() {
    const input = document.getElementById("searchQuery");
    // Change to capital when filtering so case doesn't matter (though in theory two runs could be the same with different case)
    const filter = input.value.toUpperCase();
    const table = document.getElementById("pose-data");
    const tr = table.getElementsByTagName("tr");

    // Hide entries that don't start with the proper value.
    let even = false;
    for (i = 0; i < tr.length; i++) {
        // Grab the runId entry.
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            txtValue = td.textContent || td.innerText;
            console.log("The text value is "+txtValue);
            if (txtValue.toUpperCase().startsWith(filter)) {
                tr[i].className = "visible";
                if(even){
                    tr[i].className +=" even";
                }
                even = !even;
            } else {
                tr[i].className = "hidden";
            }
        }
    }
}