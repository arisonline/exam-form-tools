function generateFileName(
  originalFileName,
  candidateInputId = null
) {

  /*
    DEFAULT NAME
  */

  let finalName =
    originalFileName;

  /*
    NO INPUT FIELD
  */

  if (!candidateInputId)
    return finalName;

  const input =
    document.getElementById(
      candidateInputId
    );

  /*
    INPUT NOT FOUND
  */

  if (!input)
    return finalName;

  const name =
    input.value.trim();

  /*
    EMPTY INPUT
  */

  if (name.length < 2)
    return finalName;

  /*
    PREFIX
  */

  const prefix =
    name
    .substring(0, 2)
    .toUpperCase();

  /*
    EXTENSION
  */

  let ext = ".jpg";

  if (
    originalFileName
    .toLowerCase()
    .includes(".png")
  ) {

    ext = ".png";

  } else if (
    originalFileName
    .toLowerCase()
    .includes(".pdf")
  ) {

    ext = ".pdf";
  }

  /*
    TYPE
  */

  let type =
    "PHOTO";

  if (
    originalFileName
    .toLowerCase()
    .includes("signature")
  ) {

    type =
      "SIGNATURE";

  } else if (
    originalFileName
    .toLowerCase()
    .includes("thumb")
  ) {

    type =
      "THUMB";

  } else if (
    originalFileName
    .toLowerCase()
    .includes("certificate")
  ) {

    type =
      "CERTIFICATE";
  }

  return (
    prefix +
    "_" +
    type +
    ext
  );
}
















function processResize(
  previewId,
  width,
  height,
  fileName,
  infoId,
  targetKB,
  candidateInputId = null,
  useNamePrefix = false
) {

  const preview =
    document.getElementById(previewId);

  if (!preview || !preview.src) {
    alert("No image found.");
    return;
  }

  /* =========================
     CUSTOM FILE NAME
  ========================= */
  fileName =
  generateFileName(
    fileName,
    useNamePrefix
      ? candidateInputId
      : null
  );
  
  /* =========================
     LOAD IMAGE
  ========================= */

  const img = new Image();

  img.crossOrigin = "anonymous";

  img.src = preview.src;

  img.onload = function () {

    const canvas =
      document.createElement(
        "canvas"
      );


    canvas.width = width;
    canvas.height = height;
    
    const ctx =
      canvas.getContext("2d");

    ctx.drawImage(
      img,
      0,
      0,
      canvas.width,
      canvas.height
    );



    const targetBytes =
      targetKB * 1024;
    
    /*
      GET SIZE
    */
    
    function getSize(
      dataUrl
    ) {
    
      return Math.round(
        (
          dataUrl.length * 3
        ) / 4
      );
    }
    
    /*
      PAD SMALL FILES
    */
    
    
    
    /*
      BINARY SEARCH
    */
    
    let minQuality =
      0.1;
    
    let maxQuality =
      1;
    
    let bestData =
      "";
    
    let bestDiff =
      Infinity;
    
    for (
      let i = 0;
      i < 10;
      i++
    ) {
    
      const quality =
        (
          minQuality +
          maxQuality
        ) / 2;
    
      const testData =
        canvas.toDataURL(
          "image/jpeg",
          quality
        );
    
      const size =
        getSize(
          testData
        );
    
      const diff =
        Math.abs(
          size -
          targetBytes
        );
    
      if (
        diff <
        bestDiff
      ) {
    
        bestDiff =
          diff;
    
        bestData =
          testData;
      }
    
      if (
        size >
        targetBytes
      ) {
    
        maxQuality =
          quality;
    
      } else {
    
        minQuality =
          quality;
      }
    }
    
    /*
      PAD IF TOO SMALL
    */
    

    fetch(bestData)
      .then(res => res.blob())
      .then(blob => {
      
        const currentBytes =
          blob.size;
      
        /*
          REAL PADDING
        */
      
        let finalBlob = blob;
      
        if (
          currentBytes <
          targetBytes
        ) {
      
          const paddingSize =
            targetBytes -
            currentBytes;
      
          const padding =
            new Uint8Array(
              paddingSize
            );
      
          finalBlob =
            new Blob(
              [
                blob,
                padding
              ],
              {
                type:
                  "image/jpeg"
              }
            );
        }
      
        /*
          REAL SIZE
        */
      
        const sizeKB =
          Math.round(
            finalBlob.size /
            1024
          );
      
        /*
          DOWNLOAD
        */
      
        const blobUrl =
          URL.createObjectURL(
            finalBlob
          );
      
        const link =
          document.createElement(
            "a"
          );
      
        link.href =
          blobUrl;
      
        link.download =
          fileName;
      
        document.body.appendChild(
          link
        );
      
        link.click();
      
        document.body.removeChild(
          link
        );
      
        URL.revokeObjectURL(
          blobUrl
        );
      
        /*
          INFO
        */
      
        const info =
          document.getElementById(
            infoId
          );
      
        if (info) {
      
          info.innerHTML =
            `Width: ${width}px<br>
             Height: ${height}px<br>
             Size: ${sizeKB} KB`;
      
          info.style.display =
            "block";
        }
      
      });
    


    const info =
      document.getElementById(
        infoId
      );

    if (info) {

      info.innerHTML =
        `Width: ${width}px<br>
         Height: ${height}px<br>
         Size: ${sizeKB} KB`;

      info.style.display =
        "block";
    }
  };
}













