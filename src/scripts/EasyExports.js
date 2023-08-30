/*

*/

import CONSTANTS from "./constants.js";
import { log, manageNameForFolder } from "./lib/lib.js";

export class EasyExport {
  static init() {}

  static async importFromJSON(json, filename) {
    let importedEntities;
    //First attempt uses v0.4 output format which includes array [] around the output
    try {
      importedEntities = JSON.parse(json);
    } catch {
      ui.notifications.warn(game.i18n.localize("easy-exports.Parsing.TryingFix.WARNING"));
      //If that doesn't work, try wrapping the input file in []
      try {
        importedEntities = JSON.parse(`{"entities": [` + json + "]}");
        ui.notifications.info(game.i18n.localize("easy-exports.Parsing.TryingFix.INFO"));
      } catch {
        ui.notifications.error(game.i18n.localize("easy-exports.Parsing.TryingFix.ERROR"));
      }
    }
    EasyExport.importEntity(importedEntities, filename);
  }

  static async importEntity(importedEntities, filename) {
    //Backup method of extracting the entity from the filename
    let entityFromFilename;
    try {
      const extractedSidebar = filename?.split("-")[1];
      entityFromFilename = CONSTANTS.SIDEBAR_TO_ENTITY[extractedSidebar];
    } catch {}

    //Should be {entity: [<array of entities>]}
    if (importedEntities) {
      //New method (for 0.4 exports)
      let entity = Object.keys(importedEntities)[0];
      let values = Object.values(importedEntities)[0];
      //0.5.0: For Full Backup, first cut is we retrieve all into multiple compendiums
      if (!entity || entity === "entities") {
        entity = entityFromFilename;
      } else if (entity === CONSTANTS.FULL_BACKUP_KEY) {
        EasyExport.importFullBackup(values, filename);
        return;
      }
      //0.5.1 Check that entity is legal (because Foundry chokes on startup if you've got an invalid Compendium)
      if (!entity || !Object.values(CONSTANTS.SIDEBAR_TO_ENTITY).includes(entity)) {
        return;
      }

      //0.6.5b: For Foundry 0.8+ use type not entity (deprecated)
      const metadata = {
        package: "world",
        type: entity,
        label: filename, //so that you can work out which one to look at
      };
      const newCompendium = await CompendiumCollection.createCompendium(metadata);

      //Default string, unless we have a parameterized version
      let warning = `${game.i18n.localize("easy-exports.ImportingCompendium.CONTENT1")} ${
        newCompendium.title
      } ${game.i18n.localize("easy-exports.ImportingCompendium.CONTENT2")} ${values.length} ${entity}s`;
      if (game.i18n.has("easy-exports.ImportingCompendium.CONTENT_v050")) {
        warning = game.i18n.format("easy-exports.ImportingCompendium.CONTENT_v050", {
          title: newCompendium.title,
          numEntities: values.length,
          entityName: entity,
        });
      }
      ui.notifications.warn(warning);
      ui.notifications.info(game.i18n.localize("easy-exports.ImportingCompendium.CONTENT4"));

      const options = {
        pack: newCompendium.collection,
      };
      newCompendium.documentClass.create(values, options).then(() => {
        isReadyDialog(newCompendium);
      });
    }
  }

  static async importFullBackup(entityBackups, filename) {
    for (const entity of entityBackups) {
      //v0.5.1 If we can't decode entity, skip it
      if (Object.keys(entity)) {
        const entityName = Object.keys(entity)[0];
        const constructedFilename = filename + "-" + entityName;
        //Note this is not really recursive - it calls back to importFromJSON for each individual entity backup
        EasyExport.importEntity(entity, constructedFilename);
      } else {
        warn(`Cannot decode entity ${entity.name ? entity.name : entity}`, true);
      }
    }
  }

  isReadyDialog(compendium, options = {}) {
    if (!compendium) {
      ui.notifications.error("Unable to display recovered Compendium");
      return;
    }

    return new Promise((resolve) => {
      const dialog = new Dialog(
        {
          title: game.i18n.localize("easy-exports.IsReadyDialog.TITLE"),
          content:
            game.i18n.localize("easy-exports.IsReadyDialog.CONTENT1") +
            compendium.title +
            game.i18n.localize("easy-exports.IsReadyDialog.CONTENT2"),
          buttons: {
            view: {
              icon: '<i class="fas fa-eye"></i>',
              label: game.i18n.localize("easy-exports.IsReadyDialog.ViewNow.BUTTON"),
              callback: () => {
                compendium.render(true);
              },
            },
            later: {
              icon: '<i class="fas fa-times"></i>',
              label: game.i18n.localize("easy-exports.IsReadyDialog.Later.BUTTON"),
              callback: () => {
                resolve(false);
              },
            },
          },
          default: "view",
          close: () => {
            resolve(false);
          },
        },
        options
      );
      dialog.render(true);
    });
  }

