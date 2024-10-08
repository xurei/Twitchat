<template>
	<div :class="classes">
		<div class="head" v-if="triggerMode === false">
			<ClearButton :aria-label="$t('global.close')" @click="close()" />

			<h1 class="title"><Icon name="ticket" class="icon" />{{ $t("raffle.form_title") }}</h1>

			<div class="description">{{ $t("raffle.description") }}</div>
		</div>

		<TabMenu class="menu" v-model="mode"
			:values="['chat','sub','manual','values']"
			:labels="[$t('raffle.chat.title'), $t('raffle.subs.title'), $t('raffle.list.title'), $t('raffle.values.title')]"
			:icons="['commands', 'sub', 'list', 'placeholder']" />

		<div class="content">
			<ToggleBlock class="legal tips" v-if="triggerMode === false && mode!='manual' && mode!='values'" :icons="['info']" small :title="$t('raffle.legal.title')" :open="false">
				<p v-for="l in $tm('raffle.legal.contents')">{{l}}</p>
			</ToggleBlock>

			<VoiceGlobalCommandsHelper v-if="voiceControl !== false" class="voiceHelper" />

			<form class="form" v-if="mode=='chat'" @submit.prevent="submitForm()">
				<div class="info">{{ $t("raffle.chat.description") }}</div>

				<ParamItem :paramData="param_commandValue" v-model="param_commandValue.value" :autofocus="true" v-if="triggerMode !== false" />
				<ParamItem :paramData="param_command" v-model="param_command.value" :autofocus="true" @change="onValueChange()" v-else />

				<div class="card-item" v-if="triggerMode === false">
					<ParamItem noBackground :paramData="param_reward" v-model="param_reward.value" :autofocus="true" @change="onValueChange()" v-if="param_rewardvalue.listValues!.length > 1" />
					<div class="tips">
						<img src="@/assets/icons/info.svg">

						<i18n-t scope="global" tag="span" keypath="raffle.chat.triggers">
							<template #LINK>
								<a @click="openParam('triggers')">{{ $t("raffle.chat.triggers_link") }}</a>
							</template>
							<template #ACTION>
								<strong>{{ $t("triggers.actions.common.action_raffle_enter") }}</strong>
							</template>
						</i18n-t>
					</div>
				</div>
				<ParamItem :paramData="param_enterDuration" @change="onValueChange()" />

				<ToggleBlock class="configs" :icons="['params']" v-if="mode=='chat'" :title="$t('global.advanced_params')" :open="false">
					<ParamItem :paramData="param_multipleJoin" v-model="param_multipleJoin.value" @change="onValueChange()" />
					<ParamItem :paramData="param_maxUsersToggle" v-model="param_maxUsersToggle.value" @change="onValueChange()" />
					<ParamItem :paramData="param_ponderateVotes" v-model="param_ponderateVotes.value" @change="onValueChange()" />

					<ParamItem
					:paramData="param_showCountdownOverlay"
					v-model="param_showCountdownOverlay.value"
					v-if="mode=='chat'" @change="onValueChange()">
						<i18n-t scope="global" tag="div" class="details"
						v-if="param_showCountdownOverlay.value === true && mode=='chat'"
						keypath="raffle.configs.timer_overlay_add">
							<template #LINK>
								<a @click="openParam('overlays')">{{ $t("raffle.configs.timer_overlay_add_link") }}</a>
							</template>
						</i18n-t>
					</ParamItem>

					<PostOnChatParam botMessageKey="raffleStart"
						v-if="mode=='chat' && triggerMode === false"
						:placeholders="startPlaceholders"
						icon="announcement"
						titleKey="raffle.configs.postOnChat_start"
					/>
					<PostOnChatParam botMessageKey="raffle"
						v-if="triggerMode === false"
						:placeholders="winnerPlaceholders"
						icon="announcement"
						titleKey="raffle.configs.postOnChat_winner"
					/>
					<PostOnChatParam botMessageKey="raffleJoin"
						v-if="mode=='chat' && triggerMode === false"
						:placeholders="joinPlaceholders"
						icon="announcement"
						titleKey="raffle.configs.postOnChat_join"
					/>
				</ToggleBlock>

				<TTButton type="submit"
					v-if="triggerMode === false"
					:aria-label="$t('raffle.chat.startBt_aria')"
					icon="ticket">{{ $t('global.start') }}</TTButton>
			</form>

			<form class="form" v-else-if="mode=='sub' && canListSubs" @submit.prevent="submitForm()">
				<div class="info">{{ $t("raffle.subs.description") }}</div>
				
				<ParamItem :paramData="param_subs_includeGifters" v-model="param_subs_includeGifters.value" @change="onValueChange()" />
				<ParamItem :paramData="param_subs_excludeGifted" v-model="param_subs_excludeGifted.value" @change="onValueChange()" />
				<div class="card-item winner" v-if="winner" ref="winnerHolder">
					<div class="head">Winner</div>
					<div class="user">🎉 {{winner}} 🎉</div>
				</div>
				<div class="card-item winner" v-if="winnerTmp">
					<div class="user">{{winnerTmp}}</div>
				</div>
				<TTButton type="submit"
				:aria-label="$t('raffle.subs.startBt_aria')"
				icon="sub"
				v-if="triggerMode === false"
				:loading="pickingEntry">
					<i18n-t scope="global" keypath="raffle.subs.startBt">
						<template #COUNT>
							<i class="small">({{ subsFiltered.length }} subs)</i>
						</template>
					</i18n-t>
				</TTButton>
			</form>

			<form class="card-item secondary form scope" v-else-if="mode=='sub' && !canListSubs" @submit.prevent="submitForm()">
				<img src="@/assets/icons/lock_fit.svg">
				<p class="label">{{ $t("params.scope_missing") }}</p>
				<TTButton alert small
					class="grantBt"
					icon="unlock"
					@click="requestSubPermission()">{{ $t('global.grant_scope') }}</TTButton>
			</form>

			<form class="form" v-else-if="mode=='manual'" @submit.prevent="submitForm()">
				<div class="info">{{ $t("raffle.list.description") }}</div>

				<div class="card-item">
					<ParamItem noBackground :paramData="param_customEntries" v-model="param_customEntries.value" @change="onValueChange()" />
					<span class="instructions">{{ $t("raffle.list.instructions") }}</span>
				</div>

				<ParamItem :paramData="param_list_remove" v-model="param_list_remove.value" @change="onValueChange()" v-if="!triggerMode" />

				<TTButton type="submit"
				v-if="triggerMode === false"
				:loading="pickingEntry"
				:aria-label="$t('raffle.list.startBt_aria')"
				:disabled="customEntriesCount == 0"
				icon="list">
					<i18n-t scope="global" keypath="raffle.list.startBt">
						<template #COUNT>
							<i class="small">({{ customEntriesCount }})</i>
						</template>
					</i18n-t>
				</TTButton>
			</form>

			<form class="form" v-else-if="mode=='values'" @submit.prevent="submitForm()">
				<i18n-t scope="global" tag="div" class="info" keypath="raffle.values.description">
					<template #VALUE>
						<a @click="openValues()">{{ $t("raffle.values.description_value") }}</a>
					</template>
				</i18n-t>

				<ParamItem :paramData="param_values" v-model="param_values.value" @change="onValueChange()" />

				<ParamItem :paramData="param_values_remove" v-model="param_values_remove.value" @change="onValueChange()" />

				<ParamItem class="splitterField" :paramData="param_values_splitter" v-model="param_values_splitter.value" @change="onValueChange()" v-if="param_values.selectedListValue?.value.perUser !== true" />

				<TTButton type="submit"
				v-if="triggerMode === false"
				:loading="pickingEntry"
				:aria-label="$t('raffle.list.startBt_aria')"
				:disabled="valueCount == 0"
				icon="list">
					<i18n-t scope="global" keypath="raffle.values.startBt">
						<template #COUNT>
							<i class="small">({{ valueCount }})</i>
						</template>
					</i18n-t>
				</TTButton>
			</form>
		</div>
	</div>
