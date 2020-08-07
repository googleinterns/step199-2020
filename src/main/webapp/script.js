/**
* Load links in a list for all runs in the current database
* @return {void}
*/
function loadUrls() {
  fetch('/data').then((response) => response.json()).then((json) => {
    const links = document.getElementById('myUL');
    for (const key in json) {
      if (Object.prototype.hasOwnProperty.call(json, key)) {
        const li = document.createElement('li');
        const att = document.createElement('a');
        att.textContent = key + ':' + json[key];
        att.setAttribute('href', '/getrun?id=' +
                    key + '&dataType=' + json[key]);
        console.log(att);
        li.appendChild(att);
        links.appendChild(li);
      }
    }
  });
}
loadUrls();
