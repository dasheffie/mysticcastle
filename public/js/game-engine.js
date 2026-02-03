/**
 * MysticCastle Game Engine
 * Extracted game logic for testing and reusability
 */

// ==================== GAME DATA ====================
const ROOMS = {
  entrance: {
    name: "Castle Entrance",
    description: "You stand before the massive iron gates of MysticCastle. The ancient stonework looms above, weathered by centuries. Gargoyles with hollow eyes peer down from their perches. The gates hang open, creaking in the cold breeze. A faded inscription reads: 'Those who seek the Crown must prove their worth.'",
    exits: { north: "courtyard" },
    items: []
  },
  courtyard: {
    name: "Overgrown Courtyard",
    description: "A once-grand courtyard now reclaimed by nature. Dead vines crawl up crumbling statues of forgotten knights. A dry fountain stands in the center, filled with dead leaves. The main keep rises to the north, while archways lead east and west.",
    exits: { south: "entrance", north: "greathall", east: "chapel", west: "stables" },
    items: ["rusty key"]
  },
  greathall: {
    name: "The Great Hall",
    description: "Tattered banners hang from the vaulted ceiling. A massive oak table stretches the length of the hall, still set with tarnished silver. Moonlight streams through shattered windows. A grand staircase leads upward, and a door east leads to the kitchen.",
    exits: { south: "courtyard", up: "gallery", east: "kitchen" },
    items: ["silver goblet"]
  },
  chapel: {
    name: "Abandoned Chapel",
    description: "Rows of dusty pews face a stone altar draped in moth-eaten cloth. Stained glass windows cast eerie colored light. The air smells of old incense and secrets. A confessional booth stands in the corner, its door slightly ajar.",
    exits: { west: "courtyard" },
    items: ["holy symbol"]
  },
  stables: {
    name: "Ruined Stables",
    description: "Empty stalls line the walls, still bearing nameplates for horses long dead. Rotting hay carpets the floor. Something scratched deep gouges into the wooden walls — from the inside. A trapdoor leads down into darkness.",
    exits: { east: "courtyard", down: "cellar" },
    items: []
  },
  cellar: {
    name: "Wine Cellar",
    dark: true,
    description: "Complete darkness surrounds you. The air is cold and damp, thick with mold and old wine. You hear water dripping somewhere in the blackness.",
    descriptionLit: "Your lamp reveals rows of wine racks, most bottles shattered. Cobwebs hang like curtains. Against the far wall, you notice a loose stone that doesn't quite match the others. In the back corner, a crumbling archway leads to descending stairs. Warm air rises from below, carrying the scent of sulfur.",
    exits: { up: "stables", down: "dungeonstairs" },
    items: ["ancient wine"],
    secrets: {
      "loose stone": {
        description: "Behind the loose stone, you find a hidden compartment containing a gleaming crystal key!",
        gives: "crystal key",
        oneTime: true
      }
    }
  },
  kitchen: {
    name: "Castle Kitchen",
    description: "A cavernous kitchen with massive cold fireplaces. Copper pots hang from hooks, green with age. Strangely, a single candle burns on the center table, its flame steady despite no wind.",
    exits: { west: "greathall" },
    items: ["brass lamp"]
  },
  gallery: {
    name: "Portrait Gallery",
    description: "A long hallway lined with portraits of former lords and ladies. Their painted eyes seem to follow you. Many faces have been scratched out. The last portrait shows a king holding a golden crown — but the crown has been cut from the canvas.",
    exits: { down: "greathall", north: "library", east: "bedroom" },
    items: []
  },
  library: {
    name: "The Grand Library",
    description: "Towering bookshelves reach to a domed ceiling painted with constellations. Most books have crumbled to dust. A reading desk holds an open book with strange symbols. A spiral staircase leads up to the tower.",
    exits: { south: "gallery", up: "tower" },
    items: ["spell book"]
  },
  bedroom: {
    name: "Lord's Bedchamber",
    description: "A four-poster bed dominates the room, its curtains dusty. A vanity mirror reflects nothing — just empty darkness where your reflection should be. An ornate wardrobe stands against the wall. Looking closer at the wardrobe, you notice it has a false back...",
    exits: { west: "gallery" },
    items: [],
    locked: true,
    lockedMessage: "The bedroom door is locked with an ornate crystal lock.",
    keyRequired: "crystal key",
    secrets: {
      "wardrobe": {
        description: "You push aside the false back of the wardrobe and discover a hidden passage leading to a secret vault!",
        opensRoom: "vault",
        oneTime: true
      }
    }
  },
  tower: {
    name: "Wizard's Tower",
    description: "The castle's highest tower. Arcane instruments and star charts cover every surface. In the center, on a pedestal of black marble, rests THE CROWN OF WHISPERS — glowing with inner light.",
    exits: { down: "library" },
    items: ["crown of whispers"],
    locked: true,
    lockedMessage: "A magical barrier blocks your way. Strange runes pulse with purple light. Perhaps a spell book could help...",
    keyRequired: "spell book"
  },
  vault: {
    name: "The Secret Vault",
    description: "You've discovered the castle's hidden treasure vault! Gold coins glitter in the corners, jeweled weapons hang on walls. But the true treasure is the journey that brought you here.",
    exits: { out: "bedroom" },
    items: [],
    isVictory: true
  },
  dungeonstairs: {
    name: "Descending Stairs",
    description: "A narrow spiral staircase carved from black stone winds down into the earth. The air grows warmer with each step. Scorch marks line the walls, and the smell of sulfur grows stronger. Ancient dwarven runes warn: 'TURN BACK - HERE SLEEPS FIRE.'",
    exits: { up: "cellar", down: "lair" },
    items: []
  },
  lair: {
    name: "The Dragon's Lair",
    description: "An enormous cavern glitters with gold and jewels piled into mountains. Atop the largest hoard lies VERMITHRAX, an ancient red dragon. One golden eye cracks open, watching you. Smoke curls from his nostrils. 'A thief?' his voice rumbles like thunder. 'Or... a guest? It has been so long since I had company.'",
    exits: { up: "dungeonstairs" },
    items: ["dragon scale", "golden chalice"],
    hasDragon: true,
    dragonState: "awake"
  }
};