</template>

<script lang="ts">
import DataStore from '@/store/DataStore';
import StoreProxy from '@/store/StoreProxy';
import { TriggerEventPlaceholders, type TriggerActionRaffleData, type TriggerData } from '@/types/TriggerActionDataTypes';
import { TwitchatDataTypes } from '@/types/TwitchatDataTypes';
import type { TwitchDataTypes } from '@/types/twitch/TwitchDataTypes';
import Utils from '@/utils/Utils';
import { TwitchScopes } from '@/utils/twitch/TwitchScopes';
import TwitchUtils from '@/utils/twitch/TwitchUtils';
import { watch } from 'vue';
import {toNative,  Component, Prop } from 'vue-facing-decorator';
import AbstractSidePanel from '../AbstractSidePanel';
import TTButton from '../TTButton.vue';
import ClearButton from '../ClearButton.vue';
import TabMenu from '../TabMenu.vue';
import ToggleBlock from '../ToggleBlock.vue';
import ParamItem from '../params/ParamItem.vue';
import PostOnChatParam from '../params/PostOnChatParam.vue';
import FormVoiceControllHelper from '../voice/FormVoiceControllHelper';
import VoiceGlobalCommandsHelper from '../voice/VoiceGlobalCommandsHelper.vue';

@Component({
	components:{
		TTButton,
		TabMenu,
		ParamItem,
		ToggleBlock,
		ClearButton,
		PostOnChatParam,
		VoiceGlobalCommandsHelper,
	},
	emits:["close"]
})
class RaffleForm extends AbstractSidePanel {

