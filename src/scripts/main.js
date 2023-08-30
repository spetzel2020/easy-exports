import { warn, error, debug, i18n } from "./lib/lib.js";
import CONSTANTS from "./constants.js";
import { setApi } from "../module.js";
import API from "./api.js";
import { EasyExport } from "./EasyExports.js";

// export let BCCBASE;

export const initHooks = async () => {
  // Hooks.once("socketlib.ready", registerSocket);
  // registerSocket();
  EasyExport.init();
};

export const setupHooks = async () => {
  setApi(API);
};

export const readyHooks = () => {
  //Add the Easy Export button on the relevant popouts and a listener
  Hooks.on(`renderSidebarTab`, async (sidebarTab, html, data) => {
    if (!sidebarTab.popOut) {
      return;
    }
    //If this is one of the exportable sections in a pop-out
    const easyExportHtml = `
    <a id='easy-export' class='export'>
        <i class='fas fa-file'></i>${game.i18n.localize("easy-exports.Title")}
    </a>`;
    //v0.6.2: Support Macro Folders module which changes the tab name to "macro"
    switch (sidebarTab.tabName) {
      case "scenes":
      case "actors":
      case "items":
      case "journal":
      case "playlists":
      case "tables":
      case "macros":
      case "macro":
        html.find(".window-header").children(".close").before(easyExportHtml);
        html.find("#easy-export").click(API.easyExport.exportOrImportDirectoryDialog.bind(sidebarTab));
        break;
      default:
        break;
    }
  });

  Hooks.on("getJournalDirectoryFolderContext", (html, options) => {
    options.push({
      name: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.label.folder-import-export`),
      icon: '<i class="far fa-lightbulb"></i>',
      condition: (header) => {
        const folderId = header.parent().data("folderId");
        const folderObject = game.folders?.get(folderId) || game.folders?.getName(folderId);
        if (game.user?.isGM) {
          return true;
        } else {
          return false;
        }
      },
      callback: async (header) => {
        const folderId = header.parent().data("folderId");
        const folderObject = game.folders?.get(folderId) || game.folders?.getName(folderId);
        // TODO something
      },
    });
  });

  Hooks.on("getItemDirectoryFolderContext", (html, options) => {
    options.push({
      name: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.label.folder-import-export`),
      icon: '<i class="far fa-lightbulb"></i>',
      condition: (header) => {
        const folderId = header.parent().data("folderId");
        const folderObject = game.folders?.get(folderId) || game.folders?.getName(folderId);
        if (game.user?.isGM) {
          return true;
        } else {
          return false;
        }
      },
      callback: async (header) => {
        const folderId = header.parent().data("folderId");
        const folderObject = game.folders?.get(folderId) || game.folders?.getName(folderId);
        // TODO something
      },
    });
  });
  Hooks.on("getActorDirectoryFolderContext", (html, options) => {
    options.push({
      name: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.label.folder-import-export`),
      icon: '<i class="far fa-lightbulb"></i>',
      condition: (header) => {
        const folderId = header.parent().data("folderId");
        const folderObject = game.folders?.get(folderId) || game.folders?.getName(folderId);
        if (game.user?.isGM) {
          return true;
        } else {
          return false;
        }
      },
      callback: async (header) => {
        const folderId = header.parent().data("folderId");
        const folderObject = game.folders?.get(folderId) || game.folders?.getName(folderId);
        // TODO something
      },
    });
  });
  Hooks.on("getRollTableDirectoryFolderContext", (html, options) => {
    options.push({
      name: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.label.folder-import-export`),
      icon: '<i class="far fa-lightbulb"></i>',
      condition: (header) => {
        const folderId = header.parent().data("folderId");
        const folderObject = game.folders?.get(folderId) || game.folders?.getName(folderId);
        if (game.user?.isGM) {
          return true;
        } else {
          return false;
        }
      },
      callback: async (header) => {
        const folderId = header.parent().data("folderId");
        const folderObject = game.folders?.get(folderId) || game.folders?.getName(folderId);
        // TODO something
      },
    });
  });
  Hooks.on("getSceneDirectoryFolderContext", (html, options) => {
    options.push({
      name: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.label.folder-import-export`),
      icon: '<i class="far fa-lightbulb"></i>',
      condition: (header) => {
        const folderId = header.parent().data("folderId");
        const folderObject = game.folders?.get(folderId) || game.folders?.getName(folderId);
        if (game.user?.isGM) {
          return true;
        } else {
          return false;
        }
      },
      callback: async (header) => {
        const folderId = header.parent().data("folderId");
        const folderObject = game.folders?.get(folderId) || game.folders?.getName(folderId);
        // TODO something
      },
    });
  });

  Hooks.on("getCardsDirectoryFolderContext", (html, options) => {
    options.push({
      name: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.label.folder-import-export`),
      icon: '<i class="far fa-lightbulb"></i>',
      condition: (header) => {
        const folderId = header.parent().data("folderId");
        const folderObject = game.folders?.get(folderId) || game.folders?.getName(folderId);
        if (game.user?.isGM) {
          return true;
        } else {
          return false;
        }
      },
      callback: async (header) => {
        const folderId = header.parent().data("folderId");
        const folderObject = game.folders?.get(folderId) || game.folders?.getName(folderId);
        // TODO something
      },
    });
  });
};