/* =========================================
   UNIVERSAL IMAGE
========================================= */

function resizeCroppedImage(
  previewId,
  width,
  height,
  fileName,
  infoId,
  targetKB = 100
) {

  let candidateInputId = null;

  /*
    Optional input support
  */

  if (
    document.getElementById(
      "candidateNamePhoto"
    )
  ) {

    candidateInputId =
      "candidateNamePhoto";
  }

  processResize(
    previewId,
    width,
    height,
    fileName,
    infoId,
    targetKB,
    candidateInputId,
    candidateInputId ? true : false
  );
}

/* =========================================
   UNIVERSAL SIGNATURE
========================================= */

function resizeCroppedSignature(
  previewId,
  width,
  height,
  fileName,
  infoId,
  targetKB = 50
) {

  processResize(
    previewId,
    width,
    height,
    fileName,
    infoId,
    targetKB,
    "candidateNameSign",
    true
  );
}

/* =========================================
   UNIVERSAL THUMB
========================================= */

function resizeCroppedThumb(
  previewId,
  width,
  height,
  fileName,
  infoId,
  targetKB = 80
) {

  processResize(
    previewId,
    width,
    height,
    fileName,
    infoId,
    targetKB,
    null,
    false
  );
}




async function resizeCertificatePdf(
  previewId,
  width,
  height,
  fileName,
  infoId,
  targetKB = 200
) {

  const preview =
    document.getElementById(
      previewId
    );

  if (
    !preview ||
    !preview.src
  ) {

    alert(
      "No image found."
    );

    return;
  }

  /*
    OPTIONAL CUSTOM NAME
  */

  fileName =
  generateFileName(
    fileName,
    "candidateNameCertificate"
  );
  
  
  const img =
    new Image();

  img.src =
    preview.src;

  img.onload =
    async function () {

    /*
      HIGH QUALITY CANVAS
    */

    const scale = 1.5;

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width =
      img.width * scale;

    canvas.height =
      img.height * scale;

    const ctx =
      canvas.getContext(
        "2d"
      );

    ctx.fillStyle =
      "#ffffff";

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.drawImage(
      img,
      0,
      0,
      canvas.width,
      canvas.height
    );

    /*
      TARGET SIZE
    */

    const targetBytes =
      targetKB * 1024;

    /*
      BINARY SEARCH
    */

    let minQuality =
      0.2;

    let maxQuality =
      1;

    let bestBlob =
      null;

    let bestDiff =
      Infinity;

    for (
      let i = 0;
      i < 8;
      i++
    ) {

      const quality =
        (
          minQuality +
          maxQuality
        ) / 2;

      const blob =
        await new Promise(
          resolve => {

          canvas.toBlob(
            resolve,
            "image/jpeg",
            quality
          );
        });

      const size =
        blob.size;

      const diff =
        Math.abs(
          size -
          targetBytes
        );

      if (
        diff <
        bestDiff
      ) {

        bestDiff =
          diff;

        bestBlob =
          blob;
      }

      if (
        size >
        targetBytes
      ) {

        maxQuality =
          quality;

      } else {

        minQuality =
          quality;
      }
    }

    /*
      FINAL IMAGE
    */

    const finalImage =
      await new Promise(
        resolve => {

        const reader =
          new FileReader();

        reader.onload =
          () =>
          resolve(
            reader.result
          );

        reader.readAsDataURL(
          bestBlob
        );
      });

    /*
      LOAD PDF LIB
    */
    
    await loadPdfLib();

    /*
      PDF
    */

    const { jsPDF } =
      window.jspdf;

    const pdf =
      new jsPDF({
        orientation:
          "portrait",
        unit: "mm",
        format: "a4",
        compress: true
      });

    const pageWidth =
      210;

    const pageHeight =
      297;

    const ratio =
      canvas.width /
      canvas.height;

    let pdfWidth =
      pageWidth;

    let pdfHeight =
      pdfWidth / ratio;

    if (
      pdfHeight >
      pageHeight
    ) {

      pdfHeight =
        pageHeight;

      pdfWidth =
        pdfHeight *
        ratio;
    }

    const x =
      (
        pageWidth -
        pdfWidth
      ) / 2;

    const y =
      (
        pageHeight -
        pdfHeight
      ) / 2;

    pdf.addImage(
      finalImage,
      "JPEG",
      x,
      y,
      pdfWidth,
      pdfHeight,
      undefined,
      "FAST"
    );

    /*
      OUTPUT PDF
    */

    const pdfBlob =
      pdf.output(
        "blob"
      );

    /*
      DOWNLOAD
    */

    const blobUrl =
      URL.createObjectURL(
        pdfBlob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href =
      blobUrl;

    link.download =
      fileName;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      blobUrl
    );

    /*
      INFO
    */

    const finalKB =
      Math.round(
        pdfBlob.size /
        1024
      );

    const info =
      document.getElementById(
        infoId
      );

    if (info) {

      info.innerHTML =
        `
        PDF Generated<br>
        Size:
        ${finalKB} KB
        `;

      info.style.display =
        "block";
    }
  };
}



















