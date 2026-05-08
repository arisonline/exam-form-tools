```js
async function loadIncludes() {

  let headerPath = "/partials/header.html";
  let footerPath = "/partials/footer.html";

  // if inside tools folder
  if (window.location.pathname.includes("/tools/")) {
    headerPath = "../partials/header.html";
    footerPath = "../partials/footer.html";
  }

  const headerResponse = await fetch(headerPath);
  const footerResponse = await fetch(footerPath);

  document.getElementById("header").innerHTML =
    await headerResponse.text();

  document.getElementById("footer").innerHTML =
    await footerResponse.text();
}

loadIncludes();
```
