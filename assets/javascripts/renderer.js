console.log("Loading renderer");

document.addEventListener("DOMContentLoaded", async () => {
  switchView("#welcome", "#welcome");

  const runClientButton = document.getElementById("runClient");
  const openLoginMS = document.getElementById("openLoginMS");
  const accountsList = document.getElementById("accountsList");
  const dropdownAccountButton = document.getElementById(
    "dropdownAccountButton"
  );
  const versionsList = document.getElementById("versionsList");
  const dropdownVersionButton = document.getElementById(
    "dropdownVersionButton"
  );

  dropdownAccountButton.addEventListener("click", async () => {
    accountsList.innerHTML = "";
    // console.log(await window.electron.getAccounts());
    await window.electron.getAccounts().accounts.forEach((account) => {
      const li = document.createElement("li");
      li.innerHTML = `<a id="selectAccountTrigger" data-mc-uuid="${account.uuid}" class="block cursor-pointer font-bold px-4 py-2 select-text hover:bg-[#865DFF] dark:hover:text-white hover:transition-all transition-all duration-300"> ${account.displayName}</a>`;
      accountsList.appendChild(li);
    });

    const selectAccountTriggers = document.querySelectorAll(
      "#selectAccountTrigger"
    );
    selectAccountTriggers.forEach((selectAccountTrigger) => {
      selectAccountTrigger.addEventListener("click", () => {
        window.electron.selectAccount(selectAccountTrigger.dataset.mcUuid);
        switchView(currentView, "#versions");
      });
    });
  });

  dropdownVersionButton.addEventListener("click", async () => {
    versionsList.innerHTML = "";
    // console.log(await window.electron.getLastVersions());
    await window.electron.getLastVersions().forEach((version) => {
      const li = document.createElement("li");
      li.innerHTML = `<a id="selectVerionTrigger" data-mc-uuid="${version}" class="block font-bold px-4 py-2 select-text hover:bg-[#865DFF] dark:hover:text-white hover:transition-all transition-all duration-300"> ${version}</a>`;
      versionsList.appendChild(li);
    });

    const selectVersionTriggers = document.querySelectorAll(
      "#selectVerionTrigger"
    );
    selectVersionTriggers.forEach((selectVersionTrigger) => {
      selectVersionTrigger.addEventListener("click", () => {
        window.electron.selectVersion(selectVersionTrigger.dataset.mcUuid);
        switchView(currentView, "#run");
        const summary = window.electron.getSummary();
        document.getElementById(
          "dynamicVersion"
        ).innerText = `Uruchom ${summary.versionNameSelected}`;
        document.getElementById(
          "dynamicPlayer"
        ).innerText = `Uruchamiasz grę jako ${summary.accountObjSelected.displayName}`;
      });
    });
  });

  openLoginMS.addEventListener("click", () => {
    window.electron.openLoginMS();
  });

  runClientButton.addEventListener("click", () => {
    window.electron.runClient();
  });

  const openVersionModalButton = document.getElementById(
    "openVersionModalButton"
  );
  const firstTable = document.getElementById("firstTable");
  const secondTable = document.getElementById("secondTable");
  const installedCategoryButton = document.getElementById("instCategoryButton"),
    releaseCategoryButton = document.getElementById("releaseCategoryButton"),
    snapshotCategoryButton = document.getElementById("snapshotCategoryButton"),
    alphaCategoryButton = document.getElementById("alphaCategoryButton"),
    fabricCategoryButton = document.getElementById("fabricCategoryButton"),
    forgeCategoryButton = document.getElementById("forgeCategoryButton"),
    optifineCategoryButton = document.getElementById("optifineCategoryButton");

  openVersionModalButton.addEventListener("click", () => {
    changeFirstTable("installed");
  });
  installedCategoryButton.addEventListener("click", () => {
    changeFirstTable("installed");
  });
  releaseCategoryButton.addEventListener("click", () => {
    changeFirstTable("release");
  });
  snapshotCategoryButton.addEventListener("click", () => {
    changeFirstTable("snapshot");
  });
  alphaCategoryButton.addEventListener("click", () => {
    changeFirstTable("alpha");
  });
  fabricCategoryButton.addEventListener("click", () => {
    changeFirstTable("fabric");
  });
  forgeCategoryButton.addEventListener("click", () => {
    changeFirstTable("forge");
  });
  optifineCategoryButton.addEventListener("click", () => {
    changeFirstTable("optifine");
  });

  const addFirstTableVersion = (version) => {
    const button = document.createElement("button");
    firstTable.style.display = "block";
    button.className =
      "relative inline-flex items-center w-full px-4 py-2 text-sm first:rounded-t-lg last:rounded-b-lg font-medium border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-[#E384FF] dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-500 dark:focus:text-white";
    button.innerText = `${version}`;
    button.dataset.preVersion = version;
    button.id = "secondTableTrigger";
    firstTable.appendChild(button);
  };

  const clearFirstTable = () => {
    firstTable.style.display = "none";
    firstTable.innerHTML = "";
  };

  const addSecondTableVersion = (version) => {
    const button = document.createElement("button");
    secondTable.style.display = "block";
    button.className =
      "relative inline-flex items-center w-full px-4 py-2 text-sm font-medium first:rounded-t-lg last:rounded-b-lg border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-[#E384FF] dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-500 dark:focus:text-white";
    button.innerText = `${version}`;
    secondTable.appendChild(button);
  };

  const clearSecondTable = () => {
    secondTable.style.display = "none";
    secondTable.innerHTML = "";
  };

  const changeFirstTable = (category) => {
    switch (category) {
      case "installed":
        console.log("installed");
        clearFirstTable();
        clearSecondTable();
        window.electron.getInstalledVersions().forEach((version) => {
          addFirstTableVersion(version);
        });
        break;
      case "release":
        clearFirstTable();
        clearSecondTable();
        // console.log("release", window.electron.getVersionsByType("release"));
        window.electron.getVersionsByType("release").forEach((version) => {
          addFirstTableVersion(version[version.length - 1]);
          version.forEach((test) => {
            console.log(version[version.length - 1], test);
          });
          document
            .querySelectorAll("#secondTableTrigger")
            .forEach((trigger) => {
              trigger.addEventListener("click", () => {
                (async () => {
                  clearSecondTable();
                  setTimeout(() => {
                    version.forEach((subVer) => {
                      if (
                        version[version.length - 1].includes(
                          trigger.dataset.preVersion
                        )
                      ) {
                        addSecondTableVersion(subVer);
                      }
                    });
                  }, 100);
                })();
              });
            });
        });
        break;
      case "snapshot":
        console.log("snapshot");
        clearFirstTable();
        clearSecondTable();
        break;
      case "alpha":
        console.log("alpha");
        clearFirstTable();
        clearSecondTable();
        break;
      case "fabric":
        console.log("fabric");
        clearFirstTable();
        clearSecondTable();
        break;
      case "forge":
        console.log("forge");
        clearFirstTable();
        clearSecondTable();
        break;
      case "optifine":
        console.log("optifine");
        clearFirstTable();
        clearSecondTable();
        break;
    }
  };
});
