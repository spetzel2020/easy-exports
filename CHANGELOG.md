# RELEASE NOTES
## 0.6.5
- Fixed: Issue [#11](https://github.com/spetzel2020/easy-exports/issues/11) ; use documentName not .entity
- Because of this change, will only work with the Foundry 0.8+ data model
## 0.6.3
- Fixed: compatibleCoreVersion format is now 9.238
## 0.6.2
- Test for Foundry 0.9
- Fix deprecation of Directory.entities
## 0.6
- Preserve folders and permissions to test whether these can be used on re-import from a Compendium      
- Check version and use new calls for Foundry 0.8
## 0.5.1 21-Dec-2020
- Fixed: Full Backup was exporting/importing "null" entity which meant the world would not start up
- Checked Foundry 0.7.9 compatibility
## 0.5.0 6-Dec-2020
- Check Foundry 0.7.8 compatibility
- Full Backup option (concatenated export of individual tab exports)
- Import of Full Backup (basic: re-imports all the Compendiums)

## 0.4.3 3-Dec-2020
- Tweak module.json to always point to "latest"
## 0.4.2 2-Dec-2020
- Add Spanish translation (thanks https://github.com/lozalojo!)
- New packaging method (explicit module.json and easy-exports.zip in downloads)

## 0.4.0,0.4.1 17-Nov-2020
- NEW Import option - recovers an export into a Compendium which you can then search and selectively import from

## 0.3.1 24-Oct-2020
- Confirm compatibility with Foundry 0.7.5

## 0.3.0 17-Sep-2020
- Add macros directory for full export
- Change logging to be more informative
- Removed .setup()

## 0.2.5    
Remove Compendium from README
Verify compatibility with Foundry 0.7.2

## 0.2.4 Remove compendium as an export option

## 0.2.3 Simplify description

## 0.2.2 Typo.

## 0.2.0 Write single export per sidebar tab to backup directory

## 0.1.2 Skeleton to look at renderSidebarTab

## 0.1.1 Clean-up of copied files

## 0.1.0 Created
