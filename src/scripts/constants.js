const CONSTANTS = {
  MODULE_ID: "easy-exports",
  MODULE_NAME: "easy-exports",
  FULL_BACKUP_KEY: "fullBackup",
  //ENTITY_TYPES has the entity names (liek Actor etc)
  //Surely this is available somwhere - the mapping between sidebartab and actual Entity
  SIDEBAR_TO_ENTITY: {
    scenes: "Scene",
    actors: "Actor",
    items: "Item",
    journal: "JournalEntry",
    playlists: "Playlist",
    tables: "RollTable",
    macros: "Macro",
    rolltable: "RollTable",
  },
};

CONSTANTS.PATH = `modules/${CONSTANTS.MODULE_ID}/`;

export default CONSTANTS;