  exportOrImportDirectoryDialog(options = {}) {
    return new Promise((resolve) => {
      const dialog = new Dialog(
        {
          title: game.i18n.localize("easy-exports.ExportOrImport.TITLE"),
          content: game.i18n.localize("easy-exports.ExportOrImport.CONTENT"),
          buttons: {
            export: {
              icon: '<i class="fas fa-file-export"></i>',
              label: game.i18n.localize("easy-exports.ExportOrImport.Export.BUTTON"),
              callback: this.exportTree.bind(this),
            },
            import: {
              icon: '<i class="fas fa-file-import"></i>',
              label: game.i18n.localize("easy-exports.ExportOrImport.Import.BUTTON"),
              callback: this.importDialog.bind(this),
            },
            backup: {
              icon: '<i class="fas fa-file-export"></i>',
              label: game.i18n.localize("easy-exports.ExportOrImport.FullBackup.BUTTON"),
              callback: this.exportAll.bind(this),
            },
          },
          default: "export",
          close: resolve,
        },
        options
      );
      dialog.render(true);
    });
  }

  exportOrImportFolderDialog(options = {}) {
    return new Promise((resolve) => {
      const dialog = new Dialog(
        {
          title: game.i18n.localize("easy-exports.ExportOrImport.TITLE"),
          content: game.i18n.localize("easy-exports.ExportOrImport.CONTENT"),
          buttons: {
            export: {
              icon: '<i class="fas fa-file-export"></i>',
              label: game.i18n.localize("easy-exports.ExportOrImport.Export.BUTTON"),
              callback: this.exportTree.bind(this),
            },
            import: {
              icon: '<i class="fas fa-file-import"></i>',
              label: game.i18n.localize("easy-exports.ExportOrImport.Import.BUTTON"),
              callback: this.importDialog.bind(this),
            },
            backup: {
              icon: '<i class="fas fa-file-export"></i>',
              label: game.i18n.localize("easy-exports.ExportOrImport.FullBackup.BUTTON"),
              callback: this.exportAll.bind(this),
            },
          },
          default: "export",
          close: resolve,
        },
        options
      );
      dialog.render(true);
    });
  }

  async importDialog() {
    //Read the file you want to import
    new Dialog(
      {
        title: `Import`,
        content: await renderTemplate("modules/easy-exports/templates/import-data.html"),
        buttons: {
          import: {
            icon: '<i class="fas fa-file-import"></i>',
            label: "Import",
            callback: (html) => {
              const form = html.find("form")[0];
              if (!form.files.length) {
                return ui.notifications.error("You did not upload a data file!");
              }
              const filename = form.files[0];
              readTextFromFile(filename).then((json) => {
                EasyExport.importFromJSON(json, filename.name);
              });
            },
          },
          no: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel",
          },
        },
        default: "import",
      },
      {
        width: 400,
      }
    ).render(true);
  }

  exportTree(writeFile = true) {
    let allData = null;
    const metadata = {
      world: game.world.id,
      system: game.system.id,
      coreVersion: game.version,
      systemVersion: game.system.version,
    };

    for (let entity of this.documents) {
      //For this version, convert to JSON and merge into one file
      let data = duplicate(entity);
      // Flag some metadata about where the entity was exported some - in case migration is needed later
      //Redundant since we're storing this on every element
      data.flags["exportSource"] = metadata;

      if (allData === null) {
        allData = JSON.stringify(data, null, 2);
      } else {
        allData += "," + JSON.stringify(data, null, 2);
      }
    }
    //Prepend and append [] for array re-import
    //0.6.5: In Foundry 0.8+ should use .documentName not .entity
    const entity = this.documents[0]?.documentName;
    allData = `{"${entity}":[` + allData + "]}";
    log(`Exported ${this.documents.length} of ${this.tabName}`);

    // Trigger file save procedure
    let filename = `fvtt-${this.tabName}.json`;
    filename = manageNameForFolder(filename, this.tabName);
    if (writeFile) writeJSONToFile(filename, allData);
    return { filename, allData };
  }

  writeJSONToFile(filename, data) {
    saveDataToFile(data, "text/json", filename);
    log(`Saved to file ${filename}`);
  }

  exportAll() {
    let fullBackupData = null;
    for (const entity of Object.keys(CONSTANTS.SIDEBAR_TO_ENTITY)) {
      const entityClass = ui[entity]; //Helpfully stores this mapping
      const exportThisEntity = exportTree.bind(entityClass);
      let { filename, allData } = exportThisEntity(false);
      if (fullBackupData === null) {
        fullBackupData = allData;
      } else {
        fullBackupData += "," + allData; //add a comma after each previous element
      }
    }
    //Wrap them all in an entity that can be reimported
    fullBackupData = `{"${CONSTANTS.FULL_BACKUP_KEY}" : [${fullBackupData}]}`;
    let filename = `fvtt-fullBackup.json`;
    filename = manageNameForFolder(filename, this.tabName);
    this.writeJSONToFile(filename, fullBackupData); // TODO probably settings
    this._download(fullBackupData, filename);
  }

  _download(data, filename) {
    // data is the string type, that contains the contents of the file.
    // filename is the default file name, some browsers allow the user to change this during the save dialog.

    // Note that we use octet/stream as the mimetype
    // this is to prevent some browsers from displaying the
    // contents in another browser tab instead of downloading the file
    var blob = new Blob([data], { type: "octet/stream" });

    //IE 10+
    if (window.navigator.msSaveBlob) {
      window.navigator.msSaveBlob(blob, filename);
    } else {
      //Everything else
      var url = window.URL.createObjectURL(blob);
      var a = document.createElement("a");
      document.body.appendChild(a);
      a.href = url;
      a.download = filename;

      setTimeout(() => {
        //setTimeout hack is required for older versions of Safari

        a.click();

        //Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 1);
    }
  }
}
