![Latest Release Download Count](https://img.shields.io/badge/dynamic/json?label=Downloads@latest&query=assets%5B0%5D.download_count&url=https%3A%2F%2Fapi.github.com%2Frepos%2Fspetzel2020%2Feasy-exports%2Freleases%2Flatest)
![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Feasy-exports&colorB=4aa94a)

# Easy Exports
NEW! Use the new **Full Backup** option to do a one-click backup of Scenes, Actors, Journals, Items, Tables, and Macros into one file. And Importing works for Full Backups too.

**IMPORTANT** Easy Exports protects you against accidental deletion of important assets, or allows you to roll back to an earlier configuration. It does not support transferring assets to another world or server because of the difference in internal IDs used.

* **Author**: Spetzel#0103
* **Version**: 0.7.0
* **Foundry VTT Compatibility**: 0.8.6-10
* **System Compatibility (If applicable)**: N/A
* **Translation Support**: en, es (thanks @Viriato139ac#0342!)


## Description
Easy Exports speeds up exports of your world(s). Instead of right-clicking every Journal, Scene, Actor, etc. simply right-click the section in the Sidebar and pick the Easy Export option from the pop-up window (next to the Close button). Works for Macros too! Save before and after snapshots of your Sessions.

Easy Exports saves exports to your local client, so if you are hosting Foundry remotely you don't have to rely on the services' backups, or wait for them to recover it for you!

## Install
1. Go to the "Add-on Modules" tab in Foundry Setup
2. Click "Install Module" and search for Easy Exports OR paste this link in the Manifest URL field: https://github.com/spetzel2020/easy-exports/releases/latest/download/module.json
3. Open your world and go to Settings>Manage Modules and enable Easy Exports

## Using Easy Exports
### Exporting
1. Start your world
2. Right-click on the tab in the Sidebar (Scenes, Actors, Items, Journals, Rollable Tables, or Playlists) to open the pop-out (for Macros, just click the file icon in the Macro bar)
3. Click on Easy Export in the title bar of the pop-out (next to the Close option); choose Export
4. The contents of the window will be exported in one concatenated JSON file to a backup location you pick on your local machine.

### Full Backup
Follow the steps for Exporting, but pick Full Backup - this will create a single file containing all six exports which can be re-imported if necessary.

### Importing
1. Right-click any Sidebar tab
2. Click on Easy Export and choose Import
3. Select the previously exported file and click Import
4. If the file is recognized, it will be imported into a custom Compendium - a dialog will show when the Compendium is ready to view (may take a few seconds or several minutes depending on size and bandwidth)
5. You can then import from the Compendium in the normal way to recover your entities
6. Don't forget to delete the Compendium when done!
7. If you Import a previous Full Backup it will automatically create separate Compendiums for the exported Scenes, Actors, etc.

## Contributions
[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/T6T82XFQD)

## License
**Easy Exports for Foundry VTT** is licensed under the [GNU General Public License v3.0](https://github.com/spetzel2020/easy-exports/blob/master/LICENSE)

This work is licensed under Foundry Virtual Tabletop [EULA - Limited License Agreement for module development v 0.1.6](http://foundryvtt.com/pages/license.html).
