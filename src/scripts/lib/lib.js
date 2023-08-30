// =================================
// Logger Utility
// ================================

import CONSTANTS from "../constants.js";

// export let debugEnabled = 0;
// 0 = none, warnings = 1, debug = 2, all = 3

export function debug(msg, args = "") {
  if (game.settings.get(CONSTANTS.MODULE_ID, "debug")) {
    console.log(`DEBUG | ${CONSTANTS.MODULE_ID} | ${msg}`, args);
  }
  return msg;
}

export function log(message) {
  message = `${CONSTANTS.MODULE_ID} | ${message}`;
  console.log(message.replace("<br>", "\n"));
  return message;
}

export function notify(message) {
  message = `${CONSTANTS.MODULE_ID} | ${message}`;
  ui.notifications?.notify(message);
  console.log(message.replace("<br>", "\n"));
  return message;
}

export function info(info, notify = false) {
  info = `${CONSTANTS.MODULE_ID} | ${info}`;
  if (notify) ui.notifications?.info(info);
  console.log(info.replace("<br>", "\n"));
  return info;
}

export function warn(warning, notify = false) {
  warning = `${CONSTANTS.MODULE_ID} | ${warning}`;
  if (notify) ui.notifications?.warn(warning);
  console.warn(warning.replace("<br>", "\n"));
  return warning;
}

export function error(error, notify = true) {
  error = `${CONSTANTS.MODULE_ID} | ${error}`;
  if (notify) ui.notifications?.error(error);
  return new Error(error.replace("<br>", "\n"));
}

export function timelog(message) {
  warn(Date.now(), message);
}

export const i18n = (key) => {
  return game.i18n.localize(key)?.trim();
};

export const i18nFormat = (key, data = {}) => {
  return game.i18n.format(key, data)?.trim();
};

// export const setDebugLevel = (debugText: string): void => {
//   debugEnabled = { none: 0, warn: 1, debug: 2, all: 3 }[debugText] || 0;
//   // 0 = none, warnings = 1, debug = 2, all = 3
//   if (debugEnabled >= 3) CONFIG.debug.hooks = true;
// };

export function dialogWarning(message, icon = "fas fa-exclamation-triangle") {
  return `<p class="${CONSTANTS.MODULE_ID}-dialog">
          <i style="font-size:3rem;" class="${icon}"></i><br><br>
          <strong style="font-size:1.2rem;">${CONSTANTS.MODULE_ID}</strong>
          <br><br>${message}
      </p>`;
}

// =============================================================================================

export function manageNameForEntity(jsonFileName, entity) {
  const systemId = game.system.id;
  const worldId = game.world.id;
  const entityName = convertToValidFilename(entity.name);
  const isoDateString = toISOStringCustom(new Date());
  let newName = jsonFileName;
  if (entity.system.level) {
    newName = addPrefixToFileName(
      newName,
      isoDateString + "_" + entityName + "_LV" + level + "_" + worldId + "_" + systemId
    );
  } else {
    newName = addPrefixToFileName(newName, isoDateString + "_" + entityName + "_" + worldId + "_" + systemId);
  }
  return newName;
}

export function manageNameForFolder(jsonFileName, entity) {
  const systemId = game.system.id;
  const worldId = game.world.id;
  const entityName = convertToValidFilename(entity.name ? entity.name : entity);
  const isoDateString = toISOStringCustom(new Date());
  let newName = jsonFileName;

  newName = addPrefixToFileName(newName, isoDateString + "_" + entityName + "_" + worldId + "_" + systemId);
  return newName;
}

