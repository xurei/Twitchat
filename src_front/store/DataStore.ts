import * as TriggerActionDataTypes from "@/types/TriggerActionDataTypes";
import { TriggerTypes, TriggerTypesDefinitionList, type TriggerActionDelayData, type TriggerActionObsDataAction, type TriggerData, type TriggerTypeDefinition, type TriggerTypesValue } from "@/types/TriggerActionDataTypes";
import type { TwitchatDataTypes } from "@/types/TwitchatDataTypes";
import ApiHelper from "@/utils/ApiHelper";
import Utils from "@/utils/Utils";
import TwitchUtils from "@/utils/twitch/TwitchUtils";
import type { JsonValue } from "type-fest";
import StoreProxy from "./StoreProxy";

/**
 * Fallback to sessionStorage if localStorage isn't available
 * Created : 18/10/2020
 */
export default class DataStore {

	public static syncToServer:boolean = true;

	public static DATA_VERSION:string = "v";
	public static UPDATE_INDEX:string = "updateIndex";
	public static GREET_AUTO_DELETE_AFTER:string = "greetAutoDeleteAfter";
	public static GREET_AUTO_SCROLL_DOWN:string = "greetScrollDownAuto";
	public static GREET_AUTO_HEIGHT:string = "greetHeight";
	public static OBS_PORT:string = "obsPort";
	public static OBS_PASS:string = "obsPass";
	public static OBS_IP:string = "obsIP";
	public static OBS_CONNECTION_ENABLED:string = "obsConnectionEnabled";
	public static OBS_CONF_SCENES:string = "obsConf_scenes";
	public static OBS_CONF_MUTE_UNMUTE:string = "obsConf_muteUnmute";
	public static OBS_CONF_PERMISSIONS:string = "obsConf_permissions";
	public static TRIGGERS:string = "triggers";
	public static BOT_MESSAGES:string = "botMessages";
	public static RAFFLE_OVERLAY_COUNTDOWN:string = "raffle_showCountdownOverlay";
	public static CYPHER_KEY:string = "cypherKey";
	public static DEVMODE:string = "devmode";
	public static SPOTIFY_APP_PARAMS:string = "spotifyAppParams";
	public static SPOTIFY_AUTH_TOKEN:string = "spotifyAuthToken";
	public static STREAM_INFO_PRESETS:string = "streamInfoPresets";
	public static TTS_PARAMS:string = "ttsParams";
	public static EMERGENCY_PARAMS:string = "emergencyParams";
	public static EMERGENCY_FOLLOWERS:string = "emergencyFollowers";
	public static ALERT_PARAMS:string = "chatAlertParams";
	public static SPOILER_PARAMS:string = "spoilerParams";
	public static CHAT_HIGHLIGHT_PARAMS:string = "chatHighlightParams";
	public static TWITCH_AUTH_TOKEN:string = "oAuthToken";
	public static SYNC_DATA_TO_SERVER:string = "syncToServerV2";//Renamed to force sync on people after twitchat refactoring.
	public static GREET_HISTORY:string = "greetHistory";
	public static MUSIC_PLAYER_PARAMS:string = "musicPlayerParams";
	public static VOICEMOD_PARAMS:string = "voicemodParams";
	public static VOICE_BOT_ACTIONS:string = "voiceActions";
	public static VOICE_BOT_LANG:string = "voiceLang";
	public static AUTOMOD_PARAMS:string = "automodParams";
	public static DONOR_LEVEL:string = "donorLevel";
	public static TWITCHAT_AD_WARNED:string = "adWarned";
	public static TWITCHAT_AD_NEXT_DATE:string = "adNextTS";
	public static TWITCHAT_SPONSOR_PUBLIC_PROMPT:string = "sponsorPublicPrompt";
	public static TWITCHAT_RIGHT_CLICK_HINT_PROMPT:string = "rightClickHintPrompt";
	public static CHAT_COLUMNS_CONF:string = "chatColumnsConf";
	public static COLLAPSE_PARAM_AD_INFO:string = "collapseParamAdInfo";
	public static COUNTERS:string = "counters";
	public static VALUES:string = "values";
	public static LANGUAGE:string = "lang";
	public static CHAT_COL_CTA:string = "chatColCTA";
	public static WEBSOCKET_TRIGGER:string = "websocketTrigger";
	public static REDIRECT:string = "redirect";
	public static TRIGGER_SORT_TYPE:string = "triggerSortType";
	public static TOOLTIP_AUTO_OPEN:string = "tooltipAutoOpen";
	public static THEME:string = "theme";
	public static POLL_DEFAULT_DURATION:string = "pollDuration";
	public static PREDICTION_DEFAULT_DURATION:string = "predictionDuration";
	public static ULULE_PROJECT:string = "ululeProject";
	public static ULULE_GOALS:string = "ululeGoals";
	public static ULULE_TITLE:string = "ululeTitle";
	public static ULULE_CURRENCY:string = "ululeCurrency";
	public static HEAT_ENABLED:string = "heatEnabled";
	public static HEAT_SCREENS:string = "heatScreens";
	public static PATREON_AUTH_TOKEN:string = "patreonAuthToken";
	public static CUSTOM_USERNAMES:string = "customUsernames";
	public static CUSTOM_BADGE_LIST:string = "customBadgeList";
	public static CUSTOM_USER_BADGES:string = "customUserBadges";
	public static ANNOUNCEMENTS_READ:string = "announcementsRead";
	public static NEW_FLAGS:string = "newFlags";
	public static GOXLR_CONFIG:string = "goxlrConfig";
	public static RAID_HISTORY:string = "raidHistory";
	public static SENT_MESSAGE_HISTORY:string = "sentMessageHistory";
	public static ENDING_CREDITS_PARAMS:string = "endingCreditsParams";
	public static AD_BREAK_SCOPES_REQUEST:string = "adBreakScopesRequested";
	public static AD_BREAK_OVERLAY_PARAMS:string = "adBreakOverlayParams";
	public static OVERLAY_DISTORTIONS:string = "overlayDistortions";
	public static YOUTUBE_AUTH_TOKEN:string = "youtubeAuthToken";
	public static TRIGGERS_TREE:string = "triggersTree";
	public static PARAMS_SECTIONS:string = "paramsSections";
	public static PARAMS_SECTIONS_CTA:string = "paramsSectionsCTA";
	public static BITS_WALL_PARAMS:string = "bitsWallParams";
	public static AB_SENTRY:string = "ab_sentry";
	public static DISCORD_PARAMS:string = "discordParams";
	public static STREAMLABS:string = "streamlabs";
	public static STREAMELEMENTS:string = "streamelements";
	public static PREDICTION_OVERLAY_PARAMS:string = "predictionOverlayParams";
	public static POLL_OVERLAY_PARAMS:string = "pollOverlayParams";
	public static TIPEEE:string = "tipeee";
	public static PINNED_CHAT_MENU_ITEM:string = "pinnedChatMenuItem";
	public static LUMIA:string = "lumia";
	public static BINGO_GRIDS:string = "bingoGrids";

	private static store:Storage;
	private static dataPrefix:string = "twitchat_";
	private static saveTO:number = -1;
	private static dataImported:boolean = false;
	private static rawStore:{[key:string]:(JsonValue|unknown)} = {};

	/**
	 * These values won't be saved to the server
	 */
	private static UNSYNCED_DATA:string[] = [
		"syncToserver",
		this.AB_SENTRY,
		this.OBS_PASS,
		this.TWITCH_AUTH_TOKEN,
		this.SPOTIFY_AUTH_TOKEN,
		this.SPOTIFY_APP_PARAMS,
		this.GREET_HISTORY,
		this.SYNC_DATA_TO_SERVER,
		this.CHAT_COL_CTA,
		this.PARAMS_SECTIONS_CTA,
		this.REDIRECT,
		this.TOOLTIP_AUTO_OPEN,
		this.POLL_DEFAULT_DURATION,
		this.PREDICTION_DEFAULT_DURATION,
		this.PATREON_AUTH_TOKEN,
		this.ANNOUNCEMENTS_READ,
		this.NEW_FLAGS,
		this.SENT_MESSAGE_HISTORY,
		this.YOUTUBE_AUTH_TOKEN,
		this.STREAMLABS,
		this.STREAMELEMENTS,
		this.TIPEEE,
	];