const ITEMS = {
  "rusty key": { description: "An old iron key, orange with rust but still functional. It might open something simple.", takeable: true },
  "silver goblet": { description: "A tarnished silver goblet engraved with the castle's coat of arms.", takeable: true },
  "holy symbol": { description: "A small golden medallion bearing a sacred symbol. It feels warm to the touch.", takeable: true },
  "brass lamp": { description: "An old brass oil lamp. It still has fuel and could light dark places. Use it to light it.", takeable: true, isLight: true },
  "ancient wine": { description: "A dusty bottle of wine, hundreds of years old. The cork is still sealed.", takeable: true },
  "crystal key": { description: "A key carved from pure crystal. It glows faintly with inner light.", takeable: true },
  "spell book": { description: "A leather-bound tome of arcane knowledge. The pages shimmer with magical energy.", takeable: true },
  "crown of whispers": { description: "The legendary Crown of Whispers. Ancient voices murmur from within its golden band.", takeable: true, isGoal: true },
  "dragon scale": { description: "A palm-sized scale shed by Vermithrax. It shimmers crimson and gold, warm to the touch. A gift from the dragon himself.", takeable: true },
  "golden chalice": { description: "A jewel-encrusted chalice from the dragon's hoard. Vermithrax allowed you to take it - a sign of respect.", takeable: true },
  "dragon tooth": { description: "An ancient dragon tooth, given as a token of friendship by Vermithrax. It pulses with inner fire.", takeable: true }
};

const ALIASES = {
  n: "north", s: "south", e: "east", w: "west", u: "up", d: "down",
  get: "take", grab: "take", pick: "take",
  l: "look", examine: "look", x: "look", inspect: "look", search: "look",
  i: "inventory", inv: "inventory",
  light: "use", activate: "use", open: "use",
  speak: "talk", say: "talk", chat: "talk", greet: "talk",
  give: "offer", present: "offer", share: "offer"
};

const DIRECTIONS = ["north", "south", "east", "west", "up", "down", "out"];

