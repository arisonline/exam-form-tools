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

    const link =
      document.createElement("a");

    link.href = finalData;

    link.download = fileName;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

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





function resizeCroppedImageACT(
  previewId,
  infoId
) {

  processResize(
    previewId,
    480,
    640,
    "act-photo.jpg",
    infoId,
    100,
    null,
    false
  );
}




function resizeCroppedImageCUET(
  previewId,
  infoId
) {

  processResize(
    previewId,
    100,
    130,
    "cuet-photo.jpg",
    infoId,
    100,
    "candidateNamePhoto",
    true
  );
}






let cropperPhoto;
let cropperSignature;
let cropperThumb;

/* =========================
   SHOW CROPPER
========================= */

function showCropperPopup(
  inputId,
  previewId,
  popupId
) {

  const input =
    document.getElementById(inputId);

  if (
    input.files &&
    input.files[0]
  ) {

    const reader =
      new FileReader();

    reader.onload = function (e) {

      const popup =
        document.getElementById(
          popupId
        );

      let cropperImageId = "";

      if (
        popupId ===
        "cropperPopupPhoto"
      ) {

        cropperImageId =
          "cropperImagePhoto";

      } else if (
        popupId ===
        "cropperPopupSignature"
      ) {

        cropperImageId =
          "cropperImageSignature";

      } else {

        cropperImageId =
          "cropperImageCertificate";
      }

      const image =
        document.getElementById(
          cropperImageId
        );

      image.src = e.target.result;

      popup.style.display =
        "flex";

      if (
        popupId ===
        "cropperPopupPhoto"
      ) {

        if (cropperPhoto)
          cropperPhoto.destroy();

        cropperPhoto =
          new Cropper(image, {
            aspectRatio: NaN,
            viewMode: 1
          });

      } else if (
        popupId ===
        "cropperPopupSignature"
      ) {

        if (cropperSignature)
          cropperSignature.destroy();

        cropperSignature =
          new Cropper(image, {
            aspectRatio: NaN,
            viewMode: 1
          });

      } else {

        if (cropperThumb)
          cropperThumb.destroy();

        cropperThumb =
          new Cropper(image, {
            aspectRatio: NaN,
            viewMode: 1
          });
      }
    };

    reader.readAsDataURL(
      input.files[0]
    );
  }
}

/* =========================
   HIDE CROPPER
========================= */

function hideCropperPopup(
  popupId
) {

  const popup =
    document.getElementById(
      popupId
    );

  popup.style.display =
    "none";

  if (
    popupId ===
    "cropperPopupPhoto"
  ) {

    if (cropperPhoto) {
      cropperPhoto.destroy();
      cropperPhoto = null;
    }

  } else if (
    popupId ===
    "cropperPopupSignature"
  ) {

    if (cropperSignature) {
      cropperSignature.destroy();
      cropperSignature = null;
    }

  } else {

    if (cropperThumb) {
      cropperThumb.destroy();
      cropperThumb = null;
    }
  }
}

/* =========================
   CROP IMAGE
========================= */

function cropImage() {

  if (cropperPhoto) {

    const canvas =
      cropperPhoto
      .getCroppedCanvas();

    const dataUrl =
      canvas.toDataURL();

    const preview =
      document.getElementById(
        "photoPreview"
      );

    preview.src = dataUrl;

    preview.style.display =
      "block";

    const logo =
      document.getElementById(
        "demoManLogoPhoto"
      );

    if (logo)
      logo.style.display =
      "none";

    hideCropperPopup(
      "cropperPopupPhoto"
    );
  }

  if (cropperSignature) {

    const canvas =
      cropperSignature
      .getCroppedCanvas();

    const dataUrl =
      canvas.toDataURL();

    const preview =
      document.getElementById(
        "signaturePreview"
      );

    preview.src = dataUrl;

    preview.style.display =
      "block";

    const logo =
      document.getElementById(
        "demoManLogoSignature"
      );

    if (logo)
      logo.style.display =
      "none";

    hideCropperPopup(
      "cropperPopupSignature"
    );
  }

  if (cropperThumb) {

    const canvas =
      cropperThumb
      .getCroppedCanvas();

    const dataUrl =
      canvas.toDataURL();

    const preview =
      document.getElementById(
        "CertificatePreview"
      );

    preview.src = dataUrl;

    preview.style.display =
      "block";

    const logo =
      document.getElementById(
        "demoManLogoThumb"
      );

    if (logo)
      logo.style.display =
      "none";

    hideCropperPopup(
      "cropperPopupCertificate"
    );
  }
}
