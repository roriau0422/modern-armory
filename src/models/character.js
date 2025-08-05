const db = require('./database');

class Character {
    static async findByGuid(guid) {
        try {
            const characters = await db.charactersQuery(`
                SELECT 
                    guid, account, name, race, class, gender, level, xp, money,
                    position_x, position_y, position_z, map, instance_id, 
                    instance_mode_mask, orientation, taximask, cinematic, 
                    totaltime, leveltime, rest_bonus, logout_time, 
                    is_logout_resting, resettalents_cost, resettalents_time, 
                    trans_x, trans_y, trans_z, trans_o, transguid, extra_flags, 
                    stable_slots, at_login, zone, online, death_expire_time, 
                    taxi_path, arenaPoints, totalHonorPoints, todayHonorPoints, 
                    yesterdayHonorPoints, totalKills, todayKills, yesterdayKills, 
                    chosenTitle, knownCurrencies, watchedFaction, drunk, health, 
                    power1, power2, power3, power4, power5, power6, power7, 
                    latency, talentGroupsCount, activeTalentGroup, exploredZones, equipmentCache, 
                    ammoId, knownTitles, actionBars, grantableLevels
                FROM characters 
                WHERE guid = ? AND deleteDate IS NULL
           `, [guid]);

            return characters[0] || null;
        } catch (error) {
            console.error('Error finding character by GUID:', error);
            throw error;
        }
    }

    static async findByName(name) {
        try {
            const characters = await db.charactersQuery(`
                SELECT 
                    guid, account, name, race, class, gender, level, xp, money,
                    totaltime, leveltime, logout_time, online, zone, map,
                    totalHonorPoints, totalKills, arenaPoints
                FROM characters 
                WHERE name = ? AND deleteDate IS NULL
            `, [name]);

            return characters[0] || null;
        } catch (error) {
            console.error('Error finding character by name:', error);
            throw error;
        }
    }

    static async search(query, limit = 50) {
        try {
            const characters = await db.charactersQuery(`
                SELECT 
                    guid, name, race, class, gender, level, zone,
                    totaltime, logout_time, online, totalHonorPoints, totalKills
                FROM characters 
                WHERE name LIKE ? AND deleteDate IS NULL
                ORDER BY level DESC, totaltime DESC
                LIMIT ${parseInt(limit)}
            `, [`%${query}%`]);

            return characters;
        } catch (error) {
            console.error('Error searching characters:', error);
            throw error;
        }
    }

    static async getTopCharacters(limit = 20) {
        try {
            const characters = await db.charactersQuery(`
                SELECT 
                    guid, name, race, class, gender, level, zone,
                    totaltime, logout_time, online, totalHonorPoints, totalKills
                FROM characters 
                WHERE level > 1 AND deleteDate IS NULL
                ORDER BY level DESC, totaltime DESC
                LIMIT ${parseInt(limit)}
            `);

            return characters;
        } catch (error) {
            console.error('Error getting top characters:', error);
            throw error;
        }
    }

    static async getCharacterEquipment(guid) {
        try {
            const equipment = await db.charactersQuery(`
                SELECT 
                    ci.slot, ci.item
                FROM character_inventory ci
                WHERE ci.guid = ? AND ci.bag = 0 AND ci.slot BETWEEN 0 AND 18
                ORDER BY ci.slot
            `, [guid]);

            return equipment;
        } catch (error) {
            console.error('Error getting character equipment:', error);
            throw error;
        }
    }

    static async getCharacterTalents(guid) {
        try {
            const talents = await db.charactersQuery(`
                SELECT spell, specMask
                FROM character_talent 
                WHERE guid = ?
            `, [guid]);

            return talents;
        } catch (error) {
            console.error('Error getting character talents:', error);
            throw error;
        }
    }

    static async getCharacterAchievements(guid) {
        try {
            const achievements = await db.charactersQuery(`
                SELECT achievement, date
                FROM character_achievement 
                WHERE guid = ?
                ORDER BY date DESC
                LIMIT 50
            `, [guid]);

            return achievements;
        } catch (error) {
            console.error('Error getting character achievements:', error);
            throw error;
        }
    }

    static async getCharacterGuild(guid) {
        try {
            const guild = await db.charactersQuery(`
                SELECT 
                    g.guildid, g.name as guild_name, g.info, g.motd,
                    g.createdate, g.leaderguid,
                    gm.rank, gm.pnote, gm.offnote
                FROM guild_member gm
                JOIN guild g ON gm.guildid = g.guildid
                WHERE gm.guid = ?
            `, [guid]);

            return guild[0] || null;
        } catch (error) {
            console.error('Error getting character guild:', error);
            throw error;
        }
    }

    static async getOnlineCharacters() {
        try {
            const characters = await db.charactersQuery(`
                SELECT 
                    guid, name, race, class, gender, level, zone, map
                FROM characters 
                WHERE online = 1 AND deleteDate IS NULL
                ORDER BY level DESC
            `);

            return characters;
        } catch (error) {
            console.error('Error getting online characters:', error);
            throw error;
        }
    }

    static async getCharacterStats() {
        try {
            const [totalChars] = await db.charactersQuery('SELECT COUNT(*) as count FROM characters WHERE deleteDate IS NULL');
            const [onlineChars] = await db.charactersQuery('SELECT COUNT(*) as count FROM characters WHERE online = 1 AND deleteDate IS NULL');
            const [maxLevel] = await db.charactersQuery('SELECT MAX(level) as maxLevel FROM characters WHERE deleteDate IS NULL');
            const [avgLevel] = await db.charactersQuery('SELECT AVG(level) as avgLevel FROM characters WHERE level > 1 AND deleteDate IS NULL');

            // Ensure we handle null/undefined values properly
            const avgLevelValue = avgLevel && avgLevel.avgLevel ? parseFloat(avgLevel.avgLevel) : 0;
            const maxLevelValue = maxLevel && maxLevel.maxLevel ? parseInt(maxLevel.maxLevel) : 0;
            const totalCharsValue = totalChars && totalChars.count ? parseInt(totalChars.count) : 0;
            const onlineCharsValue = onlineChars && onlineChars.count ? parseInt(onlineChars.count) : 0;

            return {
                totalCharacters: totalCharsValue,
                onlineCharacters: onlineCharsValue,
                maxLevel: maxLevelValue,
                averageLevel: isNaN(avgLevelValue) ? 0 : Math.round(avgLevelValue)
            };
        } catch (error) {
            console.error('Error getting character stats:', error);
            // Return safe defaults instead of throwing
            return {
                totalCharacters: 0,
                onlineCharacters: 0,
                maxLevel: 0,
                averageLevel: 0
            };
        }
    }
}

module.exports = Character;