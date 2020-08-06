let currentJson;
function loadUrls() {
    fetch('/data').then(response => response.json()).then(json => {
        const links = document.getElementById('myUL');
        currentJson = json;
        for (const key in json) {
            let li = document.createElement('li');
            let att = document.createElement('a');
            att.textContent = key + ":" + json[key];
            att.setAttribute('href', "/getrun?id=" + key + "&dataType=" + json[key]);
            console.log(att);
            li.appendChild(att);
            links.appendChild(li);
        }
    })
}