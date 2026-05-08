async function loadIncludes() {

  const isToolPage =
    window.location.pathname.includes("/tools/");

  const headerPath = isToolPage
    ? "../partials/header.html"
    : "./partials/header.html";

  const footerPath = isToolPage
    ? "../partials/footer.html"
    : "./partials/footer.html";

  const header = await fetch(headerPath);
  const footer = await fetch(footerPath);

  document.getElementById("header").innerHTML =
    await header.text();

  document.getElementById("footer").innerHTML =
    await footer.text();
}

window.addEventListener("DOMContentLoaded", loadIncludes);