	/********************
	* GETTER / SETTERS *
	********************/



	/******************
	* PUBLIC METHODS *
	******************/
	/**
	 * Initialize the storage.
	 */
	public static init():void {
		this.store = localStorage? localStorage : sessionStorage;
		this.syncToServer = this.get(this.SYNC_DATA_TO_SERVER) !== "false";

		//load LocalStorage data and parse values from string to number and booleans
		//if necessary and keep it on a local typed stored "rawStore"
		const items = this.getAll();
		for (const key in items) {
			try{
				items[key] = JSON.parse(items[key] as string);
			}catch(error) {
				//parsing failed, that's because it's a simple string, just keep it
			}
		}
		this.rawStore = items;
	}

	/**
	 * Makes asynchronous data migrations after being authenticated
	 */
	public static async migrateData(data:any):Promise<any> {
		let v = parseInt(data[this.DATA_VERSION]) || 12;
		const latestVersion = 53;

		this.cleanupPreV7Data(data);

		if(v < 11) {
			const res:{[key:string]:unknown} = {};
			res[this.DATA_VERSION] = latestVersion;
			return res;
		}

		if(v<=12) {
			this.fixTTSPlaceholders(data);
			v = 13;
		}
		if(v==13) {
			this.cleanupOldData(data);
			v = 14;
		}
		if(v==14) {
			this.migrateChatCommandTriggers(data);
			v = 15;
		}
		if(v==15) {
			this.migrateEmergencyAutoblock(data);
			v = 16;
		}
		if(v==16) {
			delete data["p:historySize"];
			v = 17;
		}
		if(v==17) {
			//Here was a beta temporary fix not needed anymore.
			v = 18;
		}
		if(v==18) {
			this.migrateRaffleTriggerDuration(data);
			v = 19;
		}
		if(v==19 || v==20) {
			this.migrateRaffleTriggerTypoAndTextSize(data);
			v = 21;
		}
		if(v==21) {
			this.migrateTriggerSubgiftPlaceholder(data);
			v = 22;
		}
		if(v==22) {
			await this.migrateStreamTags(data);
			v = 23;
		}
		if(v==23) {
			//Here was a beta temporary fix not needed anymore.
			v = 24;
		}
		if(v==24) {
			await this.migrateStreamTags(data);
			v = 25;
		}
		if(v==25) {
			this.migratePermissions(data);
			v = 26;
		}
		if(v==26) {
			this.migrateChatColUserAndCommands(data);
			v = 27;
		}
		if(v==27) {
			this.migrateEmergencyTOs(data);
			v = 28;
		}
		if(v==28) {
			this.migratePermissions(data);
			this.migrateEmergencyTOs(data);
			v = 29;
		}
		if(v==29 || v==30){
			this.cleanupPreV7Data(data);
			delete data["syncToserver"];
			v = 31
		}
		if(v==31) {
			//v31 is a refactor of the datastore logic to fix failing migration cleanups
			//Instead of migrating data of the localStorage it now migrates JSON
			//data then saves it on the localStorage.

			//Redoing old migration to make sure they're effective
			this.cleanupPreV7Data(data);
			delete data["syncToserver"];
			v = 32;
		}
		if(v==32) {
			this.enableLiveOnOffNotification(data);
			v = 33;
		}
		if(v==33) {
			this.cleanNonAttributedOBSScenes(data);
			v = 34;
		}
		if(v==34) {
			this.migrateTrackAddedTriggerPlaceholder(data);
			v = 35;
		}
		if(v==35) {
			this.migrateOBSTriggerActions(data);
			v = 36;
		}
		if(v==36) {
			this.migrateTriggersData(data);
			v = 37;
		}
		if(v==37) {
			this.populateCounterPlaceholder(data);
			v = 38;
		}
		if(v==38) {
			this.addWatchStreakFilter(data);
			v = 39;
		}
		if(v==39) {
			//Removed custom interface scale now that OBS handles it natively on docks
			delete data["interfaceScale"];
			v = 40;
		}
		if(v==40) {
			//EDIT: hype chat removed, that migration about it is now useless
			v = 41;
		}
		if(v==41) {
			this.fixCommandsBlockListDefaultValue(data);
			v = 42;
		}
		if(v==42) {
			this.resetCustomUsernames(data);
			v = 43;
		}
		if(v==43) {
			//Removed migration because it became useless
			//Keeping this version for beta testers
			v = 44;
		}
		if(v==44) {
			delete data["goxlrEnabled"];
			v = 45;
		}
		if(v==45) {
			delete data["goxlrEnabled"];
			this.addGoXLRReadMarkDefaults(data);
			v = 46;
		}
		if(v==46) {
			this.migrateTriggersDelay(data);
			v = 47;
		}
		if(v==47) {
			this.fixDataTypes(data);
			v = 48;
		}
		if(v==48) {
			//Some users still have an old trigger data format :/
			//THey have an empty(?) object instead of an array
			const triggers:TriggerData[] = data[DataStore.TRIGGERS];
			if(triggers && !Array.isArray(triggers)) {
				data[DataStore.TRIGGERS] = [];
			}
			if(data[this.ENDING_CREDITS_PARAMS]?.scale) {
				data[this.ENDING_CREDITS_PARAMS].scale = 30;
			}
			this.cleanupHeatTriggerActions(data);
			v = 48.1;
		}
		if(v==48.1) {
			this.addSRFilter(data);
			v = 49;
		}
		if(v==49) {
			this.migrateScheduleActionDuration(data);
			v = 50;
		}
		if(v==50) {
			this.setDefaultQueuesToTriggers(data);
			v = 51;
		}
		if(v==51) {
			this.migratePollPredDurations(data);
			v = 52;
		}
		if(v==52) {
			this.dedupeTriggerTree(data);
			v = latestVersion;
		}

		data[this.DATA_VERSION] = v;
		return data;
	}

	/**
	 * Load user's data from the server
	 * @imp
	 * @returns if user has data or not
	 */
	public static async loadRemoteData(importToLS:boolean = true):Promise<boolean> {
		if(!this.store) this.init();

		try {
			const res = await ApiHelper.call("user/data");
			//Do not import remote data under ver specific data version combo as a
			//hot fix for a massive mistake losing all users data
			if(res.json.data["v"] < 53 && parseInt(this.get(DataStore.DATA_VERSION)) == 52) {
				this.dataImported = true;
				return true;
			}
			if(importToLS) {
				// console.log("Import to local storage...");
				//Import data to local storage.
				if(res.json.success === true) {
					await this.loadFromJSON(res.json.data);
				}
			}
			return res.status != 404;
		}catch(error) {
			console.error("Remote data loading failed !");
			console.log(error);
			return false;
		}
	}

