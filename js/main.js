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

        fileName =
          prefix + "_PHOTO" + ext;
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



function resizeCertificatePdf(
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

  if (!preview || !preview.src) {

    alert("No image found.");

    return;
  }

  const img = new Image();

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

    const imageData =
      canvas.toDataURL(
        "image/jpeg",
        0.9
      );

    const { jsPDF } =
      window.jspdf;

    const pdf =
      new jsPDF();

    pdf.addImage(
      imageData,
      "JPEG",
      10,
      10,
      100,
      130
    );

    pdf.save(fileName);

    const info =
      document.getElementById(
        infoId
      );

    if (info) {

      info.innerHTML =
        "PDF Generated";

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

  const link =
    document.createElement("a");

  link.href = dataUrl;

  link.download =
    fileName;

  document.body.appendChild(
    link
  );

  setTimeout(() => {

    link.click();

    document.body.removeChild(
      link
    );

  }, 100);
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
