import { rebuildPlaceholdersCache } from '@/types/TriggerActionDataTypes';
import { TwitchatDataTypes } from '@/types/TwitchatDataTypes';
import { defineStore, type PiniaCustomProperties, type _GettersTree, type _StoreWithGetters, type _StoreWithState } from 'pinia';
import type { UnwrapRef } from 'vue';
import DataStore from '../DataStore';
import type { IValuesActions, IValuesGetters, IValuesState } from '../StoreProxy';
import StoreProxy from '../StoreProxy';
import Utils from '@/utils/Utils';
import Config from '@/utils/Config';
import * as MathJS from 'mathjs';
import type {JsonObject} from "type-fest";

export const storeValues = defineStore('values', {
	state: () => ({
		valueList: [],
	} as IValuesState),



	getters: {
	} as IValuesGetters
	& ThisType<UnwrapRef<IValuesState> & _StoreWithGetters<IValuesGetters> & PiniaCustomProperties>
	& _GettersTree<IValuesState>,



	actions: {
		populateData():void {
			//Init values
			const valuesParams = DataStore.get(DataStore.VALUES);
			if(valuesParams) {
				Utils.mergeRemoteObject(JSON.parse(valuesParams), (this.valueList as unknown) as JsonObject);
			}
		},

		addValue(data:TwitchatDataTypes.ValueData):void {
			//User can create up to 3 values if not premium
			if(!StoreProxy.auth.isPremium && this.valueList.length >= Config.instance.MAX_VALUES) {
				StoreProxy.common.alert(StoreProxy.i18n.t("error.max_values", {COUNT:Config.instance.MAX_VALUES}));
				return;
			}
			this.valueList.push(data);
			this.saveValues();
			rebuildPlaceholdersCache();
		},

		editValueParams(id:string, data:Partial<TwitchatDataTypes.ValueData>):void {
			let prevValue = "";
			for (let i = 0; i < this.valueList.length; i++) {
				if(this.valueList[i].id == id) {
					const d = this.valueList[i];
					prevValue = d.value;
					if(data.value) d.value = data.value;
					if(data.name) d.name = data.name;
					if(data.placeholderKey) d.placeholderKey = data.placeholderKey;
					if(data.perUser != undefined) d.perUser = data.perUser;

					//If placeholder has been updated, update it on all triggers
					if(data.placeholderKey && data.placeholderKey.toLowerCase() != (d.placeholderKey ?? "").toLowerCase()) {
						StoreProxy.triggers.renameValuePlaceholder(d.placeholderKey, data.placeholderKey);
					}

					if(d.value != prevValue) {
						const message:TwitchatDataTypes.MessageValueUpdateData = {
							date:Date.now(),
							type:TwitchatDataTypes.TwitchatMessageType.VALUE_UPDATE,
							id:Utils.getUUID(),
							platform:"twitchat",
							value:d,
							newValue: d.value,
							oldValue: prevValue,
							channel_id:StoreProxy.auth.twitch.user.id,
						};
						StoreProxy.chat.addMessage(message);
					}
					break;
				}
			}
			this.saveValues();
		},

		updateValue(id:string, value:string, user?:TwitchatDataTypes.TwitchatUser, userId?:string):void {
			let prevValue = "";
			if(value != undefined && value.trim() != "e") {//Ignore euler notation
				try {
					const num = MathJS.evaluate(value);
					if(!isNaN(num)) value = num.toString();
				}catch(error) {}
			}
			for (let i = 0; i < this.valueList.length; i++) {
				if(this.valueList[i].id == id) {
					const d = this.valueList[i];

					if(d.perUser) {
						if(!d.users) d.users = {};
						const uid = (user? user.id : userId) || "";
						prevValue = d.users![uid];
						d.users![uid] = value;
					}else{
						prevValue = d.value;
						d.value = value;
					}
					//Do no execute triggers if edditing a user by it ID.
					//If only "userId" is given, don't execute it so we can update
					//loads of values at once without cloagging the trigger system
					if(!userId && d.value != prevValue) {
						const message:TwitchatDataTypes.MessageValueUpdateData = {
							date:Date.now(),
							type:TwitchatDataTypes.TwitchatMessageType.VALUE_UPDATE,
							id:Utils.getUUID(),
							platform:"twitchat",
							value:d,
							newValue: d.value,
							oldValue: prevValue,
							channel_id:StoreProxy.auth.twitch.user.id,
						};
						StoreProxy.chat.addMessage(message);
					}
					break;
				}
			}

			this.saveValues();
		},

		delValue(data:TwitchatDataTypes.ValueData):void {
			for (let i = 0; i < this.valueList.length; i++) {
				if(this.valueList[i].id == data.id) {
					this.valueList.splice(i, 1);
					break;
				}
			}
			this.saveValues();

			// Delete triggers related to the deleted value
			const triggers = StoreProxy.triggers.triggerList;
			for (let i = 0; i < triggers.length; i++) {
				const t = triggers[i];
				if(t.valueId === data.id){
					StoreProxy.triggers.deleteTrigger(t.id);
				}
			}
			rebuildPlaceholdersCache();
		},

		saveValues():void {
			DataStore.set(DataStore.VALUES, this.valueList);
		}


	} as IValuesActions
	& ThisType<IValuesActions
		& UnwrapRef<IValuesState>
		& _StoreWithState<"counters", IValuesState, IValuesGetters, IValuesActions>
		& _StoreWithGetters<IValuesGetters>
		& PiniaCustomProperties
	>,
})
