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
6-Dec-2020      0.5.0   Add Full Backup option
8-Dec-2020      0.5.0b  Handle re-import of Full Backup. 
                        Make Import dialog more relevant to Easy Exports and notifications parameterized     
21-Dec-2020     0.5.1   Guard against import being of invalid entity, because that chokes world startup                                               
                        include not importing from fullBackup if it's an invalid entity
26-Mar-2021     0.6.0   Preserve folders and permissions to test whether these can be used on re-import from a Compendium      
15-Apr-2021     0.6.0c  Check version and use new calls for Foundry 0.8   
21-Dec-2021     0.6.2   Set the EasyExport.isFoundryV8Plus variable for different code-paths
                        Fix deprecation of Directory.entities
7-Mar-2022      0.6.5   Fixed: Issue [#11](https://github.com/spetzel2020/easy-exports/issues/11) ; use documentName not .entity in exportTree()
                        WARNING: Because of this change, 0.6.5+ will only work with the Foundry 0.8+ data model    
                0.6.5b  Fix use of entity (should be type) in metadata on import                                
*/

//0.5.0 Wrap constants in module name to protect the namespace
const EASY_EXPORTS = {
    MODULE_NAME : "easy-exports",
    MODULE_VERSION : "0.6.1",
    FULL_BACKUP_KEY : "fullBackup"
}

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
        game.settings.register(EASY_EXPORTS.MODULE_NAME, "easyExportsVersion", {
          name: `Easy Exports ${EASY_EXPORTS.MODULE_VERSION}`,
          hint: "",
          scope: "system",
          config: false,
          default: EASY_EXPORTS.MODULE_VERSION,
          type: String
        });

        //If v9, then game.data.version will throw a deprecation warning so test for v9 first
        EasyExport.isFoundryV8Plus = (game.data.release?.generation >= 9) || (game.data.version?.startsWith("0.8")); 
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
        EasyExport.importEntity(importedEntities, filename);
    }

    static async importEntity(importedEntities, filename) {
        //Backup method of extracting the entity from the filename
        let entityFromFilename;
        try {
            const extractedSidebar = filename?.split("-")[1];
            entityFromFilename = SIDEBAR_TO_ENTITY[extractedSidebar]
        } catch {}


        //Should be {entity: [<array of entities>]}
        if (importedEntities) {
            //New method (for 0.4 exports)
            let entity = Object.keys(importedEntities)[0];
            let values = Object.values(importedEntities)[0];
            //0.5.0: For Full Backup, first cut is we retrieve all into multiple compendiums
            if (!entity || entity === "entities") {
               entity = entityFromFilename;
            } else if (entity === EASY_EXPORTS.FULL_BACKUP_KEY) {
                EasyExport.importFullBackup(values, filename);
                return;
            }
            //0.5.1 Check that entity is legal (because Foundry chokes on startup if you've got an invalid Compendium)
            if (!entity || !Object.values(SIDEBAR_TO_ENTITY).includes(entity)) {return;}

            //0.6.5b: For Foundry 0.8+ use type not entity (deprecated)
            let metadata;
            let newCompendium;
            if (EasyExport.isFoundryV8Plus) {
                metadata = {
                    package: "world",
                    type: entity,
                    label: filename         //so that you can work out which one to look at
                }
                newCompendium = await CompendiumCollection.createCompendium(metadata);
            } else {
                metadata = {
                    package: "world",
                    entity: entity,
                    label: filename         //so that you can work out which one to look at
                }
                newCompendium = await Compendium.create(metadata);
            }

            //Default string, unless we have a parameterized version
            let warning = `${game.i18n.localize("EE.ImportingCompendium.CONTENT1")} ${newCompendium.title} ${game.i18n.localize("EE.ImportingCompendium.CONTENT2")} ${values.length} ${entity}s`;
            if (game.i18n.has("EE.ImportingCompendium.CONTENT_v050")) {
                warning = game.i18n.format("EE.ImportingCompendium.CONTENT_v050",{title : newCompendium.title, numEntities : values.length, entityName :  entity});
            }
            ui.notifications.warn(warning);
            ui.notifications.info( game.i18n.localize("EE.ImportingCompendium.CONTENT4"));

            if (EasyExport.isFoundryV8Plus) {
                const options = {pack: newCompendium.collection}
                newCompendium.documentClass.create(values, options).then(() => isReadyDialog(newCompendium));
            } else { 
                newCompendium.createEntity(values).then(() => isReadyDialog(newCompendium));
            }
        }
    }

    static async importFullBackup(entityBackups, filename) {
        for (const entity of entityBackups) {
            //v0.5.1 If we can't decode entity, skip it
            if (Object.keys(entity)) {
                const entityName = Object.keys(entity)[0];
                const constructedFilename = filename+"-"+entityName;
                //Note this is not really recursive - it calls back to importFromJSON for each individual entity backup
                EasyExport.importEntity(entity, constructedFilename);
            }
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
      title: `Import`,
      content: await renderTemplate("modules/easy-exports/templates/import-data.html"),
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

    for (let entity of this.documents) {
        //For this version, convert to JSON and merge into one file
        let data = duplicate(entity.data);
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
    allData = `{"${entity}":[`+allData+"]}";
    console.log(`Exported ${this.documents.length} of ${this.tabName}`);

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
    fullBackupData = `{"${EASY_EXPORTS.FULL_BACKUP_KEY}" : [${fullBackupData}]}`;
    const filename = `fvtt-fullBackup.json`;
    writeJSONToFile(filename, fullBackupData);
}



//Add the Easy Export button on the relevant popouts and a listener
Hooks.on(`renderSidebarTab`, async (sidebarTab, html, data) => {
    if (!sidebarTab.popOut) {return;}
    //If this is one of the exportable sections in a pop-out
    const easyExport = `<a id='easy-export' class='export'> <i class='fas fa-file'></i>${game.i18n.localize("EE.Title")}</a>`;
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
            html.find(".window-header").children(".close").before(easyExport);
            html.find("#easy-export").click(exportOrImportDialog.bind(sidebarTab));
            break;
        default:
            break;
    }
});

Hooks.on("init", EasyExport.init);
