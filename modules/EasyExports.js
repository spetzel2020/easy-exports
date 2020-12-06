/*
6-Sep-2020      Created
6-Sep-2020      0.2.0   Write single export to any directory you pick
7-Sep-2020      0.2.2   Typo (compendium not plural)
                0.2.4   Can't export compendium
17-Sep-2020     0.3.0   Add macros directory for full export
                        Change logging to be more informative
                        Removed .setup()
16-Nov-2020     0.4.0   Present choice to reimport with list and checkboxes? Or multi-select?     
                        Import into a new compendium which can then be searched and re-imported      
17-Nov-2020     0.4.0b  i18n messages  and dialog/display when done                                 
*/

const MODULE_NAME = "easy-exports";
const MODULE_VERSION="0.5.0";
//ENTITY_TYPES has the entity names (liek Actor etc)
//Surely this is available somwhere - the mapping between sidebartab and actual Entity
const SIDEBAR_TO_ENTITY = {
        "scenes": "Scene",
        "actors": "Actor",
        "items": "Item",
        "journal": "JournalEntry",
        "playlists": "Playlist",
        "tables": "RollTable",
        "macros": "Macro"
}

class EasyExport {
    static init() {
        game.settings.register(MODULE_NAME, "easyExportsVersion", {
          name: `Easy Exports ${MODULE_VERSION}`,
          hint: "",
          scope: "system",
          config: false,
          default: MODULE_VERSION,
          type: String
        });
    }

    static async importFromJSON(json, filename) {
        let importedEntities;
        //First attempt uses v0.4 output format which includes array [] around the output
        try {
            importedEntities = JSON.parse(json);
        } catch {
            ui.notifications.warn(game.i18n.localize("EE.Parsing.TryingFix.WARNING"));
            //If that doesn't work, try wrapping the input file in []
            try {
                importedEntities = JSON.parse(`{"entities": [`+json+"]}");
                ui.notifications.info(game.i18n.localize("EE.Parsing.TryingFix.INFO"));
            } catch {
                ui.notifications.error(game.i18n.localize("EE.Parsing.TryingFix.ERROR"));
            }
        }

        //Backup method of extracting the entity from the filename
        let entityFromFilename;
        try {
            const extractedSidebar = filename.split("-")[1];
            entityFromFilename = SIDEBAR_TO_ENTITY[extractedSidebar]
        } catch {}
        //Should be {entity: [<array of entities>]}
        if (importedEntities) {
            //New method (for 0.4 exports)
            let entity = Object.keys(importedEntities)[0];
            let values = Object.values(importedEntities)[0];
            if (!entity || entity === "entities") {
               entity = entityFromFilename;
            }
            if (!entity) {return;}

            const metadata = {
                package: "world",
                entity: entity,
                label: filename         //so that you can work out which one to look at

            }
            const newCompendium = await Compendium.create(metadata);
            ui.notifications.warn(`${game.i18n.localize("EE.ImportingCompendium.CONTENT1")} ${newCompendium.title} ${game.i18n.localize("EE.ImportingCompendium.CONTENT2")} ${values.length} ${entity}s`);
            ui.notifications.info( game.i18n.localize("EE.ImportingCompendium.CONTENT4"));
            newCompendium.createEntity(values).then(() => isReadyDialog(newCompendium));
        }

    }

}

function isReadyDialog(compendium, options={}) {
    if (!compendium) {
        ui.notifications.error("Unable to display recovered Compendium");
        return;
    }

    return new Promise(resolve => {
        const dialog = new Dialog({
            title: game.i18n.localize("EE.IsReadyDialog.TITLE"),
            content: game.i18n.localize("EE.IsReadyDialog.CONTENT1") + compendium.title + game.i18n.localize("EE.IsReadyDialog.CONTENT2"),
            buttons: {
                view: {
                    icon: '<i class="fas fa-eye"></i>',
                    label: game.i18n.localize("EE.IsReadyDialog.ViewNow.BUTTON"),
                    callback: () => compendium.render(true)
                },
                later: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("EE.IsReadyDialog.Later.BUTTON"),
                    callback: resolve(false)
                }
            },
            default: "view",
            close: resolve
        }, options);
        dialog.render(true);
    });
}