	/**
	 * Replace local data by the given JSON
	 */
	public static async loadFromJSON(json:any):Promise<void> {
		const automodRulesBackup:TwitchatDataTypes.AutomodParamsKeywordFilterData[] = [];
		let automod:TwitchatDataTypes.AutomodParamsData = JSON.parse(this.get(DataStore.AUTOMOD_PARAMS));

		this.rawStore = await this.migrateData(json);//Migrate remote data if necessary

		//Make sure we don't loose unsynced automod rules
		//(should think of a generic way of doing this..)
		if(automod && automod.keywordsFilters && automod.keywordsFilters.length > 0) {
			for (let i = 0; i < automod.keywordsFilters.length; i++) {
				const el = automod.keywordsFilters[i];
				if(!el.serverSync) {
					automodRulesBackup.push( automod.keywordsFilters.splice(i, 1)[0] );
					i--;
					if(i < 0) break;
				}
			}

			//Update storage without non synced rules
			this.set(DataStore.AUTOMOD_PARAMS, automod);

			//Cleanup rules.
			//I made a huge mistake leading to rules duplicating at every call of this
			//method leading to memory overflow. This removes any duplicate
			const doneEntries:{[key:string]:boolean} = {};
			for (let i = 0; i < automodRulesBackup.length; i++) {
				const value = automodRulesBackup[i];
				const key = JSON.stringify(value);
				if(doneEntries[key] !== true) {
					doneEntries[key] = true;
				}else{
					automodRulesBackup.splice(i,1);
					i--;
					if(i < 0) break;
				}
			}
		}

		//Update localstorage data
		for (const key in json) {
			const value = json[key];
			const str = typeof value == "string"? value : JSON.stringify(value);
			this.store.setItem(this.dataPrefix + key, str);
		}

		//Bring back auto mode rules backed up before
		if(automodRulesBackup.length > 0) {
			automod = JSON.parse(this.get(DataStore.AUTOMOD_PARAMS));
			for (let i = 0; i < automodRulesBackup.length; i++) {
				automod.keywordsFilters.push(automodRulesBackup[i]);
			}
			this.set(DataStore.AUTOMOD_PARAMS, automod);
		}

		this.dataImported = true;
		this.save();
	}

	/**
	 * Emergency backup
	 */
	public static async emergencyBackupStorage():Promise<void> {
		try {
			const data = JSON.parse(JSON.stringify(this.rawStore));

			//Do not save sensitive and useless data to server
			for (let i = 0; i < this.UNSYNCED_DATA.length; i++) {
				delete data[ this.UNSYNCED_DATA[i] ];
			}

			//Remove automod items the user asked not to sync to server
			const automod = data.automodParams as TwitchatDataTypes.AutomodParamsData;
			if(automod) {
				for (let i = 0; i < automod.keywordsFilters.length; i++) {
					if(!automod.keywordsFilters[i].serverSync) {
						automod.keywordsFilters.splice(i,1);
						i--;
					}
				}
			}

			await ApiHelper.call("user/data/backup", "POST", data);
		}catch(error) {
			console.error(error);
		}
	}

	/**
	 * Migrates data on the LocalStorage
	 */
	public static async migrateLocalStorage():Promise<void> {
		//load LocalStorage data and parse values from string to numbers and booleans
		//if necessary then keep it on a local typed stored "rawStore"
		const items = this.getAll();
		for (const key in items) {
			try{
				items[key] = JSON.parse(items[key] as string);
			}catch(error) {
				//parsing failed, that's because it's a simple string, just keep it
			}
		}

		const backup:{[key:string]:JsonValue} = {};
		for (let i = 0; i < this.UNSYNCED_DATA.length; i++) {
			const key = this.UNSYNCED_DATA[i];
			if(!items[key]) continue;
			backup[key] = items[key];
		}
		backup[this.DATA_VERSION] = items[this.DATA_VERSION];

		const json = await this.migrateData(items);//Migrate remote data if necessary

		//Clear storage to remove potentially old data
		localStorage.clear();

		for (const key in backup) {
			if(backup[key]) {
				json[key] = backup[key];
			}
		}

		//Update localstorage data
		for (const key in json) {
			const value = json[key];
			const str = typeof value == "string"? value : JSON.stringify(value);
			this.store.setItem(this.dataPrefix + key, str);
		}

		this.rawStore = json;
	}

	/**
	 * Save user's data server side
	 * @returns
	 */
	public static async save(force:boolean = false, delay:number = 1500):Promise<void> {
		clearTimeout(this.saveTO);
		if(!force) {
			if(!this.syncToServer) return;//User wants to only save data locally
			if(!this.dataImported) return;//Don't export anything before importing data first
			if(!StoreProxy.auth.twitch.access_token) return;
		}

		return new Promise((resolve) => {
			this.saveTO = setTimeout(async () => {
				const data = JSON.parse(JSON.stringify(this.rawStore));

				//Do not save sensitive and useless data to server
				for (let i = 0; i < this.UNSYNCED_DATA.length; i++) {
					delete data[ this.UNSYNCED_DATA[i] ];
				}

				//Remove automod items the user asked not to sync to server
				const automod = data.automodParams as TwitchatDataTypes.AutomodParamsData;
				if(automod) {
					for (let i = 0; i < automod.keywordsFilters.length; i++) {
						if(!automod.keywordsFilters[i].serverSync) {
							automod.keywordsFilters.splice(i,1);
							i--;
						}
					}
				}

				await ApiHelper.call("user/data", "POST", data);

				//If we forced upload, consider data has been imported as they are
				//the same on local and remote. This will allow later automatic saves
				if(force) this.dataImported = true;
				resolve();
			}, force? 0 : delay);
		})
	}

	/**
	 * Get a value
	 * @param key
	 * @returns
	 */
	public static get<T = string|null>(key:string):T {
		if(!this.store) this.init();
		return this.store.getItem(this.dataPrefix + key) as T;
	}

	/**
	 * Get all values
	 * @returns
	 */
	public static getAll():{[key:string]:string|null} {
		if(!this.store) this.init();
		const props:{[key:string]:string|null} = {};
		for (let i = 0; i < this.store.length; i++) {
			const key = this.store.key(i);
			if(!key || key.indexOf(this.dataPrefix) == -1) continue;
			const k = key.replace(this.dataPrefix, "");
			props[k] = this.store.getItem(key);
		}
		return props;
	}

	/**
	 * Set a value
	 *
	 * @param key
	 * @param value
	 * @param save 	schedule a save to the server
	 * @returns
	 */
	public static async set(key:string, value:JsonValue|unknown, save = true, saveDelay:number = 1500):Promise<void> {
		if(key == this.SYNC_DATA_TO_SERVER) {
			this.syncToServer = value as boolean;
			if(!this.dataImported) {
				await this.loadRemoteData();
			}
		}

		if(!this.store) this.init();
		if(value == undefined) return;
		this.rawStore[key] = value;
		const str = typeof value == "string"? value : JSON.stringify(value);
		this.store.setItem(this.dataPrefix + key, str);

		if(save) this.save(false, saveDelay);
	}

	/**
	 * Remove a value
	 *
	 * @param key
	 */
	public static remove(key:string):void {
		if(!this.store) this.init();
		delete this.rawStore[key];
		this.store.removeItem(this.dataPrefix + key);
		this.save();
	}

	/**
	 * Clear all values
	 */
	public static clear(keepSession:boolean = false):void {
		if(!this.store) this.init();
		//Remove only the data with the proper prefix
		for (let i = 0; i < this.store.length; i++) {
			const key = this.store.key(i);
			if(!key || key.indexOf(this.dataPrefix) == -1) continue;
			if(keepSession) {
				const cleanKey = key.replace(this.dataPrefix, "");
				if(cleanKey === this.TWITCH_AUTH_TOKEN) continue;
			}
			delete this.rawStore[key];
			this.store.removeItem(key);
			i--;
		}
		this.rawStore = {};
	}



	/*******************
	* PRIVATE METHODS *
	*******************/



	/**********************************
	 **** DATA MIGRATION UTILITIES ****
	 **********************************/

	/**
	 * Fixing wrong TTS placeholders
	 */
	private static fixTTSPlaceholders(data:any):void {
		const params = data[this.TTS_PARAMS] as TwitchatDataTypes.TTSParamsData;
		if(params) {
			params.readBingosPattern = params.readBingosPattern.replace(/\{USER\}/gi, "{WINNER}");
			params.readRafflePattern = params.readRafflePattern.replace(/\{USER\}/gi, "{WINNER}");
			data[this.TTS_PARAMS] = params;
		}
	}