	@Prop({type: Boolean, default: false})
	public voiceControl!:boolean;

	@Prop({type: Boolean, default: false})
	public triggerMode!:boolean;

	//This is used by the trigger action form.
	@Prop({type: Object, default:{}})
	public action!:TriggerActionRaffleData;

	@Prop
	public triggerData!:TriggerData;

	public pickingEntry = false;
	public winner:string|null = null;
	public winnerTmp:string|null = null;

	public mode:TwitchatDataTypes.RaffleData["mode"] = "chat";

	public param_command:TwitchatDataTypes.ParameterData<boolean, any, any>		= {value:true, type:"boolean", labelKey:"raffle.params.command_join", icon:"commands"};
	public param_commandValue:TwitchatDataTypes.ParameterData<string>			= {value:"", type:"string", labelKey:"raffle.params.command", placeholderKey:"raffle.params.command_placeholder"};
	public param_reward:TwitchatDataTypes.ParameterData<boolean, any, any>		= {value:false, type:"boolean", labelKey:"raffle.params.reward_join", icon:"channelPoints"};
	public param_rewardvalue:TwitchatDataTypes.ParameterData<string>			= {value:"", type:"list", listValues:[], labelKey:"raffle.params.reward", placeholderKey:"raffle.params.command_placeholder"};
	public param_enterDuration:TwitchatDataTypes.ParameterData<number>			= {value:10, type:"number", min:1, max:1440, labelKey:"raffle.params.duration", icon:"timer"};
	public param_maxUsersToggle:TwitchatDataTypes.ParameterData<boolean, any, any>= {value:false, type:"boolean", labelKey:"raffle.params.limit_users", icon:"user"};
	public param_maxEntries:TwitchatDataTypes.ParameterData<number>				= {value:10, type:"number", min:0, max:1000000, labelKey:"raffle.params.max_users", icon:"user"};
	public param_multipleJoin:TwitchatDataTypes.ParameterData<boolean>			= {value:false, type:"boolean", labelKey:"raffle.params.multiple_join", icon:"user"};
	public param_ponderateVotes:TwitchatDataTypes.ParameterData<boolean, any, any>= {value:false, type:"boolean", labelKey:"raffle.params.ponderate"};
	public param_ponderateVotes_vip:TwitchatDataTypes.ParameterData<number>		= {value:0, type:"number", min:0, max:100, icon:"vip", labelKey:"raffle.params.ponderate_VIP"};
	public param_ponderateVotes_sub:TwitchatDataTypes.ParameterData<number>		= {value:0, type:"number", min:0, max:100, icon:"sub", labelKey:"raffle.params.ponderate_sub"};
	public param_ponderateVotes_subT2:TwitchatDataTypes.ParameterData<number>	= {value:0, type:"number", min:0, max:100, icon:"sub", labelKey:"raffle.params.ponderate_subT2", twitch_scopes:[TwitchScopes.LIST_SUBSCRIBERS]};
	public param_ponderateVotes_subT3:TwitchatDataTypes.ParameterData<number>	= {value:0, type:"number", min:0, max:100, icon:"sub", labelKey:"raffle.params.ponderate_subT3", twitch_scopes:[TwitchScopes.LIST_SUBSCRIBERS]};
	public param_ponderateVotes_subgift:TwitchatDataTypes.ParameterData<number>	= {value:0, type:"number", min:0, max:100, icon:"gift", labelKey:"raffle.params.ponderate_subgifter"};
	public param_ponderateVotes_follower:TwitchatDataTypes.ParameterData<number>= {value:0, type:"number", min:0, max:100, icon:"follow", labelKey:"raffle.params.ponderate_follower", twitch_scopes:[TwitchScopes.LIST_FOLLOWERS]};
	public param_subs_includeGifters:TwitchatDataTypes.ParameterData<boolean>	= {value:true, type:"boolean", icon:"gift", labelKey:"raffle.params.ponderate_include_gifter"};
	public param_subs_excludeGifted:TwitchatDataTypes.ParameterData<boolean>	= {value:true, type:"boolean", icon:"sub", labelKey:"raffle.params.ponderate_exclude_gifted"};
	public param_showCountdownOverlay:TwitchatDataTypes.ParameterData<boolean>	= {value:false, type:"boolean", icon:"countdown", labelKey:"raffle.configs.countdown"};
	public param_customEntries:TwitchatDataTypes.ParameterData<string>			= {value:"", type:"string", longText:true, maxLength:10000, placeholderKey:"raffle.params.list_placeholder"};
	public param_values:TwitchatDataTypes.ParameterData<TwitchatDataTypes.ValueData|null, TwitchatDataTypes.ValueData, undefined, TwitchatDataTypes.ValueData>	= {value:null, type:"list", labelKey:"raffle.params.value_placeholder", icon:"placeholder"};
	public param_values_splitter:TwitchatDataTypes.ParameterData<string>		= {value:",", type:"string", maxLength:5, labelKey:"raffle.params.value_splitter", icon:"splitter"};
	public param_values_remove:TwitchatDataTypes.ParameterData<boolean>			= {value:false, type:"boolean", labelKey:"raffle.params.value_remove", icon:"trash"};
	public param_list_remove:TwitchatDataTypes.ParameterData<boolean>			= {value:false, type:"boolean", labelKey:"raffle.params.list_remove", icon:"trash"};

