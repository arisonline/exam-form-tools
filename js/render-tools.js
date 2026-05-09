```js id="l7z8mw"
const toolsGrid =
document.getElementById("toolsGrid");

if(toolsGrid){

  tools.slice(0,8).forEach(tool => {

    toolsGrid.innerHTML += `

    <div class="tool-card">

      <div class="tool-top">

        <div class="tool-icon">
          <i class="fas ${tool.icon}"></i>
        </div>

        <h3>${tool.title}</h3>

        <p>
          ${tool.description}
        </p>

      </div>

      <div class="tool-bottom">

        <a
        href="${tool.url}"
        class="tool-btn">
          Open Tool
        </a>

      </div>

    </div>

    `;

  });

}
```