	/**
	 * Temporary utility to cleanup some old storage data
	 * Can be removed after some updates.
	 */
	private static cleanupOldData(data:any):void {
		//rename "raffle_postOnChat" to "raffle_messageEnabled" ofr more consistency
		if(data["raffle_postOnChat"] != null) {
			data["raffle_messageEnabled"] = data["raffle_postOnChat"];
			delete data["raffle_postOnChat"];
		}
		delete data["p:emotesOnly"];
		delete data["p:modsSize"];
		delete data["p:vipsSize"];
		delete data["p:followersOnly"];
		delete data["p:subsSize"];
		delete data["p:subsOnly"];
		delete data["p:slowMode"];
		delete data["p:ignoreSelf"];
		delete data["p:hideEmotes"];
		delete data["tmiToken"];
		delete data["authToken"];
		delete data["p:hideBadges"];
		delete data["p:hideBot"];
	}


	/**
	 * Changes the "chatCommand" trigger prop to more generic "name"
	 */
	private static migrateChatCommandTriggers(data:any):void {
		const triggers:{[key:string]:TriggerData} = data[DataStore.TRIGGERS];
		if(!triggers) return;
		for (const key in triggers) {
			if(key.indexOf(TriggerTypes.CHAT_COMMAND) === 0
			&& triggers[key].chatCommand) {
				//Check if it's not full lowercased
				triggers[key].name = triggers[key].chatCommand as string;
				delete triggers[key].chatCommand
			}
		}

		data[DataStore.TRIGGERS] = triggers;
	}

	/**
	 * Changes the "chatCommand" trigger prop to more generic "name"
	 */
	private static migrateEmergencyAutoblock(data:any):void {
		const params:TwitchatDataTypes.EmergencyParamsData = data[this.EMERGENCY_PARAMS];
		if(params) {
			delete params.autoBlockFollows;
			delete params.autoUnblockFollows;
			data[this.EMERGENCY_PARAMS] = params;
		}
	}

	/**
	 * Made a mistake storing minutes instead of seconds
	 */
	private static migrateRaffleTriggerDuration(data:any):void {
		const triggers:{[key:string]:TriggerData} = data[DataStore.TRIGGERS];
		if(!triggers) return;
		for (const key in triggers) {
			const actions = triggers[key].actions;
			for (let i = 0; i < actions.length; i++) {
				const a = actions[i];
				if(a.type == "raffle" && a.raffleData && a.raffleData.duration && !isNaN(a.raffleData.duration)) {
					a.raffleData.duration_s = a.raffleData.duration * 60;
					// console.log("convert", a.raffleData.duration, "to", a.raffleData.duration_s);
					delete a.raffleData.duration;
				}
			}
		}

		data[DataStore.TRIGGERS] = triggers;
	}

	/**
	 * Made a mistake storing minutes instead of seconds
	 */
	private static migrateRaffleTriggerTypoAndTextSize(data:any):void {
		const triggers:{[key:string]:TriggerData} = data[DataStore.TRIGGERS];
		if(!triggers) return;
		for (const key in triggers) {
			const actions = triggers[key].actions;
			for (let i = 0; i < actions.length; i++) {
				const a = actions[i];
				if(a.type == "raffle" && a.raffleData) {
					//renaming "subgitRatio" to "subgiftRatio"
					//@ts-ignore
					if(a.raffleData.subgitRatio != undefined) {
						//@ts-ignore
						a.raffleData.subgiftRatio = a.raffleData.subgitRatio;
						//@ts-ignore
						delete a.raffleData.subgitRatio;
						// console.log("FIX", a);
					}
				}
			}
		}
		data[DataStore.TRIGGERS] = triggers;
		delete data["leftColSize"];//Remaining old data

		//Convert old size scale to the new one
		const sizeStr = data["p:defaultSize"];
		let size = parseFloat(sizeStr);
		if(isNaN(size)) size = 2;
		const convertionTable:{[key:number]:number} = {1:2, 2:3, 3:6, 4:9, 5:12, 6:17, 7:20}
		size = convertionTable[size]
		data["p:defaultSize"] = size;
	}

	/**
	 * Renamed placeholder "RECIPIENT" to "RECIPIENTS"
	 */
	private static migrateTriggerSubgiftPlaceholder(data:any):void {
		const triggers:{[key:string]:TriggerData} = data[DataStore.TRIGGERS];
		if(!triggers) return;
		for (const key in triggers) {
			const actions = triggers[key].actions;
			for (let i = 0; i < actions.length; i++) {
				const a = actions[i];

				if(a.type == "http") {
					a.queryParams.map(v=> v=="RECIPIENT"? "RECIPIENTS" : v);
				}else{
					//Nuclear way to replace other placeholders
					let json = JSON.stringify(a);
					json = json.replace(/\{RECIPIENT\}/gi, "{RECIPIENTS}");
					actions[i] = JSON.parse(json);
				}
			}
		}

		data[DataStore.TRIGGERS] = triggers;
	}

	/**
	 * Migrate stream tags following the new open tags endpoint
	 */
	private static async migrateStreamTags(data:any):Promise<void> {
		const presets:TwitchatDataTypes.StreamInfoPreset[] = data[DataStore.STREAM_INFO_PRESETS];
		if(!presets) return;
		let tags:string[] = [];
		for (let i = 0; i < presets.length; i++) {
			const p = presets[i];
			if(p.tagIDs) {
				tags = tags.concat(p.tagIDs);
			}
		}

		const result = await TwitchUtils.searchTag(tags);

		for (let i = 0; i < presets.length; i++) {
			const p = presets[i];
			if(p.tagIDs) {
				p.tags = [];
				for (let j = 0; j < p.tagIDs.length; j++) {
					const id = p.tagIDs[j];
					const tag = result.find(v=> v.id == id);
					if(tag) {
						p.tags.push(Utils.replaceDiacritics(tag.label).replace(/[^a-z0-9]/gi, "").substring(0, 25));
					}
				}
				delete p.tagIDs;
			}
		}

		data[DataStore.STREAM_INFO_PRESETS] = presets;
	}

