export const MODULE_NAME = "easy-exports";

/*
6-Sep-2020      Created
6-Sep-2020      0.2.0   Write single export to any directory you pick
7-Sep-2020      0.2.2   Typo (compendium not plural)
                0.2.4   Can't export compendium
17-Sep-2020     0.3.0   Add macros directory for full export
                        Change logging to be more informative
                        Removed .setup()
*/



class EasyExport {
    static init() {
        game.settings.register(MODULE_NAME, "easyExportsVersion", {
          name: `Easy Exports ${game.i18n.localize("EE.Version")}`,
          hint: "",
          scope: "system",
          config: false,
          default: game.i18n.localize("EE.Version"),
          type: String
        });
    }


}

function exportTree() {
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
        //Redudant since we're storing this on every element
        data.flags["exportSource"] = metadata;

        if (allData === null) {
            allData = JSON.stringify(data, null, 2);
        } else {
            allData += "," + JSON.stringify(data, null, 2);
        }
    }
    console.log(`Exported ${this.entities.length} of ${this.tabName}`);

    // Trigger file save procedure
    const filename = `fvtt-${this.tabName}.json`;
    saveDataToFile(allData, "text/json", filename);

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
            html.find("#easy-export").click(exportTree.bind(sidebarTab));
            break;
        default:
            break;
    }
});

Hooks.on("init", EasyExport.init);