// ==================== GAME STATE FACTORY ====================
function createGameState() {
  return {
    currentRoom: "entrance",
    inventory: [],
    moves: 0,
    roomStates: {},
    secretsFound: {},
    lampLit: false,
    gameWon: false,
    vaultOpen: false,
    dragonDialogue: 0,
    dragonFriendly: false,
    startTime: Date.now()
  };
}

// ==================== PURE FUNCTIONS ====================

/**
 * Parse a command string into verb and noun
 * @param {string} input - User's command
 * @returns {object|null} - { verb, noun } or null if empty
 */
function parseCommand(input) {
  const words = input.toLowerCase().trim().split(/\s+/);
  if (words.length === 0 || words[0] === "") return null;
  
  let verb = words[0];
  let noun = words.slice(1).join(" ");
  
  if (ALIASES[verb]) {
    const aliased = ALIASES[verb];
    if (DIRECTIONS.includes(aliased) && !noun) { 
      noun = aliased; 
      verb = "go"; 
    } else {
      verb = aliased;
    }
  }
  
  if (DIRECTIONS.includes(verb) && !noun) { 
    noun = verb; 
    verb = "go"; 
  }
  
  // Remove articles
  noun = noun.replace(/^(the|a|an)\s+/i, "");
  
  return { verb, noun };
}

/**
 * Get items in a room, accounting for state changes
 * @param {string} roomId - Room identifier
 * @param {object} gameState - Current game state
 * @returns {string[]} - Array of item names
 */
function getRoomItems(roomId, gameState) {
  if (gameState.roomStates[roomId]?.items !== undefined) {
    return gameState.roomStates[roomId].items;
  }
  return [...ROOMS[roomId].items];
}

/**
 * Set items in a room
 * @param {string} roomId - Room identifier
 * @param {string[]} items - New items array
 * @param {object} gameState - Game state to modify
 */
function setRoomItems(roomId, items, gameState) {
  if (!gameState.roomStates[roomId]) {
    gameState.roomStates[roomId] = {};
  }
  gameState.roomStates[roomId].items = items;
}

/**
 * Check if player can see in the current room
 * @param {string} roomId - Room identifier
 * @param {object} gameState - Current game state
 * @returns {boolean}
 */
function canSeeInRoom(roomId, gameState) {
  const room = ROOMS[roomId];
  if (!room.dark) return true;
  return gameState.inventory.includes("brass lamp") && gameState.lampLit;
}

/**
 * Check if a room is accessible (not locked or player has key)
 * @param {string} roomId - Room to check
 * @param {object} gameState - Current game state
 * @returns {object} - { accessible: boolean, message?: string }
 */
function checkRoomAccess(roomId, gameState) {
  const room = ROOMS[roomId];
  if (!room) {
    return { accessible: false, message: "That room doesn't exist." };
  }
  if (!room.locked) {
    return { accessible: true };
  }
  
  const key = room.keyRequired;
  if (gameState.inventory.includes(key)) {
    return { accessible: true, unlocked: true, key };
  }
  
  return { accessible: false, message: room.lockedMessage };
}

/**
 * Validate a direction from current room
 * @param {string} direction - Direction to check
 * @param {string} currentRoom - Current room ID
 * @returns {string|null} - Target room ID or null
 */
function getExitRoom(direction, currentRoom) {
  const room = ROOMS[currentRoom];
  if (!room) return null;
  return room.exits[direction] || null;
}

/**
 * Check if an item exists in the game
 * @param {string} itemName - Item to check
 * @returns {boolean}
 */
function isValidItem(itemName) {
  return itemName in ITEMS;
}

/**
 * Check if an item is takeable
 * @param {string} itemName - Item to check
 * @returns {boolean}
 */
function isItemTakeable(itemName) {
  const item = ITEMS[itemName];
  return item ? item.takeable : false;
}

/**
 * Get item description
 * @param {string} itemName - Item name
 * @returns {string|null}
 */
function getItemDescription(itemName) {
  const item = ITEMS[itemName];
  return item ? item.description : null;
}

/**
 * Check if item is a light source
 * @param {string} itemName - Item name
 * @returns {boolean}
 */
