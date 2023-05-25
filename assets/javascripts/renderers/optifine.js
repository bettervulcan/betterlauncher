console.log("Loading renderer");

const downloadingProgress = document.getElementById("downloadingProgress");
const installButton = document.getElementById("install");

window.electron.updateDownloadState((event, data) => {
  if (!data.finished) {
    downloadingProgress.innerText = Math.round(data.progrss) + "%";
    downloadingProgress.style.width = data.progrss + "%";
  } else {
    installButton.classList.remove("hidden");
    installButton.addEventListener("click", () => {
      window.electron.runInstaller(data.optifineJarPath);
    });
  }
});