	/**
	 * MIgrate all permissions systems (T_T)
	 */
	private static migratePermissions(data:any):void {
		//Migrate triggers
		const triggers:{[key:string]:TriggerData} = data[DataStore.TRIGGERS];
		if(triggers) {
			for (const key in triggers) {
				const perms = triggers[key].permissions;
				if(perms && perms.users) {
					const usersAllowed = perms.users?.toLowerCase().split(/[^a-z0-9_]+/gi);//Split users by non-alphanumeric characters
					perms.usersAllowed = usersAllowed?.filter(v=>v.length > 0) ?? [];
					perms.usersRefused = [];
					delete perms.users;
					// console.log("COMMAND "+key);
					// console.log(perms);
				}
			}
			data[DataStore.TRIGGERS] = triggers;
		}

		//Migrate automod
		const automod:TwitchatDataTypes.AutomodParamsData = data[DataStore.AUTOMOD_PARAMS];
		if(automod) {
			if(automod.exludedUsers.users) {
				const usersAllowed = automod.exludedUsers.users?.toLowerCase().split(/[^a-z0-9_]+/gi);//Split users by non-alphanumeric characters
				automod.exludedUsers.usersAllowed = usersAllowed?.filter(v=>v.length > 0) ?? [];
				automod.exludedUsers.usersRefused = [];
				delete automod.exludedUsers.users;
				// console.log("AUTOMOD");
				// console.log(automod);
				data[DataStore.AUTOMOD_PARAMS] = automod;
			}
		}

		//Migrate TTS
		const tts:TwitchatDataTypes.TTSParamsData = data[DataStore.TTS_PARAMS];
		if(tts) {
			if(tts.ttsPerms.users) {
				const usersAllowed = tts.ttsPerms.users?.toLowerCase().split(/[^a-z0-9_]+/gi);//Split users by non-alphanumeric characters
				tts.ttsPerms.usersAllowed = usersAllowed?.filter(v=>v.length > 0) ?? [];
				tts.ttsPerms.usersRefused = [];
			}

			//Transfer "readUsers" data to "usersAllowed"
			if(tts.readUsers && tts.readUsers.length > 0) {
				for (let i = 0; i < tts.readUsers.length; i++) {
					const user = tts.readUsers[i].toLowerCase();
					if(tts.ttsPerms.usersAllowed.findIndex(v=>v.toLowerCase() == user) == -1) {
						tts.ttsPerms.usersAllowed.push(user);
					}
				}
				delete tts.readUsers;
			}
			delete tts.ttsPerms.users;
			// console.log("TTS");
			// console.log(confs);
			data[DataStore.TTS_PARAMS] = tts;
		}

		//Migrate OBS
		const obs:TwitchatDataTypes.PermissionsData = data[DataStore.OBS_CONF_PERMISSIONS];
		if(obs) {
			if(obs.users) {
				const usersAllowed = obs.users?.toLowerCase().split(/[^a-z0-9_]+/gi);//Split users by non-alphanumeric characters
				obs.usersAllowed = usersAllowed?.filter(v=>v.length > 0) ?? [];
				obs.usersRefused = [];
				delete obs.users;
				// console.log("OBS");
				// console.log(perms);
				data[DataStore.OBS_CONF_PERMISSIONS] = obs;
			}
		}

		//Migrate emergency mode
		const emergency:TwitchatDataTypes.EmergencyParamsData = data[DataStore.EMERGENCY_PARAMS];
		if(emergency) {
			if(emergency.chatCmdPerms.users) {
				const usersAllowed = emergency.chatCmdPerms.users?.toLowerCase().split(/[^a-z0-9_]+/gi);//Split users by non-alphanumeric characters
				emergency.chatCmdPerms.usersAllowed = usersAllowed?.filter(v=>v.length > 0) ?? [];
				emergency.chatCmdPerms.usersRefused = [];
				delete emergency.chatCmdPerms.users;
				// console.log("EMERGENCY");
				// console.log(perms);
				data[DataStore.EMERGENCY_PARAMS] = emergency;
			}
		}

		//Migrate spoiler
		const spoiler:TwitchatDataTypes.SpoilerParamsData = data[DataStore.SPOILER_PARAMS];
		if(spoiler) {
			if(spoiler.permissions.users) {
				const usersAllowed = spoiler.permissions.users?.toLowerCase().split(/[^a-z0-9_]+/gi);//Split users by non-alphanumeric characters
				spoiler.permissions.usersAllowed = usersAllowed?.filter(v=>v.length > 0) ?? [];
				spoiler.permissions.usersRefused = [];
				delete spoiler.permissions.users;
				// console.log("SPOILER");
				// console.log(perms);
				data[DataStore.SPOILER_PARAMS] = spoiler;
			}
		}

		//Migrate chat alert
		const alertSrc:TwitchatDataTypes.AlertParamsData = data[DataStore.ALERT_PARAMS];
		if(alertSrc) {
			if(alertSrc.permissions.users) {
				const usersAllowed = alertSrc.permissions.users?.toLowerCase().split(/[^a-z0-9_]+/gi);//Split users by non-alphanumeric characters
				alertSrc.permissions.usersAllowed = usersAllowed?.filter(v=>v.length > 0) ?? [];
				alertSrc.permissions.usersRefused = [];
				delete alertSrc.permissions.users;
				// console.log("CHAT ALERT");
				// console.log(perms);
				data[DataStore.ALERT_PARAMS] = alertSrc;
			}
		}

		//Migrate voicemod
		const voicemod:TwitchatDataTypes.VoicemodParamsData = data[DataStore.VOICEMOD_PARAMS];
		if(voicemod) {
			if(voicemod.chatCmdPerms.users) {
				const usersAllowed = voicemod.chatCmdPerms.users?.toLowerCase().split(/[^a-z0-9_]+/gi);//Split users by non-alphanumeric characters
				voicemod.chatCmdPerms.usersAllowed = usersAllowed?.filter(v=>v.length > 0) ?? [];
				voicemod.chatCmdPerms.usersRefused = [];
				delete voicemod.chatCmdPerms.users;
				// console.log("VOICEMOD");
				// console.log(perms);
				data[DataStore.VOICEMOD_PARAMS] = voicemod;
			}
		}
	}

	/**
	 * Converts string lists like "value1, value2, value3" to an array of strings
	 */
	private static migrateChatColUserAndCommands(data:any):void {
		const confs:TwitchatDataTypes.ChatColumnsConfig[] = data[DataStore.CHAT_COLUMNS_CONF];
		if(confs) {
			for (let i = 0; i < confs.length; i++) {
				const c = confs[i];
				if(typeof c.commandsBlockList == "string") {
					c.commandsBlockList = (c.commandsBlockList as string).split(",");
					for (let i = 0; i < c.commandsBlockList.length; i++) {
						const v = c.commandsBlockList[i];
						if(v.trim().length == 0) {
							c.commandsBlockList.splice(i,1);
							i--;
						}else{
							c.commandsBlockList[i] = v.trim();
						}
					}
				}
				if(typeof c.userBlockList == "string") {
					c.userBlockList = (c.userBlockList as string).split(/[^a-z0-9_]+/gi);
					for (let i = 0; i < c.userBlockList.length; i++) {
						const v = c.userBlockList[i];
						if(v.trim().length == 0) {
							c.userBlockList.splice(i,1);
							i--;
						}else{
							c.userBlockList[i] = v.trim();
						}
					}
				}
			}
			data[DataStore.CHAT_COLUMNS_CONF] = confs;
		}
	}

	/**
	 * Converts TO user list from string to array of string
	 */
	private static migrateEmergencyTOs(data:any):void {
		const confs:TwitchatDataTypes.EmergencyParamsData = data[DataStore.EMERGENCY_PARAMS];
		if(confs) {
			if(typeof confs.toUsers === "string") {
				confs.toUsers = (confs.toUsers as string).split(/[^a-z0-9_]+/gi).filter(v=> v.length > 0);
			}else{
				confs.toUsers = confs.toUsers.filter(v=> v.length > 0);
			}
			data[DataStore.EMERGENCY_PARAMS] = confs;
		}
	}

	/**
	 * Cleanup useless old data
	 */
	private static cleanupPreV7Data(data:any):void {
		delete data["level"];
		delete data["isDonor"];
		delete data["p:hideUsers"];
		delete data["p:showSelf"];
		delete data["p:blockedCommands"];
		delete data["p:ignoreListCommands"];
		delete data["p:ignoreCommands"];
		delete data["p:showSlashMe"];
		delete data["p:showBots"];
		delete data["p:keepDeletedMessages"];
		delete data["p:firstTimeMessage"];
		delete data["p:keepHighlightMyMessages"];
		delete data["p:historySize"];
		delete data["p:notifyJoinLeave"];
		delete data["p:raidStreamInfo"];
		delete data["p:receiveWhispers"];
		delete data["p:showWhispersOnChat"];
		delete data["p:showCheers"];
		delete data["p:showFollow"];
		delete data["p:showHypeTrain"];
		delete data["p:showNotifications"];
		delete data["p:showRaids"];
		delete data["p:showRewards"];
		delete data["p:showSubs"];
		delete data["p:splitView"];
		delete data["p:splitViewSwitch"];
		delete data["p:emergencyButton"];
		delete data["p:shoutoutLabel"];
		delete data["leftColSize"];
		delete data["activityFeedFilters"];
	}

	/**
	 * Forces new stream online/offline notifications
	 * @param data
	 */
	private static enableLiveOnOffNotification(data:any):void {
		const cols:TwitchatDataTypes.ChatColumnsConfig[] = data[this.CHAT_COLUMNS_CONF]
		if(cols) {
			const index = cols.length == 1? 0 : 1;
			cols[index].filters.stream_online = true;
			//Set where to show "greet them" and forms
			cols[index].showPanelsHere = true;
		}
	}

	/**
	 * So far all OBS scenes were stored even if no command was attributed
	 * to a scene. Here we clean all scene with no command now that they're
	 * filtered out on save.
	 * @param data
	 */
	private static cleanNonAttributedOBSScenes(data:any):void {
		const scenes:TwitchatDataTypes.OBSSceneCommand[] = data[this.OBS_CONF_SCENES];
		if(scenes) {
			data[this.OBS_CONF_SCENES] = scenes.filter(v=> (v.command ?? "") != "");
		}
	}

