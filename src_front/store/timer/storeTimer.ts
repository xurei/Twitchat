import { TwitchatDataTypes } from '@/types/TwitchatDataTypes'
import PublicAPI from '@/utils/PublicAPI';
import TriggerActionHandler from '@/utils/TriggerActionHandler';
import TwitchatEvent from '@/events/TwitchatEvent';
import Utils from '@/utils/Utils';
import { defineStore, type PiniaCustomProperties, type _GettersTree, type _StoreWithGetters, type _StoreWithState } from 'pinia'
import type { JsonObject } from 'type-fest';
import type { UnwrapRef } from 'vue';
import StoreProxy, { type ITimerActions, type ITimerGetters, type ITimerState } from '../StoreProxy';

export const storeTimer = defineStore('timer', {
	state: () => ({
		timerStart: -1,
		countdown: null as TwitchatDataTypes.CountdownData|null,
	} as ITimerState),



	getters: {
	} as ITimerGetters
	& ThisType<UnwrapRef<ITimerState> & _StoreWithGetters<ITimerGetters> & PiniaCustomProperties>
	& _GettersTree<ITimerState>,



	actions: {

		startTimer() {
			this.timerStart = Date.now();
			const data = { startAt:this.timerStart };
			PublicAPI.instance.broadcast(TwitchatEvent.TIMER_START, data);

			const message:TwitchatDataTypes.MessageTimerData = {
				type:TwitchatDataTypes.TwitchatMessageType.TIMER,
				platform:"twitchat",
				started:true,
				id:Utils.getUUID(),
				date:Date.now(),
				startAt:Utils.formatDuration(Date.now(), true),
				startAt_ms:Date.now(),
			};
			StoreProxy.chat.addMessage(message);
		},

		stopTimer() {
			const data = { startAt:this.timerStart, stopAt:Date.now() };
			PublicAPI.instance.broadcast(TwitchatEvent.TIMER_STOP, data);

			const message:TwitchatDataTypes.MessageTimerData = {
				type:TwitchatDataTypes.TwitchatMessageType.TIMER,
				platform:"twitchat",
				started:false,
				id:Utils.getUUID(),
				date:Date.now(),
				startAt:Utils.formatDuration(Date.now(), true),
				startAt_ms:Date.now(),
				duration:Utils.formatDuration(Date.now() - this.timerStart, true),
				duration_ms:Date.now() - this.timerStart,
			};
			StoreProxy.chat.addMessage(message);

			this.timerStart = -1;
		},

		startCountdown(duration_ms:number) {
			const timeout = setTimeout(()=> {
				this.stopCountdown()
			}, Math.max(duration_ms, 1000));

			console.log("START", duration_ms);

			if(this.countdown) {
				clearTimeout(this.countdown.timeoutRef);
			}

			this.countdown = {
				timeoutRef:timeout,
				startAt:Utils.formatDate(new Date()),
				startAt_ms:Date.now(),
				duration:Utils.formatDuration(duration_ms, true),
				duration_ms:duration_ms,
			};
			console.log(this.countdown);

			const message:TwitchatDataTypes.MessageCountdownData = {
				type:TwitchatDataTypes.TwitchatMessageType.COUNTDOWN,
				platform:"twitchat",
				id:Utils.getUUID(),
				date:Date.now(),
				countdown:this.countdown,
			};
			StoreProxy.chat.addMessage(message);
			
			PublicAPI.instance.broadcast(TwitchatEvent.COUNTDOWN_START, this.countdown);
		},

		stopCountdown() {
			if(this.countdown) {
				clearTimeout(this.countdown.timeoutRef);

				const cd = {
					timeoutRef:-1,
					startAt:this.countdown.startAt,
					startAt_ms:this.countdown.startAt_ms,
					duration:this.countdown.duration,
					duration_ms:this.countdown.duration_ms,
					endAt:Utils.formatDate(new Date()),
					endAt_ms:Date.now(),
				};
				
				const message:TwitchatDataTypes.MessageCountdownData = {
					type:TwitchatDataTypes.TwitchatMessageType.COUNTDOWN,
					platform:"twitchat",
					id:Utils.getUUID(),
					date:Date.now(),
					countdown:cd,
				};
				StoreProxy.chat.addMessage(message);
	
				PublicAPI.instance.broadcast(TwitchatEvent.COUNTDOWN_COMPLETE, this.countdown);
			}

			this.countdown = null;
		},
	} as ITimerActions
	& ThisType<ITimerActions
		& UnwrapRef<ITimerState>
		& _StoreWithState<"timer", ITimerState, ITimerGetters, ITimerActions>
		& _StoreWithGetters<ITimerGetters>
		& PiniaCustomProperties
	>,
})