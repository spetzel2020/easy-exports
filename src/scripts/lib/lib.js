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
    ":" +
    String(date.getUTCMinutes()).padStart(2, "0") +
    ":" +
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