	/**
	 * Until then when using the "add track to queue" trigger action, the placeholder
	 * to display the track info on the confirmation message was the same than the
	 * one used to display the currently playing track.
	 * Basically we only had {CURRENT_TRACK_XXX} placeholders.
	 * Now there are {ADDED_TRACK_XXX} placeholders.
	 * Here we migrate all {CURRENT_TRACK_XXX} placeholders to {ADDED_TRACK_XXX}
	 * only for the track added actions
	 */
	private static migrateTrackAddedTriggerPlaceholder(data:any):void {
		const triggers:{[key:string]:TriggerData} = data[DataStore.TRIGGERS];
		if(!triggers) return;
		for (const key in triggers) {
			for (let i = 0; i < triggers[key].actions.length; i++) {
				const a = triggers[key].actions[i];
				if(a.type == "music" && a.confirmMessage) {
					a.confirmMessage = a.confirmMessage.replace(/\{CURRENT_TRACK_(.*?)\}/gi, "{ADDED_TRACK_$1}");
				}
			}
		}

		data[DataStore.TRIGGERS] = triggers;
	}

	/**
	 * Until then OBS trigger action just had a "show" property containing:
	 * true => show source
	 * false => hide source
	 * "replay" => replay media source
	 *
	 * This prop is now named "action" and contains only string values.
	 */
	private static migrateOBSTriggerActions(data:any):void {
		const triggers:{[key:string]:TriggerData} = data[DataStore.TRIGGERS];
		if(!triggers) return;
		for (const key in triggers) {
			for (let i = 0; i < triggers[key].actions.length; i++) {
				const a = triggers[key].actions[i];
				if(a.type == "obs" && a.show) {
					const action:TriggerActionObsDataAction = a.show == "replay"? "replay" : a.show === true? "show" : "hide";
					a.action = action;
					delete a.show;
				}
			}
		}

		data[DataStore.TRIGGERS] = triggers;
	}

	/**
	 * Migrates triggers data to the new triggers system
	 * @param data
	 */
	private static migrateTriggersData(data:any):void {
		const triggers:{[key:string]:TriggerData} = data[DataStore.TRIGGERS];
		if(Array.isArray(triggers)) return;//Already migrated to new data format
		if(!triggers) return;
		const triggerList:TriggerData[] = [];
		const events:TriggerTypeDefinition[] = TriggerTypesDefinitionList();
		const allowedKeys:{[key:string]:boolean} = {};
		events.forEach(v => allowedKeys[v.value] = true);
		for (const key in triggers) {
			const t = triggers[key];
			const chunks = key.split("_");
			const triggerKey = chunks.shift();
			const subkey = chunks.join("_");
			if(!triggerKey || !allowedKeys[triggerKey]) continue;//Ignore potentially old trigger types
			t.id = Utils.getUUID();
			t.type = triggerKey as TriggerTypesValue;
			switch(t.type) {
				case TriggerTypes.CHAT_COMMAND: t.chatCommand = t.name; break;
				case TriggerTypes.REWARD_REDEEM: t.rewardId = subkey; break;
				case TriggerTypes.OBS_SCENE: t.obsScene = t.name = subkey; break;
				case TriggerTypes.OBS_SOURCE_ON: t.obsSource = t.name = subkey; break;
				case TriggerTypes.OBS_SOURCE_OFF: t.obsSource = t.name = subkey; break;
				case TriggerTypes.COUNTER_LOOPED:
				case TriggerTypes.COUNTER_MAXED:
				case TriggerTypes.COUNTER_MINED:
				case TriggerTypes.COUNTER_DEL:
				case TriggerTypes.COUNTER_ADD:
				case TriggerTypes.COUNTER_EDIT: t.counterId = subkey; break;
			}
			if(t.queue == "") delete t.queue;
			if(t.name == "") delete t.name;

			for (let i = 0; i < t.actions.length; i++) {
				const a = t.actions[i];
				a.id = Utils.getUUID();//Override old useless IDs that were Math.random() values

				//Migrate OBS actions
				if(a.type == "obs") {
					if(a.show == true) a.action = "show";
					if(a.show == false) a.action = "hide";
					if(a.show == "replay") a.action = "replay";
					delete a.show;
				}
				//Convert delays to dedicated actions
				if(a.delay && typeof a.delay == "number" && a.delay > 0) {
					const newAction:TriggerActionDelayData = { delay:a.delay!, id:Utils.getUUID(), type:"delay"};
					t.actions.splice(i+1, 0, newAction);
					i++;//Skip newly added action
				}
				delete a.delay;
			}
			triggerList.push(t);
		}

		function keyToTrigger(key:string):TriggerData|null {
			const type = key.split("_")[0] as TriggerTypesValue;
			const subType = key.replace(type+"_", "").toLowerCase();
			switch(type) {
				case TriggerTypes.CHAT_COMMAND: {
					const item = triggerList.find(v => v.type == type && v.chatCommand?.toLowerCase() == subType.toLowerCase() );
					if(item) return item
					break;
				}
				case TriggerTypes.REWARD_REDEEM: {
					const item = triggerList.find(v => v.type == type && v.rewardId?.toLowerCase() == subType );
					if(item) return item
					break;
				}
				case TriggerTypes.COUNTER_LOOPED:
				case TriggerTypes.COUNTER_MAXED:
				case TriggerTypes.COUNTER_MINED:
				case TriggerTypes.COUNTER_ADD:
				case TriggerTypes.COUNTER_DEL: {
					const item = triggerList.find(v => v.type == type && v.rewardId?.toLowerCase() == subType );
					if(item) return item
					break;
				}
				default: {
					const item = triggerList.find(v => v.type == type );
					if(item) return item
				}
			}
			return null;
		}

		//Migrate any trigger action using triggers
		for (let j = 0; j < triggerList.length; j++) {
			const t = triggerList[j];

			for (let i = 0; i < t.actions.length; i++) {
				const a = t.actions[i];
				//Migrate random entries
				if(a.type === "random" && a.triggers) {
					const ids = [];
					for (let h = 0; h < a.triggers.length; h++) {
						const trigger = keyToTrigger(a.triggers[h]);
						if(trigger) ids.push(trigger.id);
					}
					console.log("Migrated random ", a.triggers, ids);
					a.triggers = ids;
				}else
				//Migrate random entries
				if(a.type === "trigger" && a.triggerKey) {
					const trigger = keyToTrigger(a.triggerKey);
					console.log("Migrated trigger ", a.triggerKey, trigger);
					delete a.triggerKey;
					if(trigger) a.triggerId = trigger.id;
				}
			}
		}


		console.log(triggerList);

		data[DataStore.TRIGGERS] = triggerList;
	}