	public winnerPlaceholders!:TwitchatDataTypes.PlaceholderEntry[];
	public joinPlaceholders!:TwitchatDataTypes.PlaceholderEntry[];

	private subs:TwitchDataTypes.Subscriber[] = [];
	private voiceController!:FormVoiceControllHelper;

	public get hasRewards():boolean { return TwitchUtils.hasScopes([TwitchScopes.LIST_REWARDS]) && this.param_rewardvalue.listValues!.length > -1; }
	public get isAffiliate():boolean { return this.$store.auth.twitch.user.is_affiliate || this.$store.auth.twitch.user.is_partner; }

	/**
	 * Gets subs filtered by the current filters
	 */
	public get subsFiltered():TwitchDataTypes.Subscriber[] {
		return this.subs.filter(v => {
			if(this.param_subs_includeGifters.value == true && this.subs.find(v2=> v2.gifter_id == v.user_id)) return true;
			if(this.param_subs_excludeGifted.value == true && v.is_gift) return false;
			if(v.user_id == StoreProxy.auth.twitch.user.id) return false;
			return true;
		})
	}

	public get classes():string[] {
		const res = ["raffleform", "sidePanel"];
		if(this.triggerMode !== false) res.push("embedMode");
		return res;
	}

	public get customEntriesCount():number {
		const splitter = this.param_customEntries.value.split(/\r|\n/).length > 1? "\r|\n" : ",";
		const list = this.param_customEntries.value.split(new RegExp(splitter, ""))
					.filter((v)=>v.length > 0)
		return list.length;
	}

