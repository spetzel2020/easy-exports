# BUGS
## Support for Foundry 0.8.1
>>> Re-import doesn't work because Compendium.create doesn't exist

# REFACTORING
- case statement on allowable entities can be replaced with comparison against SIDEBAR_ENTITIES

# FEATURES
- Option to export assets as well??
    - Would need to read multiple directories and Zip them - requires accessing the server (unless they exist on the client)

- Dialog for selectively re-importing from Full Backup
- Change "Easy Export" in title bar to just "Export"

- Way to do time-triggered Export? 
    - Not clear you can do this without popping up the File write dialog at the time you're writing (in other words, I don't think you can defer this)

# COMPLETED FEATURES
v0.5.0 Button in basic controls or in Export/Import dialog to do Full Backup (actually just separate exports)
