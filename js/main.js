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

    const targetBytes =
      targetKB * 1024;

    function getSize(dataUrl) {

      return Math.round(
        dataUrl.length * 3 / 4
      );
    }

    function padData(
      dataUrl,
      targetSize
    ) {

      const current =
        getSize(dataUrl);

      const diff =
        targetSize - current;

      if (diff <= 0)
        return dataUrl;

      const parts =
        dataUrl.split(",");

      const header = parts[0];

      const base64 =
        parts[1].replace(
          /=+$/,
          ""
        );

      const padding =
        "A".repeat(
          Math.ceil(diff * 4 / 3)
        );

      return (
        header +
        "," +
        base64 +
        padding
      );
    }

    let min = 0.1;
    let max = 1;

    let best = "";
    let bestDiff = Infinity;

    for (let i = 0; i < 10; i++) {

      const quality =
        (min + max) / 2;

      const data =
        canvas.toDataURL(
          "image/jpeg",
          quality
        );

      const size =
        getSize(data);

      const diff =
        Math.abs(
          size - targetBytes
        );

      if (diff < bestDiff) {

        bestDiff = diff;
        best = data;
      }

      if (size > targetBytes) {
        max = quality;
      } else {
        min = quality;
      }
    }

    const finalData =
      padData(best, targetBytes);

   triggerDownload(
    finalData,
    fileName
  );

    const sizeKB =
      Math.round(
        getSize(finalData) / 1024
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

  const cropperImageId =
    popupId.replace(
      "Popup",
      "Image"
    );

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

  reader.onload =
    function (e) {

    cropperImage.src =
      e.target.result;

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