	public get valueCount():number {
		if(this.param_values.value) {
			const val = this.param_values.selectedListValue?.value;
			if(!val) return 0;
			if(val.perUser) return Object.keys(val.users || {}).length;
			const splitter = this.finalData.value_splitter || new RegExp(val.value.split(/\r|\n/).length > 1? "\r|\n" : ",");
			return val.value.split(splitter)
					.filter((v)=>v.length > 0).length;
		}else{
			return 0;
		}
	}

	public get finalData():TwitchatDataTypes.RaffleData {
		let cmd = "";
		if(this.param_command.value === true) {
			cmd = this.param_commandValue.value? this.param_commandValue.value : this.$t("raffle.params.command_placeholder");
		}

		return  {
			mode:this.mode,
			command:cmd,
			reward_id:this.param_rewardvalue.value,
			duration_s:this.param_enterDuration.value * 60,
			maxEntries:this.param_maxUsersToggle.value ? this.param_maxEntries.value : 0,
			multipleJoin:this.param_multipleJoin.value,
			created_at:Date.now(),
			entries:[],
			followRatio: this.param_ponderateVotes_follower.value,
			vipRatio: this.param_ponderateVotes_vip.value,
			subRatio: this.param_ponderateVotes_sub.value,
			subT2Ratio: this.param_ponderateVotes_subT2.value,
			subT3Ratio: this.param_ponderateVotes_subT3.value,
			subgiftRatio: this.param_ponderateVotes_subgift.value,
			subMode_includeGifters: this.param_subs_includeGifters.value,
			subMode_excludeGifted: this.param_subs_excludeGifted.value,
			showCountdownOverlay: this.param_showCountdownOverlay.value,
			customEntries: this.param_customEntries.value,
			value_id: this.param_values.value?.id,
			value_splitter: this.param_values_splitter.value,
			removeWinningEntry: this.mode == "values"? this.param_values_remove.value : this.mode == "manual"? this.param_list_remove.value : false,
		}
	}

	public get startPlaceholders():TwitchatDataTypes.PlaceholderEntry[] {
		return [{tag:"CMD", descKey:"raffle.configs.message_cmd_placeholder", example:this.finalData.command}];
	}

	public get canListSubs():boolean { return TwitchUtils.hasScopes([TwitchScopes.LIST_SUBSCRIBERS]); }