	/**
	 * Adds the placeholder value to any existing counter and
	 * update any trigger using the "read counter" action to remove it
	 * and replace that placeholder by the counter's placeholder
	 */
	private static populateCounterPlaceholder(data:any):void {
		const counters:TwitchatDataTypes.CounterData[] = data[DataStore.COUNTERS];

		if(!counters) return;

		//Add "placeholderKey" value on every existing counters
		const slugCount:{[key:string]:number} = {};
		for (let i = 0; i < counters.length; i++) {
			const c = counters[i];

			if(!c.placeholderKey)  {
				let slug = Utils.slugify(c.name);
				if(slug.length == 0) slug = "C";
				//If an identical slug exists, suffix it with its index
				if(slugCount[slug] != undefined) slug += slugCount[slug];
				else slugCount[slug] = 0;
				//Increment slug count for this slug
				slugCount[slug] ++;

				c.placeholderKey = slug.toUpperCase();
			}
		}

		//Delete all "counterget" trigger actions and replace all related
		//placeholders by the new placeholderKey value of the counters
		const triggers:{[key:string]:TriggerData} = data[DataStore.TRIGGERS];
		if(triggers) {
			//Parse all triggers
			for (const key in triggers) {
				const oldPlaceholderToNew:{[key:string]:string} = {};
				//Parse all current trigger actions
				for (let i = 0; i < triggers[key].actions.length; i++) {
					const a = triggers[key].actions[i];
					//@ts-ignore
					//If action is a "read counter value", delete it and replace any subsequent
					//placeholders by the new counter placeholder
					if(a.type == "countget") {
						// Actual type
						// {
						// 	type:"countget";
						// 	counter:string;
						// 	placeholder:string;
						// }
						//@ts-ignore
						const c = counters.find(v => v.id == a.counter);
						if(c) {
							//@ts-ignore
							//Counter exists grab its placeholder key
							oldPlaceholderToNew[a.placeholder] = c.placeholderKey.slice(0, 15);
						}else{
							//@ts-ignore
							//Counter doesn't exists, set a placeholder user will understand
							oldPlaceholderToNew[a.placeholder] = "DELETED_COUNTER";
						}
						// console.log(a.placeholder, "=>", oldPlaceholderToNew["{"+a.placeholder+"}"]);
						triggers[key].actions.splice(i, 1);
						i--;
					}else if(Object.keys(oldPlaceholderToNew).length > 0) {
						// console.log("PLACHOLDER DICT", oldPlaceholderToNew);
						let json = JSON.stringify(a);
						for (const placeholder in oldPlaceholderToNew) {
							const oldSafe = placeholder.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
							const newPlaceholder = TriggerActionDataTypes.COUNTER_VALUE_PLACEHOLDER_PREFIX + oldPlaceholderToNew[placeholder];
							// console.log("Replace ", oldSafe, "by", newPlaceholder);
							//Nuclear way to replace placeholders
							json = json.replace(new RegExp("\\{"+oldSafe+"\\}", "gi"), "{"+newPlaceholder+"}");
						}
						triggers[key].actions[i] = JSON.parse(json);
					}
				}
			}
		}

		data[DataStore.COUNTERS] = counters;
		data[DataStore.TRIGGERS] = triggers;
	}

	/**
	 * Enable the "watch streak" notifications on all columns
	 */
	public static addWatchStreakFilter(data:any):void {
		const cols:TwitchatDataTypes.ChatColumnsConfig[] = data[DataStore.CHAT_COLUMNS_CONF];

		if(!cols) return;
		cols.forEach(v=>v.filters.user_watch_streak = true);
		data[DataStore.CHAT_COLUMNS_CONF] = cols;

	}

	/**
	 * For some users the "commandsBlockList" value is "" instead of []
	 */
	private static fixCommandsBlockListDefaultValue(data:any):void {
		const confs:TwitchatDataTypes.ChatColumnsConfig[] = data[DataStore.CHAT_COLUMNS_CONF];
		if(confs) {
			for (let i = 0; i < confs.length; i++) {
				const c = confs[i];
				//@ts-ignore
				if(c.commandsBlockList == "")  c.commandsBlockList = [];
				//@ts-ignore
				if(c.userBlockList == "")  c.userBlockList = [];
			}
			data[DataStore.CHAT_COLUMNS_CONF] = confs;
		}
	}

	/**
	 * I changed custom user names data format during beta
	 */
	private static resetCustomUsernames(data:any):void {
		const confs:{[key:string]:string} = data[DataStore.CUSTOM_USERNAMES];
		if(confs) {
			for (const uid in confs) {
				//If the value is just a string (the user name) delete it.
				//I changed data format to be an object with the platform and channel id
				if(typeof confs[uid] == "string") {
					delete confs[uid];
				}
			}
			data[DataStore.CUSTOM_USERNAMES] = confs;
		}

		//Remove all user references with no badges.
		//I added auto cleanup on update later
		const badges:{[key:string]:unknown[]} = data[DataStore.CUSTOM_USER_BADGES];
		if(badges) {
			for (const uid in badges) {
				//If the value is just a string (the user name) delete it.
				//I changed data format to be an object with the platform and channel id
				if(badges[uid].length == 0) {
					delete badges[uid];
				}
			}
			data[DataStore.CUSTOM_USER_BADGES] = badges;
		}
	}

	/**
	 * Add "move read marker" default data to GoXLR params
	 */
	private static addGoXLRReadMarkDefaults(data:any):void {
		const confs:TwitchatDataTypes.GoXLRParams = data[DataStore.GOXLR_CONFIG];
		if(confs && !confs.chatReadMarkSources) {
			confs.chatReadMarkSources = []
			data[DataStore.GOXLR_CONFIG] = confs;
		}
	}

	/**
	 * Minor fixes of useless "delay" that were still injected to every triggers
	 */
	private static migrateTriggersDelay(data:any):void {
		const triggers:TriggerData[] = data[DataStore.TRIGGERS];

		if(triggers && Array.isArray(triggers)) {
			triggers.forEach(t => {
				if(t.rewardId && t.type != TriggerTypes.REWARD_REDEEM) {
					delete t.rewardId;//Compensate for migration mistake. Useless data
				}
				for (let i = 0; i < t.actions.length; i++) {
					const a = t.actions[i];
					//Remove old "0 second" delays not properly cleaned up
					if(a.delay != undefined && a.type != "delay") {
						delete a.delay;
					}
				}
			})
			data[DataStore.TRIGGERS] = triggers;
		}
	}

