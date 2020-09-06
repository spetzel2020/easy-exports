export const MODULE_NAME = "easy-exports";

/*
9-Sep-2020      Created
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



    static setup() {

    }
}

//Add a listener for the embedded Encounter button
Hooks.on(`renderSidebarTab`, async (sidebarTab, html, data) => {
    const tab = sidebarTab;
});

Hooks.on("init", EasyExport.init);
Hooks.on('setup', EasyExport.setup);