/* =========================================
   GLOBALS
========================================= */

let activeCropper = null;

let activePreviewId = "";
let activePopupId = "";
let activeLogoId = "";

/* =========================================
   SAFE DOWNLOAD
========================================= */

function triggerDownload(
  dataUrl,
  fileName
) {

  fetch(dataUrl)
    .then(res => res.blob())
    .then(blob => {

      const blobUrl =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = blobUrl;

      link.download =
        fileName;

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      URL.revokeObjectURL(
        blobUrl
      );
    });
}

/* =========================================
   UNIVERSAL CROPPER
========================================= */

async function showCropperPopup(
  inputId,
  previewId,
  popupId
) {

  const input =
    document.getElementById(
      inputId
    );

  if (
    !input ||
    !input.files ||
    !input.files[0]
  ) return;

  await loadCropper();

  activePreviewId =
    previewId;

  activePopupId =
    popupId;

  let cropperImageId = "";

    if (
      popupId ===
      "cropperPopupPhoto"
    ) {
    
      cropperImageId =
        "cropperImagePhoto";
    
    }
    
    else if (
      popupId ===
      "cropperPopupSignature"
    ) {
    
      cropperImageId =
        "cropperImageSignature";
    
    }
    
    else if (
      popupId ===
      "cropperPopupCertificate"
    ) {
    
      cropperImageId =
        "cropperImageCertificate";
    
    }
    
    else if (
      popupId ===
      "cropperPopupThumb"
    ) {
    
      cropperImageId =
        "cropperImageThumb";
    
    }

  const cropperImage =
    document.getElementById(
      cropperImageId
    );

  if (!cropperImage) {

    console.error(
      "Cropper image missing"
    );

    return;
  }

  if (
    previewId
    .toLowerCase()
    .includes("photo")
  ) {

    activeLogoId =
      "demoManLogoPhoto";

  } else if (
    previewId
    .toLowerCase()
    .includes("signature")
  ) {

    activeLogoId =
      "demoManLogoSignature";

  } else {

    activeLogoId =
      "demoManLogoThumb";
  }

  if (activeCropper) {

    activeCropper.destroy();

    activeCropper = null;
  }

  const reader =
    new FileReader();

  reader.onload = function (e) {

    cropperImage.onload = function () {
  
      const popup =
        document.getElementById(
          popupId
        );
  
      popup.style.display =
        "flex";
  
      activeCropper =
        new Cropper(
          cropperImage,
          {
            aspectRatio: NaN,
            viewMode: 1,
            autoCropArea: 1,
            responsive: true
          }
        );
    };
  
    cropperImage.src =
      e.target.result;
  };
  
  reader.readAsDataURL(
    input.files[0]
  );
}