	/**
	 * Fixes lots of data types everywhere
	 */
	private static fixDataTypes(data:any):void {
		const obsPort = data[DataStore.OBS_PORT];
		const botMessages:{[key:string]:TwitchatDataTypes.BotMessageEntry} = data[DataStore.BOT_MESSAGES];
		const chatCols:TwitchatDataTypes.ChatColumnsConfig[] = data[DataStore.CHAT_COLUMNS_CONF];
		const triggers:TriggerData[] = data[DataStore.TRIGGERS];
		const tts:TwitchatDataTypes.TTSParamsData = data[DataStore.TTS_PARAMS];
		const emergency:TwitchatDataTypes.EmergencyParamsData = data[DataStore.EMERGENCY_PARAMS];
		const websocket:TriggerActionDataTypes.SocketParams = data[DataStore.WEBSOCKET_TRIGGER];

		if(obsPort) data[DataStore.OBS_PORT] = parseInt(obsPort) || 4455;

		if(botMessages) {
			for (const key in botMessages) {
				const m = botMessages[key];
				if(m.message == null) m.message = StoreProxy.i18n.tm("params.botMessages."+key);
				if(m.enabled != true && m.enabled != false) m.enabled = false;
			}
			data[DataStore.BOT_MESSAGES] = botMessages;
		}

		if(chatCols) {
			chatCols.forEach(c => {
				c.size = Math.min(10, Math.max(0, c.size));
			});
			data[DataStore.CHAT_COLUMNS_CONF] = chatCols;
		}

		if(triggers && Array.isArray(triggers)) {
			triggers.forEach(t => {
				if(t.cooldown) {
					if(!t.cooldown.user) t.cooldown.user = 0;
					if(!t.cooldown.global) t.cooldown.global = 0;
				}
				if(t.rewardId && t.type != TriggerTypes.REWARD_REDEEM) {
					console.log("Clean useless rewardId from", t);
					delete t.rewardId;//Compensate for migration mistake. Useless data
				}
				for (let i = 0; i < t.actions.length; i++) {
					const a = t.actions[i];
					//Remove old "0 second" delays not properly cleaned up
					if(a.delay != undefined && a.type != "delay") {
						delete a.delay;
					}
					//Trigger action is missing msot important data, remove action
					if((a.type == "trigger" || a.type == "triggerToggle") && !a.triggerId) {
						console.log("Clean useless trigger action", a);
						t.actions.splice(i, 1);
						i--;
					}
				}
			})
			data[DataStore.TRIGGERS] = triggers;
		}

		if(tts) {
			tts.readMessagePatern			= typeof tts.readMessagePatern == "string"? tts.readMessagePatern : "";
			tts.readWhispersPattern			= typeof tts.readWhispersPattern == "string"? tts.readWhispersPattern : "";
			tts.readNoticesPattern			= typeof tts.readNoticesPattern == "string"? tts.readNoticesPattern : "";
			tts.readRewardsPattern			= typeof tts.readRewardsPattern == "string"? tts.readRewardsPattern : "";
			tts.readSubsPattern				= typeof tts.readSubsPattern == "string"? tts.readSubsPattern : "";
			tts.readSubgiftsPattern			= typeof tts.readSubgiftsPattern == "string"? tts.readSubgiftsPattern : "";
			tts.readBitsPattern				= typeof tts.readBitsPattern == "string"? tts.readBitsPattern : "";
			tts.readRaidsPattern			= typeof tts.readRaidsPattern == "string"? tts.readRaidsPattern : "";
			tts.readFollowPattern			= typeof tts.readFollowPattern == "string"? tts.readFollowPattern : "";
			tts.readPollsPattern			= typeof tts.readPollsPattern == "string"? tts.readPollsPattern : "";
			tts.readBingosPattern			= typeof tts.readBingosPattern == "string"? tts.readBingosPattern : "";
			tts.readRafflePattern			= typeof tts.readRafflePattern == "string"? tts.readRafflePattern : "";
			tts.readPredictionsPattern		= typeof tts.readPredictionsPattern == "string"? tts.readPredictionsPattern : "";
			tts.read1stMessageTodayPattern	= typeof tts.read1stMessageTodayPattern == "string"? tts.read1stMessageTodayPattern : "";
			tts.read1stTimeChattersPattern	= typeof tts.read1stTimeChattersPattern == "string"? tts.read1stTimeChattersPattern : "";
			tts.readAutomodPattern			= typeof tts.readAutomodPattern == "string"? tts.readAutomodPattern : "";
			tts.readTimeoutsPattern			= typeof tts.readTimeoutsPattern == "string"? tts.readTimeoutsPattern : "";
			tts.readBansPattern				= typeof tts.readBansPattern == "string"? tts.readBansPattern : "";
			tts.readUnbansPattern			= typeof tts.readUnbansPattern == "string"? tts.readUnbansPattern : "";
		}

		if(emergency) {
			if(!Array.isArray(emergency.toUsers)) emergency.toUsers = [];
			data[DataStore.EMERGENCY_PARAMS] = emergency;
		}

		if(websocket) {
			websocket.port = parseInt(websocket+"") || 3000;
			data[DataStore.WEBSOCKET_TRIGGER] = websocket;
		}
	}

	/**
	 * Cleans up heat trigger actions from useless data to avoid conflicts on execution
	 */
	private static cleanupHeatTriggerActions(data:any):void {
		const triggers:TriggerData[] = data[DataStore.TRIGGERS];
		if(triggers) {
			for (let i = 0; i < triggers.length; i++) {
				const trigger = triggers[i];
				if(trigger.type == TriggerTypes.HEAT_CLICK) {
					if(trigger.heatClickSource == "obs") {
						delete trigger.heatAreaIds;
					}else if(trigger.heatClickSource == "area") {
						delete trigger.heatObsSource;
					}else {
						delete trigger.heatAreaIds;
						delete trigger.heatObsSource;
					}
				}
			}
			data[DataStore.TRIGGERS] = triggers;
		}
	}

	/**
	 * Adds new song request filter item to chat columns
	 */
	private static addSRFilter(data:any):void {
		const chatCols:TwitchatDataTypes.ChatColumnsConfig[] = data[DataStore.CHAT_COLUMNS_CONF];

		if(chatCols) {
			chatCols.forEach(c => {
				c.filters.music_added_to_queue = false;
			});
			chatCols[0].filters.music_added_to_queue = true;

			data[DataStore.CHAT_COLUMNS_CONF] = chatCols;
		}

	}

	/**
	 * Migrates schedule durations from minutes to seconds
	 */
	private static migrateScheduleActionDuration(data:any):void {
		const triggers:TriggerData[] = data[DataStore.TRIGGERS];

		if(triggers && Array.isArray(triggers)) {
			triggers.forEach(t => {
				if(t.type == TriggerTypes.SCHEDULE && t.scheduleParams && t.scheduleParams.repeatDuration > 0) {
					console.log("migrate", t.scheduleParams.repeatDuration);
					t.scheduleParams.repeatDuration *= 60;
					console.log("new value is", t.scheduleParams.repeatDuration);
				}
			});
			data[DataStore.TRIGGERS] = triggers;
		}
	}

	/**
	 * Migrates schedule durations from minutes to seconds
	 */
	private static setDefaultQueuesToTriggers(data:any):void {
		const triggers:TriggerData[] = data[DataStore.TRIGGERS];
		const count:{[key:string]:number} = {};

		if(triggers && Array.isArray(triggers)) {
			triggers.forEach(t => {
				if(!t.queue) {
					const infos = Utils.getTriggerDisplayInfo(t);
					let name = Utils.slugify(infos.label || "automatic_queue");
					if(t.type == TriggerTypes.REWARD_REDEEM) {
						name = "channelpoints-reward";
					}
					if(count[name] === undefined) count[name] = 0;
					if(count[name] > 0) name +="_"+count[name];
					count[name] ++;

					t.queue = name;
					console.log("Set queue to", name);
				}
			});
			data[DataStore.TRIGGERS] = triggers;
		}
	}

	/**
	 * Migrate polls and predictions durations to seconds instead of minutes
	 * @param data
	 */
	public static migratePollPredDurations(data:any):void {
		//Migrate default poll duration
		let d = parseInt(data[DataStore.POLL_DEFAULT_DURATION]);
		if(!isNaN(d)) data[DataStore.POLL_DEFAULT_DURATION] = d * 60;

		//Migrate default prediction duration
		d = parseInt(data[DataStore.PREDICTION_DEFAULT_DURATION]);
		if(!isNaN(d)) data[DataStore.PREDICTION_DEFAULT_DURATION] = d * 60;

		//Migrate durations on triggers
		const triggers:TriggerData[] = data[DataStore.TRIGGERS];
		if(triggers && Array.isArray(triggers)) {
			triggers.forEach(t => {
				t.actions.forEach(a => {
					if(a.type == "poll" && a.pollData) {
						a.pollData.voteDuration *= 60;
					}
					if(a.type == "prediction" && a.predictionData) {
						a.predictionData.voteDuration *= 60;
					}
				})
			});
			data[DataStore.TRIGGERS] = triggers;
		}
	}

	/**
	 * Remove duplicates from the trigger tree after a mistake on the
	 * non-premium data cleanup that was duplicating everything on the
	 * root of the tree
	 * @param data
	 */
	public static dedupeTriggerTree(data:any):void {

		const tree:TriggerActionDataTypes.TriggerTreeItemData[] = data[DataStore.TRIGGERS_TREE];
		if(tree && Array.isArray(tree)) {
			const isInFolder:{[key:string]:boolean} = {};
			const parseTreeNode = (node:TriggerActionDataTypes.TriggerTreeItemData)=> {
				if(node.type == "folder") {
					(node.children || []).forEach(item => {
						if(item.type == "trigger") {
							isInFolder[item.triggerId!] = true;
						}else{
							parseTreeNode(item);
						}
					})
				}
			}
			//Check which nodes are duplicated on root
			tree.forEach(item=> parseTreeNode(item));

			//Cleanup any trigger from the root tree if it
			//exists within a folder
			for (let i = 0; i < tree.length; i++) {
				const item = tree[i];
				//Check if current item exists within a folder
				if(item.type == "trigger" && isInFolder[item.triggerId!] === true) {
					console.log("Remove", item.triggerId);
					tree.splice(i, 1);
					i--;
				}
			}
			data[DataStore.TRIGGERS_TREE] = tree;
		}
	}
}