	public beforeMount(): void {
		this.winnerPlaceholders			= [{tag:"USER", descKey:"raffle.params.username_placeholder", example:this.$store.auth.twitch.user.displayNameOriginal}];
		this.joinPlaceholders			= [{tag:"USER", descKey:"raffle.params.username_placeholder", example:this.$store.auth.twitch.user.displayNameOriginal+", @Twitch, @Durss"}];
		this.param_command.children		= [this.param_commandValue];
		this.param_reward.children		= [this.param_rewardvalue];

		this.param_rewardvalue.listValues = [{value:undefined, labelKey:"global.select_placeholder"}]

		if(this.isAffiliate) {
			TwitchUtils.getRewards().then(list => {
				list.sort((a,b)=> {
					if(a.title > b.title) return 1;
					if(a.title < b.title) return -1;
					return 0
				}).forEach(v=> {
					this.param_rewardvalue.listValues!.push({value:v.id, label:v.title});
				});
			});
		}

		this.param_values.listValues = this.$store.values.valueList.map(v=> {
			return <TwitchatDataTypes.ParameterDataListValue<TwitchatDataTypes.ValueData>>{value:v, label:v.name};
		})

		if(this.triggerMode !== false) {
			if(this.action.raffleData) {
				this.mode = this.action.raffleData.mode;
				this.param_command.value = this.action.raffleData.command != undefined;
				this.param_commandValue.value = this.action.raffleData.command || "";
				this.param_enterDuration.value = this.action.raffleData.duration_s/60;
				this.param_maxUsersToggle.value = this.param_maxEntries.value > 0;
				this.param_maxEntries.value = this.action.raffleData.maxEntries ?? 0;
				this.param_multipleJoin.value = this.action.raffleData.multipleJoin === true;
				this.param_reward.value = this.action.raffleData.reward_id != undefined;
				this.param_rewardvalue.value = this.action.raffleData.reward_id || "";
				this.param_ponderateVotes_follower.value = this.action.raffleData.followRatio ?? 0;
				this.param_ponderateVotes_vip.value = this.action.raffleData.vipRatio ?? 0;
				this.param_ponderateVotes_sub.value = this.action.raffleData.subRatio ?? 0;
				this.param_ponderateVotes_subT2.value = this.action.raffleData.subT2Ratio ?? 0;
				this.param_ponderateVotes_subT3.value = this.action.raffleData.subT3Ratio ?? 0;
				this.param_ponderateVotes_subgift.value = this.action.raffleData.subgiftRatio ?? 0;
				this.param_ponderateVotes.value = this.param_ponderateVotes_vip.value > 0 ||
											this.param_ponderateVotes_sub.value > 0 ||
											this.param_ponderateVotes_subT2.value > 0 ||
											this.param_ponderateVotes_subT3.value > 0 ||
											this.param_ponderateVotes_subgift.value > 0;
				this.param_subs_includeGifters.value = this.action.raffleData.subMode_includeGifters ?? false;
				this.param_subs_excludeGifted.value = this.action.raffleData.subMode_excludeGifted ?? false;
				this.param_showCountdownOverlay.value = this.action.raffleData.showCountdownOverlay;
				this.param_customEntries.value = this.action.raffleData.customEntries;
				this.param_values.value = this.param_values.listValues.find(v => v.value.id === this.action.raffleData.value_id)?.value || this.param_values.listValues[0].value;
				this.param_values_remove.value = this.action.raffleData.mode == "values"? this.action.raffleData.removeWinningEntry === true : false;
				this.param_list_remove.value = this.action.raffleData.mode == "manual"? this.action.raffleData.removeWinningEntry === true : false;
			}

			this.param_customEntries.placeholderList = TriggerEventPlaceholders(this.triggerData.type);
		}else{
			this.param_showCountdownOverlay.value = DataStore.get(DataStore.RAFFLE_OVERLAY_COUNTDOWN) === "true";
		}

		this.param_maxUsersToggle.children = [this.param_maxEntries];
		this.param_ponderateVotes.children = [
											this.param_ponderateVotes_vip,
											this.param_ponderateVotes_follower,
											this.param_ponderateVotes_sub,
											this.param_ponderateVotes_subT2,
											this.param_ponderateVotes_subT3,
											this.param_ponderateVotes_subgift,
										];
	}