function exportOrImportDialog(options={}) {
    return new Promise(resolve => {
        const dialog = new Dialog({
        title: game.i18n.localize("EE.ExportOrImport.TITLE"),
        content: game.i18n.localize("EE.ExportOrImport.CONTENT"),
        buttons: {
            export: {
                icon: '<i class="fas fa-file-export"></i>',
                label: game.i18n.localize("EE.ExportOrImport.Export.BUTTON"),
                callback: exportTree.bind(this)
            },
            import: {
                icon: '<i class="fas fa-file-import"></i>',
                label: game.i18n.localize("EE.ExportOrImport.Import.BUTTON"),
                callback: importDialog.bind(this)
            },
            backup: {
                icon: '<i class="fas fa-file-export"></i>',
                label: game.i18n.localize("EE.ExportOrImport.FullBackup.BUTTON"),
                callback: exportAll.bind(this)
            }
        },
        default: "export",
        close: resolve
        }, options);
        dialog.render(true);
    });
}

async function importDialog() {
    //Read the file you want to import
    new Dialog({
      title: `Import Data: ${this.name}`,
      content: await renderTemplate("templates/apps/import-data.html", {entity: this.entity, name: this.name}),
      buttons: {
        import: {
          icon: '<i class="fas fa-file-import"></i>',
          label: "Import",
          callback: html => {
            const form = html.find("form")[0];
            if ( !form.data.files.length ) return ui.notifications.error("You did not upload a data file!");
            const filename = form.data.files[0];
            readTextFromFile(filename).then(json => EasyExport.importFromJSON(json, filename.name));
          }
        },
        no: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel"
        }
      },
      default: "import"
    }, {
      width: 400
    }).render(true);
}


function exportTree(writeFile=true) {
    let allData = null;
    const metadata = {
          world: game.world.id,
          system: game.system.id,
          coreVersion: game.data.version,
          systemVersion: game.system.data.version
    };

    for (let entity of this.entities) {
        //For this version, convert to JSON and merge into one file
        let data = duplicate(entity.data);
        delete data.folder;
        delete data.permission;
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
    const entity = this.entities[0]?.entity;
    allData = `{"${entity}":[`+allData+"]}";
    console.log(`Exported ${this.entities.length} of ${this.tabName}`);

    // Trigger file save procedure
    const filename = `fvtt-${this.tabName}.json`;
    if (writeFile) writeJSONToFile(filename, allData);
    return {filename, allData}
}

function writeJSONToFile(filename, data) {
    saveDataToFile(data, "text/json", filename);
    console.log(`Saved to file ${filename}`);
}

function exportAll() {
    let fullBackupData = null;
    for (const entity of Object.keys(SIDEBAR_TO_ENTITY)) {
        const entityClass = ui[entity];     //Helpfully stores this mapping
        const exportThisEntity = exportTree.bind(entityClass);
        let {filename, allData} = exportThisEntity(false);
        if (fullBackupData === null) {
            fullBackupData = allData; 
        } else {
            fullBackupData += "," + allData;  //add a comma after each previous element
        }
    }
    //Wrap them all in an entity that can be reimported
    fullBackupData = `{"fullBackup" : [${fullBackupData}]}`;
    const filename = `fvtt-fullBackup.json`;
    writeJSONToFile(filename, fullBackupData);
}



//Add the Easy Export button on the relevant popouts and a listener
Hooks.on(`renderSidebarTab`, async (sidebarTab, html, data) => {
    if (!sidebarTab.popOut) {return;}
    //If this is one of the exportable sections in a pop-out
    switch (sidebarTab.tabName) {
        case "scenes":
        case "actors":
        case "items":
        case "journal":
        case "playlists":
        case "tables":
        case "macros":
            const easyExport = `<a id='easy-export' class='export'> <i class='fas fa-file'></i>${game.i18n.localize("EE.Title")}</a>`;
            html.find(".window-header").children(".close").before(easyExport);
            html.find("#easy-export").click(exportOrImportDialog.bind(sidebarTab));
            break;
        default:
            break;
    }
});

Hooks.on("init", EasyExport.init);
