# Easy Exports

* **Author**: Spetzel#0103
* **Version**: 0.3.0
* **Foundry VTT Compatibility**: 0.6.5-0.7.2
* **System Compatibility (If applicable)**: N/A
* **Translation Support**: en


## Description
Easy Exports speeds up exports for backups of your [Foundry VTT](https://foundryvtt.com/) world. Instead of right-clicking every Journal, Scene, Actor, etc. simply right-click the section in the Sidebar and pick the Easy Export option from the pop-up window (next to the Close button). Works for Macros too!

## Install

1. Go to the "Add-on Modules" tab in Foundry Setup
2. Click "Install Module" and paste this link: `https://raw.githubusercontent.com/opus1217/easy-exports/master/module.json`
3. Open your world and go to Settings>Manage Modules and enable Easy Exports

## Using Easy Exports
1. Start your world
2. Right-click on the tab in the Sidebar (Scenes, Actors, Items, Journals, Rollable Tables, or Playlists) to open the pop-out (for Macros, just click the file icon in the Macro bar)
3. Pick the Easy Export option from the title bar of the pop-out (next to the Close option)
4. The contents of the window will be exported in one concatenated JSON file to a backup location you pick on your local machine.
5. To recover individual entities, edit the relevant JSON into a separate file for import