	public async mounted():Promise<void> {

		if(!this.triggerMode) {
			this.open();
		}

		watch(()=>this.voiceControl, ()=>{
			if(this.voiceControl && !this.voiceController) {
				this.voiceController = new FormVoiceControllHelper(this.$el, this.close, this.submitForm);
			}
		});

		watch(()=>this.param_showCountdownOverlay.value, ()=>{
			if(this.triggerMode) return;

			DataStore.set(DataStore.RAFFLE_OVERLAY_COUNTDOWN, this.param_showCountdownOverlay.value)
		})

		watch(()=>this.mode, () => this.onValueChange());
		watch(()=>this.param_commandValue.value, () => this.onValueChange());
		watch(()=>this.param_rewardvalue.value, () => this.onValueChange());
		watch(()=>this.param_ponderateVotes_vip.value, () => this.onValueChange());
		watch(()=>this.param_ponderateVotes_follower.value, () => this.onValueChange());
		watch(()=>this.param_ponderateVotes_sub.value, () => this.onValueChange());
		watch(()=>this.param_ponderateVotes_subT2.value, () => this.onValueChange());
		watch(()=>this.param_ponderateVotes_subT3.value, () => this.onValueChange());
		watch(()=>this.param_ponderateVotes_subgift.value, () => this.onValueChange());
		watch(()=>this.param_maxEntries.value, () => this.onValueChange());

		this.onValueChange();

		this.pickingEntry = true;
		this.subs = await TwitchUtils.getSubsList(false);
		this.pickingEntry = false;
		// this.onValueChange();
	}

	public beforeUnmount():void {
		if(this.voiceController) this.voiceController.dispose();
	}


	/**
	 * Create a raffle
	 */
	public async submitForm():Promise<void> {
		const payload:TwitchatDataTypes.RaffleData = this.finalData;
		//Sub mode specifics
		if(this.mode == "sub") {
			let subs = Utils.shuffle(await TwitchUtils.getSubsList(false));
			let interval = setInterval(()=> {
				this.winnerTmp = Utils.pickRand(subs).user_name;
			}, 70)
			this.winner = null;
			this.pickingEntry = true;
			await Utils.promisedTimeout(2000);
			payload.resultCallback = ()=> {
				clearInterval(interval);

				if(payload.winners
				&& payload.winners.length > 0) {
					this.winnerTmp = null;
					this.winner = payload.winners[payload.winners.length-1].label;
				}
			}
		}

		this.pickingEntry = true;
		await this.$store.raffle.startRaffle(payload);
		if(this.mode == "chat") {
			this.close();
		}else{
			await Utils.promisedTimeout(500);
		}
		this.pickingEntry = false;


		if(!this.triggerMode && this.finalData.mode == "manual") {
			this.param_customEntries.value = payload.customEntries;
		}
	}

	public openParam(page:TwitchatDataTypes.ParameterPagesStringType):void {
		if(this.triggerMode) {
			this.$store.params.openParamsPage(TwitchatDataTypes.ParameterPages.OVERLAYS);
		}else{
			this.$store.params.openParamsPage(page);
		}
	}

	public onValueChange():void {
		if(this.action) {
			if(this.triggerMode !== false) this.param_command.value = true;
			this.action.raffleData = this.finalData;
		}
	}

	public requestSubPermission():void {
		this.$store.auth.requestTwitchScopes([TwitchScopes.LIST_SUBSCRIBERS]);
	}

	public openValues():void {
		this.$store.params.openParamsPage(TwitchatDataTypes.ParameterPages.VALUES);
	}

}
export default toNative(RaffleForm);
</script>

<style scoped lang="less">
.raffleform{

	.legal {
		margin: 0 auto;
		width: 100%;
		max-width: 600px;
	}

	.content {
		.voiceHelper {
			margin: auto;
		}

		.form {

			.small {
				font-size: .8em;
			}

			.winner {
				font-weight: bold;
				gap: 0;
				color: var(--color-light);
				background-color: var(--color-secondary);
				.head {
					font-size: 1.25em;
					padding: .25em;
					text-align: center;
				}
				.user {
					padding: .5em;
					text-align: center;
				}
			}

			&.scope {
				text-align: center;
				p {
					font-size: .8em;
				}
				img {
					height: .8em;
					margin-right: .25em;
					vertical-align: middle;
				}
				a{
					color: var(--color-alert);
				}
				.grantBt {
					margin: auto;
				}
			}

			.instructions {
				display: block;
				font-size: .9em;
				font-style: italic;
				text-align: center;
			}

			.splitterField {
				:deep(.inputHolder) {
					align-self: flex-end;
					flex-grow: 0;
					flex-basis: 100px;
					input {
						padding-right: 1.5em;
					}
				}
			}
		}
	}
}
</style>