function convertToValidFilename(string) {
  return string.replace(/[\/|\\:*?"<>.]/g, " ");
}

function addSuffixToFileName(fileNameOld, suffix) {
  let [fileName, fileExtension] = fileNameOld.split(".");
  let newFileName = fileName + "_" + suffix;
  return newFileName + "." + fileExtension;
}

function addPrefixToFileName(fileNameOld, prefix) {
  let [fileName, fileExtension] = fileNameOld.split(".");
  let newFileName = prefix + "_" + fileName;
  return newFileName + "." + fileExtension;
}

function toISOStringCustom(date) {
  // return date.getUTCFullYear() + '-' +
  //   String(date.getUTCMonth() + 1).padStart(2, '0') + '-' +
  //   String(date.getUTCDate()).padStart(2, '0') + 'T' +
  //   String(date.getUTCHours()).padStart(2, '0') + ':' +
  //   String(date.getUTCMinutes()).padStart(2, '0') + ':' +
  //   String(date.getUTCSeconds()).padStart(2, '0') + '.' +
  //   String(date.getUTCMilliseconds()).padStart(3, '0') + 'Z';
  return (
    date.getUTCFullYear() +
    "-" +
    String(date.getUTCMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getUTCDate()).padStart(2, "0") +
    "_" +
    String(date.getUTCHours()).padStart(2, "0") +
    "-" +
    String(date.getUTCMinutes()).padStart(2, "0") +
    "-" +
    String(date.getUTCSeconds()).padStart(2, "0")
  );
}

/**
 * Export data content to be saved to a local file
 * @param {string} data       Data content converted to a string
 * @param {string} type       The type of
 * @param {string} filename   The filename of the resulting download
 */
export function saveDataToFile(data, type, filename) {
  const blob = new Blob([data], { type: type });

  // Create an element to trigger the download
  let a = document.createElement("a");
  a.href = window.URL.createObjectURL(blob);
  a.download = filename;

  // Dispatch a click event to the element
  a.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
  setTimeout(() => window.URL.revokeObjectURL(a.href), 100);
}

/**
 * Export document data to a JSON file which can be saved by the client and later imported into a different session.
 * @param {object} [options]      Additional options passed to the {@link ClientDocumentMixin#toCompendium} method
 * @memberof ClientDocumentMixin#
 */
export function exportToJSON(entity, options) {
  const data = entity.toCompendium(null, options);
  data.flags.exportSource = {
    world: game.world.id,
    system: game.system.id,
    coreVersion: game.version,
    systemVersion: game.system.version,
  };
  // const filename = ["fvtt", this.documentName, this.name?.slugify(), this.id].filterJoin("-");
  // saveDataToFile(JSON.stringify(data, null, 2), "text/json", `${filename}.json`);
  return JSON.stringify(data, null, 2);
}

// /**
//  * Transform the Document data to be stored in a Compendium pack.
//  * Remove any features of the data which are world-specific.
//  * @param {CompendiumCollection} [pack]   A specific pack being exported to
//  * @param {object} [options]              Additional options which modify how the document is converted
//  * @param {boolean} [options.clearFlags=false]      Clear the flags object
//  * @param {boolean} [options.clearSource=true]      Clear any prior sourceId flag
//  * @param {boolean} [options.clearSort=true]        Clear the currently assigned sort order
//  * @param {boolean} [options.clearFolder=false]     Clear the currently assigned folder
//  * @param {boolean} [options.clearOwnership=true]   Clear document ownership
//  * @param {boolean} [options.clearState=true]       Clear fields which store document state
//  * @param {boolean} [options.keepId=false]          Retain the current Document id
//  * @returns {object}                      A data object of cleaned data suitable for compendium import
//  * @memberof ClientDocumentMixin#
//  */
// function toCompendium(
//   pack,
//   {
//     clearSort = true,
//     clearFolder = false,
//     clearFlags = false,
//     clearSource = true,
//     clearOwnership = true,
//     clearState = true,
//     keepId = false,
//   } = {}
// ) {
//   const data = this.toObject();
//   if (!keepId) delete data._id;
//   if (clearSort) delete data.sort;
//   if (clearFolder) delete data.folder;
//   if (clearFlags) delete data.flags;
//   if (clearSource) delete data.flags?.core?.sourceId;
//   if (clearOwnership) delete data.ownership;
//   if (clearState) delete data.active;
//   return data;
// }

// /**
//  * Export all Documents contained in this Folder to a given Compendium pack.
//  * Optionally update existing Documents within the Pack by name, otherwise append all new entries.
//  * @param {CompendiumCollection} pack       A Compendium pack to which the documents will be exported
//  * @param {object} [options]                Additional options which customize how content is exported.
//  *                                          See {@link ClientDocumentMixin#toCompendium}
//  * @param {boolean} [options.updateByName=false]    Update existing entries in the Compendium pack, matching by name
//  * @param {boolean} [options.keepId=false]          Retain the original _id attribute when updating an entity
//  * @param {boolean} [options.keepFolders=false]     Retain the existing Folder structure
//  * @param {string} [options.folder]                 A target folder id to which the documents will be exported
//  * @returns {Promise<CompendiumCollection>}  The updated Compendium Collection instance
//  */
// export async function exportToFile(json, options = {}) {
//   options.updateByName = false;
//   options.keepId = true;
//   options.keepFolders = true;
//   options.folder = null;

//   const updateByName = false; //options.updateByName ?? false;
//   // const index = await pack.getIndex();
//   // ui.notifications.info(game.i18n.format("FOLDER.Exporting", {
//   //   type: this.type,
//   //   compendium: pack.collection
//   // }));
//   options.folder ||= null;

//   // Classify creations and updates
//   const foldersToCreate = [];
//   const foldersToUpdate = [];
//   const documentsToCreate = [];
//   const documentsToUpdate = [];

//   // Ensure we do not overflow maximum allowed folder depth
//   const originDepth = this.ancestors.length;
//   const targetDepth = 0; //options.folder ? ((pack.folders.get(options.folder)?.ancestors.length ?? 0) + 1) : 0;

//   /**
//    * Recursively extract the contents and subfolders of a Folder into the Pack
//    * @param {Folder} folder       The Folder to extract
//    * @param {number} [_depth]     An internal recursive depth tracker
//    * @private
//    */
//   const _extractFolder = async (folder, _depth = 0) => {
//     // const folderData = folder.toCompendium(pack, {...options, clearSort: false, keepId: true});
//     const folderData = folder.toCompendium(pack, { ...options, clearSort: false, keepId: true });

//     if (options.keepFolders) {
//       // Ensure that the exported folder is within the maximum allowed folder depth
//       const currentDepth = _depth + targetDepth - originDepth;
//       const exceedsDepth = currentDepth > 4; //pack.maxFolderDepth;
//       if (exceedsDepth) {
//         throw new Error(`Folder "${folder.name}" exceeds maximum allowed folder depth of ${4}`);
//       }

//       // Re-parent child folders into the target folder or into the compendium root
//       if (folderData.folder === this.id) folderData.folder = options.folder;

//       // Classify folder data for creation or update
//       if (folder !== this) {
//         const existing = updateByName ? pack.folders.find((f) => f.name === folder.name) : pack.folders.get(folder.id);
//         if (existing) {
//           folderData._id = existing._id;
//           foldersToUpdate.push(folderData);
//         } else foldersToCreate.push(folderData);
//       }
//     }

//     // Iterate over Documents in the Folder, preparing each for export
//     for (let doc of folder.contents) {
//       const data = doc.toCompendium(pack, options);

//       // Re-parent immediate child documents into the target folder.
//       if (data.folder === this.id) data.folder = options.folder;
//       // Otherwise retain their folder structure if keepFolders is true.
//       else data.folder = options.keepFolders ? folderData._id : options.folder;

//       // Generate thumbnails for Scenes
//       if (doc instanceof Scene) {
//         const { thumb } = await doc.createThumbnail({ img: data.background.src });
//         data.thumb = thumb;
//       }

//       // Classify document data for creation or update
//       const existing = updateByName ? index.find((i) => i.name === data.name) : index.find((i) => i._id === data._id);
//       if (existing) {
//         data._id = existing._id;
//         documentsToUpdate.push(data);
//       } else documentsToCreate.push(data);
//       console.log(`Prepared "${data.name}" for export to "${pack.collection}"`);
//     }

//     // Iterate over subfolders of the Folder, preparing each for export
//     for (let c of folder.children) await _extractFolder(c.folder, _depth + 1);
//   };

//   // Prepare folders for export
//   try {
//     await _extractFolder(this, 0);
//   } catch (err) {
//     const msg = `Cannot export Folder "${this.name}" to Compendium pack "${pack.collection}":\n${err.message}`;
//     return ui.notifications.error(msg, { console: true });
//   }

//   // Create and update Folders
//   if (foldersToUpdate.length) {
//     await this.constructor.updateDocuments(foldersToUpdate, {
//       pack: pack.collection,
//       diff: false,
//       recursive: false,
//       render: false,
//     });
//   }
//   if (foldersToCreate.length) {
//     await this.constructor.createDocuments(foldersToCreate, {
//       pack: pack.collection,
//       keepId: true,
//       render: false,
//     });
//   }

//   // Create and update Documents
//   const cls = pack.documentClass;
//   if (documentsToUpdate.length)
//     await cls.updateDocuments(documentsToUpdate, {
//       pack: pack.collection,
//       diff: false,
//       recursive: false,
//       render: false,
//     });
//   if (documentsToCreate.length)
//     await cls.createDocuments(documentsToCreate, {
//       pack: pack.collection,
//       keepId: options.keepId,
//       render: false,
//     });

//   // Re-render the pack
//   ui.notifications.info(game.i18n.format("FOLDER.ExportDone", { type: this.type, compendium: pack.collection }));
//   pack.render(false);
//   return pack;
// }
