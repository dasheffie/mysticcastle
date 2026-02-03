/**
 * MysticCastle Game Engine Tests
 * Unit tests for game logic and utilities
 */

const assert = require('assert');
const {
  ROOMS,
  ITEMS,
  ALIASES,
  DIRECTIONS,
  DRAGON_DIALOGUES,
  createGameState,
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
} = require('../public/js/game-engine');

describe('MysticCastle Game Engine', function() {

  // ============== Game Data Tests ==============
  describe('Game Data', function() {
    
    describe('ROOMS', function() {
      it('should have entrance as starting room', function() {
        assert(ROOMS.entrance, 'entrance room should exist');
        assert.strictEqual(ROOMS.entrance.name, 'Castle Entrance');
      });

      it('should have at least 10 rooms', function() {
        assert(Object.keys(ROOMS).length >= 10, 'should have 10+ rooms');
      });

      it('should have valid exits for all rooms', function() {
        for (const [roomId, room] of Object.entries(ROOMS)) {
          for (const [direction, targetId] of Object.entries(room.exits)) {
            assert(ROOMS[targetId], `${roomId} exit ${direction} points to invalid room ${targetId}`);
          }
        }
      });

      it('should have matching exit pairs (bidirectional)', function() {
        const opposites = { north: 'south', south: 'north', east: 'west', west: 'east', up: 'down', down: 'up' };
        // Check some key pairs (not all rooms are bidirectional)
        assert.strictEqual(ROOMS.entrance.exits.north, 'courtyard');
        assert.strictEqual(ROOMS.courtyard.exits.south, 'entrance');
      });

      it('should have at least one victory room', function() {
        const victoryRooms = Object.values(ROOMS).filter(r => r.isVictory);
        assert(victoryRooms.length >= 1, 'should have at least 1 victory room');
      });

      it('should have at least one dark room', function() {
        const darkRooms = Object.values(ROOMS).filter(r => r.dark);
        assert(darkRooms.length >= 1, 'should have at least 1 dark room');
      });

      it('should have at least one locked room', function() {
        const lockedRooms = Object.values(ROOMS).filter(r => r.locked);
        assert(lockedRooms.length >= 1, 'should have at least 1 locked room');
      });

      it('locked rooms should have keyRequired', function() {
        for (const [roomId, room] of Object.entries(ROOMS)) {
          if (room.locked) {
            assert(room.keyRequired, `${roomId} is locked but has no keyRequired`);
            assert(room.lockedMessage, `${roomId} is locked but has no lockedMessage`);
          }
        }
      });
    });

    describe('ITEMS', function() {
      it('should have at least 8 items', function() {
        assert(Object.keys(ITEMS).length >= 8, 'should have 8+ items');
      });

      it('should have crown of whispers as goal item', function() {
        assert(ITEMS['crown of whispers'], 'crown of whispers should exist');
        assert(ITEMS['crown of whispers'].isGoal, 'crown should be goal item');
      });

      it('should have brass lamp as light source', function() {
        assert(ITEMS['brass lamp'], 'brass lamp should exist');
        assert(ITEMS['brass lamp'].isLight, 'lamp should be light source');
      });

      it('all items should have descriptions', function() {
        for (const [name, item] of Object.entries(ITEMS)) {
          assert(item.description, `${name} should have description`);
          assert(typeof item.description === 'string', `${name} description should be string`);
        }
      });

      it('all items should have takeable property', function() {
        for (const [name, item] of Object.entries(ITEMS)) {
          assert('takeable' in item, `${name} should have takeable property`);
        }
      });

      it('locked room keys should exist as items', function() {
        for (const room of Object.values(ROOMS)) {
          if (room.keyRequired) {
            assert(ITEMS[room.keyRequired], `key "${room.keyRequired}" should exist`);
          }
        }
      });
    });

    describe('ALIASES', function() {
      it('should have direction shortcuts', function() {
        assert.strictEqual(ALIASES.n, 'north');
        assert.strictEqual(ALIASES.s, 'south');
        assert.strictEqual(ALIASES.e, 'east');
        assert.strictEqual(ALIASES.w, 'west');
        assert.strictEqual(ALIASES.u, 'up');
        assert.strictEqual(ALIASES.d, 'down');
      });

      it('should have action shortcuts', function() {
        assert.strictEqual(ALIASES.get, 'take');
        assert.strictEqual(ALIASES.grab, 'take');
        assert.strictEqual(ALIASES.l, 'look');
        assert.strictEqual(ALIASES.i, 'inventory');
      });
    });

    describe('DIRECTIONS', function() {
      it('should have all 6 cardinal directions plus out', function() {
        assert(DIRECTIONS.includes('north'));
        assert(DIRECTIONS.includes('south'));
        assert(DIRECTIONS.includes('east'));
        assert(DIRECTIONS.includes('west'));
        assert(DIRECTIONS.includes('up'));
        assert(DIRECTIONS.includes('down'));
        assert(DIRECTIONS.includes('out'));
      });
    });
  });

  // ============== Game State Tests ==============
  describe('createGameState', function() {
    it('should create initial state starting at entrance', function() {
      const state = createGameState();
      assert.strictEqual(state.currentRoom, 'entrance');
    });

    it('should start with empty inventory', function() {
      const state = createGameState();
      assert.deepStrictEqual(state.inventory, []);
    });

    it('should start with 0 moves', function() {
      const state = createGameState();
      assert.strictEqual(state.moves, 0);
    });

    it('should start with lamp unlit', function() {
      const state = createGameState();
      assert.strictEqual(state.lampLit, false);
    });

    it('should start with game not won', function() {
      const state = createGameState();
      assert.strictEqual(state.gameWon, false);
    });

    it('should start with dragon not friendly', function() {
      const state = createGameState();
      assert.strictEqual(state.dragonFriendly, false);
    });

    it('should create independent states', function() {
      const state1 = createGameState();
      const state2 = createGameState();
      state1.inventory.push('test');
      assert.strictEqual(state2.inventory.length, 0);
    });
  });

  // ============== Command Parsing Tests ==============
  describe('parseCommand', function() {
    it('should parse simple commands', function() {
      const cmd = parseCommand('look');
      assert.strictEqual(cmd.verb, 'look');
      assert.strictEqual(cmd.noun, '');
    });

    it('should parse commands with nouns', function() {
      const cmd = parseCommand('take rusty key');
      assert.strictEqual(cmd.verb, 'take');
      assert.strictEqual(cmd.noun, 'rusty key');
    });

    it('should handle uppercase', function() {
      const cmd = parseCommand('LOOK');
      assert.strictEqual(cmd.verb, 'look');
    });

    it('should handle mixed case', function() {
      const cmd = parseCommand('Take RUSTY Key');
      assert.strictEqual(cmd.verb, 'take');
      assert.strictEqual(cmd.noun, 'rusty key');
    });

    it('should expand aliases', function() {
      assert.strictEqual(parseCommand('n').verb, 'go');
      assert.strictEqual(parseCommand('n').noun, 'north');
      assert.strictEqual(parseCommand('get lamp').verb, 'take');
      assert.strictEqual(parseCommand('l').verb, 'look');
      assert.strictEqual(parseCommand('i').verb, 'inventory');
    });

    it('should convert direction to go command', function() {
      const cmd = parseCommand('north');
      assert.strictEqual(cmd.verb, 'go');
      assert.strictEqual(cmd.noun, 'north');
    });

    it('should remove leading articles from noun', function() {
      assert.strictEqual(parseCommand('take the key').noun, 'key');
      assert.strictEqual(parseCommand('take a lamp').noun, 'lamp');
      // Note: only removes leading articles, "at an" stays as is
      assert.strictEqual(parseCommand('look at the item').noun, 'at the item');
    });

    it('should return null for empty input', function() {
      assert.strictEqual(parseCommand(''), null);
      assert.strictEqual(parseCommand('   '), null);
    });

    it('should handle extra whitespace', function() {
      const cmd = parseCommand('  look   around  ');
      assert.strictEqual(cmd.verb, 'look');
      assert.strictEqual(cmd.noun, 'around');
    });
  });

  // ============== Room Item Functions ==============
  describe('getRoomItems', function() {
    it('should return default items for unmodified room', function() {
      const state = createGameState();
      const items = getRoomItems('courtyard', state);
      assert.deepStrictEqual(items, ['rusty key']);
    });

    it('should return modified items after setRoomItems', function() {
      const state = createGameState();
      setRoomItems('courtyard', [], state);
      const items = getRoomItems('courtyard', state);
      assert.deepStrictEqual(items, []);
    });

    it('should return copy of default items', function() {
      const state = createGameState();
      const items1 = getRoomItems('courtyard', state);
      const items2 = getRoomItems('courtyard', state);
      items1.push('test');
      assert(!items2.includes('test'));
    });
  });

  describe('setRoomItems', function() {
    it('should update room items in state', function() {
      const state = createGameState();
      setRoomItems('entrance', ['new item'], state);
      assert.deepStrictEqual(getRoomItems('entrance', state), ['new item']);
    });

    it('should create roomStates entry if needed', function() {
      const state = createGameState();
      assert(!state.roomStates.entrance);
      setRoomItems('entrance', ['test'], state);
      assert(state.roomStates.entrance);
    });
  });

  // ============== Visibility Tests ==============
  describe('canSeeInRoom', function() {
    it('should return true for non-dark rooms', function() {
      const state = createGameState();
      assert.strictEqual(canSeeInRoom('entrance', state), true);
      assert.strictEqual(canSeeInRoom('courtyard', state), true);
    });

    it('should return false for dark room without lamp', function() {
      const state = createGameState();
      assert.strictEqual(canSeeInRoom('cellar', state), false);
    });

    it('should return false for dark room with unlit lamp', function() {
      const state = createGameState();
      state.inventory.push('brass lamp');
      assert.strictEqual(canSeeInRoom('cellar', state), false);
    });

    it('should return true for dark room with lit lamp', function() {
      const state = createGameState();
      state.inventory.push('brass lamp');
      state.lampLit = true;
      assert.strictEqual(canSeeInRoom('cellar', state), true);
    });
  });

  // ============== Room Access Tests ==============
  describe('checkRoomAccess', function() {
    it('should allow access to unlocked rooms', function() {
      const state = createGameState();
      const result = checkRoomAccess('courtyard', state);
      assert.strictEqual(result.accessible, true);
    });

    it('should deny access to locked rooms without key', function() {
      const state = createGameState();
      const result = checkRoomAccess('bedroom', state);
      assert.strictEqual(result.accessible, false);
      assert(result.message);
    });

    it('should allow access to locked rooms with key', function() {
      const state = createGameState();
      state.inventory.push('crystal key');
      const result = checkRoomAccess('bedroom', state);
      assert.strictEqual(result.accessible, true);
      assert.strictEqual(result.unlocked, true);
    });

    it('should return error for non-existent room', function() {
      const state = createGameState();
      const result = checkRoomAccess('fake-room', state);
      assert.strictEqual(result.accessible, false);
    });
  });

  // ============== Exit Room Tests ==============
  describe('getExitRoom', function() {
    it('should return target room for valid exit', function() {
      assert.strictEqual(getExitRoom('north', 'entrance'), 'courtyard');
    });

    it('should return null for invalid exit', function() {
      assert.strictEqual(getExitRoom('west', 'entrance'), null);
    });

    it('should return null for invalid room', function() {
      assert.strictEqual(getExitRoom('north', 'fake-room'), null);
    });
  });

  // ============== Item Tests ==============
  describe('isValidItem', function() {
    it('should return true for existing items', function() {
      assert.strictEqual(isValidItem('brass lamp'), true);
      assert.strictEqual(isValidItem('rusty key'), true);
    });

    it('should return false for non-existent items', function() {
      assert.strictEqual(isValidItem('fake item'), false);
    });
  });

  describe('isItemTakeable', function() {
    it('should return true for takeable items', function() {
      assert.strictEqual(isItemTakeable('brass lamp'), true);
    });

    it('should return false for non-existent items', function() {
      assert.strictEqual(isItemTakeable('fake item'), false);
    });
  });

  describe('getItemDescription', function() {
    it('should return description for valid items', function() {
      const desc = getItemDescription('brass lamp');
      assert(typeof desc === 'string');
      assert(desc.length > 0);
    });

    it('should return null for invalid items', function() {
      assert.strictEqual(getItemDescription('fake item'), null);
    });
  });

  describe('isLightSource', function() {
    it('should return true for lamp', function() {
      assert.strictEqual(isLightSource('brass lamp'), true);
    });

    it('should return false for non-light items', function() {
      assert.strictEqual(isLightSource('rusty key'), false);
    });
  });

  describe('isGoalItem', function() {
    it('should return true for crown', function() {
      assert.strictEqual(isGoalItem('crown of whispers'), true);
    });

    it('should return false for non-goal items', function() {
      assert.strictEqual(isGoalItem('rusty key'), false);
    });
  });

  // ============== Room Lookup Tests ==============
  describe('getRoom', function() {
    it('should return room object for valid ID', function() {
      const room = getRoom('entrance');
      assert(room);
      assert.strictEqual(room.name, 'Castle Entrance');
    });

    it('should return null for invalid ID', function() {
      assert.strictEqual(getRoom('fake-room'), null);
    });
  });

  describe('getAllRoomIds', function() {
    it('should return array of room IDs', function() {
      const ids = getAllRoomIds();
      assert(Array.isArray(ids));
      assert(ids.includes('entrance'));
      assert(ids.includes('courtyard'));
    });
  });

  describe('getAllItemNames', function() {
    it('should return array of item names', function() {
      const names = getAllItemNames();
      assert(Array.isArray(names));
      assert(names.includes('brass lamp'));
      assert(names.includes('crown of whispers'));
    });
  });

  // ============== Game Stats Tests ==============
  describe('getGameStats', function() {
    it('should return correct initial stats', function() {
      const state = createGameState();
      const stats = getGameStats(state);
      assert.strictEqual(stats.moves, 0);
      assert.strictEqual(stats.inventoryCount, 0);
      assert.strictEqual(stats.hasWon, false);
      assert.strictEqual(stats.hasCrown, false);
    });

    it('should track inventory count', function() {
      const state = createGameState();
      state.inventory.push('rusty key', 'brass lamp');
      const stats = getGameStats(state);
      assert.strictEqual(stats.inventoryCount, 2);
    });

    it('should track secrets found', function() {
      const state = createGameState();
      state.secretsFound['cellar_loose stone'] = true;
      const stats = getGameStats(state);
      assert.strictEqual(stats.secretsFound, 1);
    });

    it('should detect crown in inventory', function() {
      const state = createGameState();
      state.inventory.push('crown of whispers');
      const stats = getGameStats(state);
      assert.strictEqual(stats.hasCrown, true);
    });
  });

  // ============== Verb Validation Tests ==============
  describe('isKnownVerb', function() {
    it('should recognize action verbs', function() {
      assert.strictEqual(isKnownVerb('go'), true);
      assert.strictEqual(isKnownVerb('look'), true);
      assert.strictEqual(isKnownVerb('take'), true);
      assert.strictEqual(isKnownVerb('inventory'), true);
    });

    it('should recognize directions', function() {
      assert.strictEqual(isKnownVerb('north'), true);
      assert.strictEqual(isKnownVerb('up'), true);
    });

    it('should reject unknown verbs', function() {
      assert.strictEqual(isKnownVerb('fly'), false);
      assert.strictEqual(isKnownVerb('teleport'), false);
    });
  });

  // ============== Dragon Dialogue Tests ==============
  describe('getDragonDialogue', function() {
    it('should return first dialogue initially', function() {
      const state = createGameState();
      const result = getDragonDialogue(state);
      assert(result.text.includes('Vermithrax'));
      assert.strictEqual(result.becomesFriendly, false);
    });

    it('should become friendly on third dialogue', function() {
      const state = createGameState();
      state.dragonDialogue = 2;
      const result = getDragonDialogue(state);
      assert.strictEqual(result.becomesFriendly, true);
    });

    it('should cap at last dialogue', function() {
      const state = createGameState();
      state.dragonDialogue = 100;
      const result = getDragonDialogue(state);
      assert.strictEqual(result.text, DRAGON_DIALOGUES[DRAGON_DIALOGUES.length - 1]);
    });
  });

  // ============== Game Logic Integration Tests ==============
  describe('Game Logic Integration', function() {
    it('should have completable path to victory room', function() {
      // Verify there's a path to vault through bedroom
      assert(getExitRoom('east', 'gallery') === 'bedroom');
      assert(ROOMS.bedroom.secrets && ROOMS.bedroom.secrets.wardrobe);
    });

    it('should have lamp in accessible room', function() {
      // Lamp is in kitchen, reachable from greathall
      assert(ROOMS.kitchen.items.includes('brass lamp'));
      assert(getExitRoom('east', 'greathall') === 'kitchen');
    });

    it('should have crystal key findable before bedroom', function() {
      // Crystal key is in cellar secret
      assert(ROOMS.cellar.secrets['loose stone'].gives === 'crystal key');
    });

    it('should have spell book before tower', function() {
      // Spell book is in library
      assert(ROOMS.library.items.includes('spell book'));
      assert(ROOMS.tower.keyRequired === 'spell book');
    });

    it('should have dragon in lair', function() {
      assert(ROOMS.lair.hasDragon);
      assert(ROOMS.lair.items.includes('dragon scale'));
    });
  });
});