function isLightSource(itemName) {
  const item = ITEMS[itemName];
  return item ? !!item.isLight : false;
}

/**
 * Check if item is the goal (win condition)
 * @param {string} itemName - Item name
 * @returns {boolean}
 */
function isGoalItem(itemName) {
  const item = ITEMS[itemName];
  return item ? !!item.isGoal : false;
}

/**
 * Get room by ID
 * @param {string} roomId - Room identifier
 * @returns {object|null}
 */
function getRoom(roomId) {
  return ROOMS[roomId] || null;
}

/**
 * Get all room IDs
 * @returns {string[]}
 */
function getAllRoomIds() {
  return Object.keys(ROOMS);
}

/**
 * Get all item names
 * @returns {string[]}
 */
function getAllItemNames() {
  return Object.keys(ITEMS);
}

/**
 * Calculate game statistics
 * @param {object} gameState - Current game state
 * @returns {object} - Statistics
 */
function getGameStats(gameState) {
  const elapsedMs = Date.now() - gameState.startTime;
  const minutes = Math.floor(elapsedMs / 60000);
  
  return {
    moves: gameState.moves,
    inventoryCount: gameState.inventory.length,
    secretsFound: Object.keys(gameState.secretsFound).length,
    totalSecrets: 2, // loose stone + wardrobe
    hasWon: gameState.gameWon,
    hasCrown: gameState.inventory.includes("crown of whispers"),
    dragonFriendly: gameState.dragonFriendly,
    minutesPlayed: minutes
  };
}

/**
 * Validate if a command verb is known
 * @param {string} verb - Command verb
 * @returns {boolean}
 */
function isKnownVerb(verb) {
  const knownVerbs = [
    "go", "look", "take", "drop", "inventory", "use", "read", 
    "talk", "offer", "help", "save", "load"
  ];
  return knownVerbs.includes(verb) || DIRECTIONS.includes(verb);
}

// ==================== DRAGON DIALOGUE ====================
const DRAGON_DIALOGUES = [
  "'You do not flee,' the dragon muses, smoke curling from his jaws. 'Interesting. Most mortals run screaming. I am Vermithrax, last of the fire drakes. Tell me, little one, what brings you to my lair?'",
  "'The Crown of Whispers?' Vermithrax chuckles, a sound like grinding boulders. 'That trinket upstairs? I've watched a hundred fools die seeking it. You're different. You stopped to speak with a dragon instead of stealing from him.'",
  "'I have slept beneath this castle for a thousand years,' the dragon sighs, 'guarding treasures that no longer matter. Company is worth more than gold now. Take something from my hoard - a token of... friendship. Just promise you'll return to tell me tales of the world above.'",
  "'Go on then, take what catches your eye. The scale, the chalice - or if you've truly earned my respect, ask for a tooth. That is a gift I give only to those I consider equals.'",
  "Vermithrax settles back onto his gold pile, one eye still watching you warmly. 'Visit again, little friend. An old dragon appreciates good company.'"
];

/**
 * Get dragon dialogue for current state
 * @param {object} gameState - Current game state
 * @returns {object} - { text, becomesFriendly }
 */
function getDragonDialogue(gameState) {
  const index = Math.min(gameState.dragonDialogue, DRAGON_DIALOGUES.length - 1);
  const text = DRAGON_DIALOGUES[index];
  const becomesFriendly = gameState.dragonDialogue === 2;
  return { text, becomesFriendly };
}

// ==================== EXPORTS ====================
// Node.js module exports (for testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Data
    ROOMS,
    ITEMS,
    ALIASES,
    DIRECTIONS,
    DRAGON_DIALOGUES,
    
    // Factory
    createGameState,
    
    // Functions
    parseCommand,
    getRoomItems,
    setRoomItems,
    canSeeInRoom,
    checkRoomAccess,
    getExitRoom,
    isValidItem,
    isItemTakeable,
    getItemDescription,
    isLightSource,
    isGoalItem,
    getRoom,
    getAllRoomIds,
    getAllItemNames,
    getGameStats,
    isKnownVerb,
    getDragonDialogue
  };
}
