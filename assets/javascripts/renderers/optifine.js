console.log("Loading renderer");

const downloadingProgressOf = document.getElementById("downloadingProgressOf");
const downloadingProgressMc = document.getElementById("downloadingProgressMc");
const installButton = document.getElementById("install");

/*






*/

window.electron.updateDownloadState((event, type, data) => {
  if (type == "of") {
    if (!data.finished) {
      downloadingProgressOf.innerText = Math.round(data.progrss) + "%";
      downloadingProgressOf.style.width = data.progrss + "%";
    } else {
      installButton.classList.remove("hidden");
      installButton.addEventListener("click", () => {
        window.electron.runInstaller(data.optifineJarPath);
      });
    }
  } else if (type == "mc") {
    if (!data.finished) {
      downloadingProgressMc.innerText = Math.round(data.progrss) + "%";
      downloadingProgressMc.style.width = data.progrss + "%";
    }
  }
});