/* =========================================
   HIDE POPUP
========================================= */

function hideCropperPopup(
  popupId
) {

  const popup =
    document.getElementById(
      popupId
    );

  if (popup) {

    popup.style.display =
      "none";
  }

  if (activeCropper) {

    activeCropper.destroy();

    activeCropper = null;
  }

  activePreviewId = "";
  activePopupId = "";
  activeLogoId = "";
}

/* =========================================
   CROP IMAGE
========================================= */

function cropImage() {

  if (!activeCropper)
    return;

  const canvas =
    activeCropper
    .getCroppedCanvas();

  if (!canvas)
    return;

  const dataUrl =
    canvas.toDataURL(
      "image/jpeg",
      1
    );

  const preview =
    document.getElementById(
      activePreviewId
    );

  if (!preview)
    return;

  preview.src =
    dataUrl;

  preview.style.display =
    "block";

  if (activeLogoId) {

    const logo =
      document.getElementById(
        activeLogoId
      );

    if (logo) {

      logo.style.display =
        "none";
    }
  }

  hideCropperPopup(
    activePopupId
  );
}






async function loadPdfLib() {

  if (window.jspdf)
    return;

  const script =
    document.createElement("script");

  script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

  document.body.appendChild(script);

  await new Promise(resolve => {
    script.onload = resolve;
  });
}







let cropperLoaded = false;

async function loadCropper() {

  if (cropperLoaded)
    return;

  /*
    LOAD CSS
  */

  await new Promise((resolve) => {

    const existingCss =
      document.querySelector(
        'link[data-cropper]'
      );

    if (existingCss) {

      resolve();

      return;
    }

    const css =
      document.createElement("link");

    css.rel =
      "stylesheet";

    css.href =
      "https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.css";

    css.setAttribute(
      "data-cropper",
      "true"
    );

    css.onload =
      resolve;

    document.head.appendChild(
      css
    );
  });

  /*
    LOAD JS
  */

  await new Promise((resolve) => {

    if (
      typeof Cropper !==
      "undefined"
    ) {

      resolve();

      return;
    }

    const script =
      document.createElement(
        "script"
      );

    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.js";

    script.onload =
      resolve;

    document.body.appendChild(
      script
    );
  });

  cropperLoaded = true;
}
