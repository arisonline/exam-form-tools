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

  if (
    useNamePrefix &&
    candidateInputId
  ) {

    const input =
      document.getElementById(
        candidateInputId
      );

    if (input) {

      const name =
        input.value.trim();

      if (name.length >= 2) {

        const prefix =
          name.substring(0, 2)
          .toUpperCase();

        const ext =
          fileName.includes(".png")
          ? ".png"
          : ".jpg";

        if (
          fileName
          .toLowerCase()
          .includes("signature")
        ) {
        
          fileName =
            prefix +
            "_SIGNATURE" +
            ext;
        
        }
        
        else if (
          fileName
          .toLowerCase()
          .includes("certificate")
        ) {
        
          fileName =
            prefix +
            "_CERTIFICATE" +
            ext;
        
        }
        
        else {
        
          fileName =
            prefix +
            "_PHOTO" +
            ext;
        }
      }
    }
  }

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
      width,
      height
    );

   const finalData =
    canvas.toDataURL(
      "image/jpeg",
      0.9
    );
  
  const sizeKB =
    Math.round(
      (
        finalData.length * 3 / 4
      ) / 1024
    ); 
    
   triggerDownload(
    finalData,
    fileName
  );


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

  const input =
    document.getElementById(
      "candidateNameCertificate"
    );

  if (input) {

    const name =
      input.value.trim();

    if (name.length >= 2) {

      const prefix =
        name
        .substring(0, 2)
        .toUpperCase();

      fileName =
        prefix +
        "_CERTIFICATE.pdf";
    }
  }

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

function showCropperPopup(
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
