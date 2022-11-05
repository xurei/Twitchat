import { TwitchatDataTypes } from '@/types/TwitchatDataTypes';
import TwitchUtils from '@/utils/twitch/TwitchUtils';
import Utils from '@/utils/Utils';
import { LoremIpsum } from 'lorem-ipsum';
import { defineStore, type PiniaCustomProperties, type _GettersTree, type _StoreWithGetters, type _StoreWithState } from 'pinia';
import type { UnwrapRef } from 'vue';
import type { IDebugActions, IDebugGetters, IDebugState } from '../StoreProxy';
import StoreProxy from '../StoreProxy';
import rewardImg from '@/assets/icons/channelPoints.svg';

export const storeDebug = defineStore('debug', {
	state: () => ({
	} as IDebugState),



	getters: {
	} as IDebugGetters
	& ThisType<UnwrapRef<IDebugState> & _StoreWithGetters<IDebugGetters> & PiniaCustomProperties>
	& _GettersTree<IDebugState>,



	actions: {
		async simulateMessage(type:TwitchatDataTypes.TwitchatMessageStringType, hook?:(message:TwitchatDataTypes.ChatMessageTypes)=>boolean):Promise<void> {
			let data!:TwitchatDataTypes.ChatMessageTypes;
			const uid:string = StoreProxy.auth.twitch.user.id;
			const user:TwitchatDataTypes.TwitchatUser = StoreProxy.users.getUserFrom("twitch", uid, uid);
			const tmpFake = Utils.pickRand(StoreProxy.users.users.filter(v=>v.errored !== true));
			//Reloading the user from getUserFrom() to make sure the channel specific data are initialized
			const fakeUser:TwitchatDataTypes.TwitchatUser = StoreProxy.users.getUserFrom("twitch", uid, tmpFake.id, tmpFake.login, tmpFake.displayName);
			

			const lorem = new LoremIpsum({
				sentencesPerParagraph: { max: 8, min: 4 },
				wordsPerSentence: { max: 8, min: 2 }
			});
			const message = lorem.generateSentences(Math.round(Math.random()*2) + 1);
			switch(type) {
				case TwitchatDataTypes.TwitchatMessageType.MESSAGE: {
					const m:TwitchatDataTypes.MessageChatData = {
						id:Utils.getUUID(),
						platform:"twitch",
						channel_id:uid,
						date:Date.now(),
						type,
						answers:[],
						message,
						message_html:message,
						user:fakeUser
					};
					data = m;
					break;
				}
				
				case TwitchatDataTypes.TwitchatMessageType.SUBSCRIPTION: {
					const m:TwitchatDataTypes.MessageSubscriptionData = {
						id:Utils.getUUID(),
						platform:"twitch",
						channel_id:uid,
						date:Date.now(),
						type,
						message,
						message_html:message,
						user:fakeUser,
						months: Math.floor(Math.random() * 6) + 1,
						streakMonths: Math.floor(Math.random() * 46),
						totalSubDuration: Math.floor(Math.random() * 46),
						tier:Utils.pickRand([1,2,3,"prime"]),
						is_gift:false,
						is_giftUpgrade:false,
						is_resub:false,
						gift_upgradeSender:StoreProxy.users.getUserFrom("twitch", uid, (Math.round(Math.random() * 999999999).toString())),
					};
					data = m;
					break;
				}
				
				case TwitchatDataTypes.TwitchatMessageType.CHEER: {
					const m:TwitchatDataTypes.MessageCheerData = {
						id:Utils.getUUID(),
						platform:"twitch",
						channel_id:uid,
						date:Date.now(),
						type,
						message,
						message_html:message,
						user:fakeUser,
						bits:Math.round(Math.random() * 1000),
					};
					data = m;
					break;
				}
				
				case TwitchatDataTypes.TwitchatMessageType.FOLLOWING: {
					const m:TwitchatDataTypes.MessageFollowingData = {
						id:Utils.getUUID(),
						platform:"twitch",
						channel_id:uid,
						date:Date.now(),
						type,
						user:fakeUser,
						followed_at:Date.now(),
					};
					data = m;
					break;
				}
					
				case TwitchatDataTypes.TwitchatMessageType.JOIN:
				case TwitchatDataTypes.TwitchatMessageType.LEAVE: {
					const users:TwitchatDataTypes.TwitchatUser[] = [];
					const count = Math.round(Math.random() * 50) + 1;
					for (let i = 0; i < count; i++) {
						users.push(StoreProxy.users.getUserFrom("twitch", uid, (Math.round(Math.random() * 999999999)).toString()))
					}
					const m:TwitchatDataTypes.MessageJoinData|TwitchatDataTypes.MessageLeaveData = {
						id:Utils.getUUID(),
						platform:"twitch",
						channel_id:uid,
						date:Date.now(),
						type,
						users,
					};
					data = m;
					break;
				}

				case TwitchatDataTypes.TwitchatMessageType.REWARD: {
					const reward = Utils.pickRand(await (await TwitchUtils.getRewards()).filter(v=>v.is_enabled===true));
					if(!reward) {
						//User has no public reward, send a fake one
						const m:TwitchatDataTypes.MessageRewardRedeemData = {
							id:Utils.getUUID(),
							platform:"twitch",
							channel_id:uid,
							date:Date.now(),
							type,
							user,
							reward: {
								id:Utils.getUUID(),
								cost:50,
								description:"I tell you how amazing Twitchat is <3",
								title:"Praise twitchat",
								icon:{
									sd:rewardImg,
									hd:rewardImg,
								},
							},
						};
						data = m;
					}else{
						//Use one of the user's rewards
						const img = reward.image ?? reward.default_image;
						const icon:TwitchatDataTypes.TwitchatImage = {sd: img.url_1x, hd: img.url_4x};
						const m:TwitchatDataTypes.MessageRewardRedeemData = {
							id:Utils.getUUID(),
							platform:"twitch",
							channel_id:uid,
							date:Date.now(),
							type,
							user,
							reward: {
								id:reward.id,
								cost:reward.cost,
								description:reward.prompt,
								title:reward.title,
								icon,
							},
						};
						data = m;
					}
					break;
				}

				case TwitchatDataTypes.TwitchatMessageType.RAID: {
					const m:TwitchatDataTypes.MessageRaidData = {
						id:Utils.getUUID(),
						platform:"twitch",
						channel_id:uid,
						date:Date.now(),
						type,
						user,
						viewers:Math.round(Math.random() * 1500)
					};
					data = m;
					break;
				}

				case TwitchatDataTypes.TwitchatMessageType.HYPE_TRAIN_SUMMARY: {
					const approached_at = Date.now() - Math.round(Math.random()*60*1000*10 + 60*1000);
					const activities:(TwitchatDataTypes.MessageSubscriptionData | TwitchatDataTypes.MessageCheerData)[] = [];
					const count = Math.round(Math.random() * 40) + 5;
					let sum = 0;
					//Generate fake events
					for (let i = 0; i < count; i++) {
						const types = [TwitchatDataTypes.TwitchatMessageType.SUBSCRIPTION, TwitchatDataTypes.TwitchatMessageType.CHEER]
						const t = Utils.pickRand(types);
						this.simulateMessage(t, (message)=> {
							if(message.type == TwitchatDataTypes.TwitchatMessageType.SUBSCRIPTION) {
								//Simulate subgifts
								if(Math.random() > .3) {
									const recipients:TwitchatDataTypes.TwitchatUser[] = [];
									const count = Math.round(Math.random() * 50) + 1;
									const m = (message as TwitchatDataTypes.MessageSubscriptionData);
									for (let i = 0; i < count; i++) {
										recipients.push(StoreProxy.users.getUserFrom("twitch", StoreProxy.auth.twitch.user.id, (Math.round(Math.random() * 999999999)).toString()))
									}
									m.gift_recipients = recipients;
									m.is_gift = true;
									sum += count * parseInt(m.tier.toString().replace("prime", "1")) * 250;
								}else{
									sum += parseInt(message.tier.toString().replace("prime", "1")) * 250;;
								}
							}else if(message.type == TwitchatDataTypes.TwitchatMessageType.CHEER){
								//Simulate cheer
								sum += message.bits;
							}
							activities.push(message as (TwitchatDataTypes.MessageSubscriptionData | TwitchatDataTypes.MessageCheerData));
							return false;//Avoid sending it on chat
						})
					}
					
					
					const m:TwitchatDataTypes.MessageHypeTrainSummaryData = {
						id:Utils.getUUID(),
						platform:"twitch",
						channel_id:uid,
						date:Date.now(),
						type,
						train: {
							channel_id:uid,
							approached_at,
							started_at:approached_at + 30000,
							updated_at:approached_at + 30000,
							timeLeft:0,
							goal:100,
							currentValue:Math.floor(Math.random() * 100),
							level:Math.round(sum/8000),
							is_new_record:Math.random() > .5,
							is_boost_train:false,
							state:'COMPLETED'
						},
						activities,
					};
					data = m;
					break;
				}

				case TwitchatDataTypes.TwitchatMessageType.COMMUNITY_BOOST_COMPLETE: {
					const m:TwitchatDataTypes.MessageCommunityBoostData = {
						id:Utils.getUUID(),
						platform:"twitch",
						channel_id:uid,
						date:Date.now(),
						type,
						viewers:Math.ceil(Math.random() * 15) * 250,
					};
					data = m;
					break;
				}

				case TwitchatDataTypes.TwitchatMessageType.BAN: {
					const m:TwitchatDataTypes.MessageBanData = {
						id:Utils.getUUID(),
						platform:"twitch",
						channel_id:uid,
						date:Date.now(),
						type:TwitchatDataTypes.TwitchatMessageType.NOTICE,
						noticeId:type,
						user:fakeUser,
						moderator:user,
						message:fakeUser.displayName+" has been banned by "+user.displayName,
						reason:"you're a butt hole",
					};
					data = m;
					break;
				}

				case TwitchatDataTypes.TwitchatMessageType.POLL: {
					const choices:TwitchatDataTypes.MessagePollDataChoice[] = [];
					const count = Math.ceil(Math.random()*10);
					for(let i=0; i < count; i++) {
						const votes = Math.round(Math.random()*50);
						choices.push({id:Utils.getUUID(), label:"Option "+(i+1), votes});
					}
					const m:TwitchatDataTypes.MessagePollData = {
						id:Utils.getUUID(),
						platform:"twitch",
						channel_id:uid,
						date:Date.now(),
						type,
						choices,
						duration_s:180,
						title:"Who wins?",
						started_at:Date.now() - 2 * 60 * 1000,
						ended_at:Date.now(),
					};
					data = m;
					break;
				}

				case TwitchatDataTypes.TwitchatMessageType.PREDICTION: {
					const outcomes:TwitchatDataTypes.MessagePredictionDataOutcome[] = [];
					const count = Math.ceil(Math.random()*9)+1;
					for(let i=0; i < count; i++) {
						const voters = Math.round(Math.random()*50);
						const votes = Math.round(Math.random()*1000000);
						outcomes.push({id:Utils.getUUID(), label:"Option "+(i+1), votes, voters});
					}
					const m:TwitchatDataTypes.MessagePredictionData = {
						id:Utils.getUUID(),
						platform:"twitch",
						channel_id:uid,
						date:Date.now(),
						type,
						outcomes,
						duration_s:180,
						title:"Who wins?",
						started_at:Date.now() - 2 * 60 * 1000,
						ended_at:Date.now(),
						pendingAnswer:false,
						winning_outcome_id:Utils.pickRand(outcomes).id,
					};
					data = m;
					break;
				}

				case TwitchatDataTypes.TwitchatMessageType.AUTOBAN_JOIN: {
					const m:TwitchatDataTypes.MessageAutobanJoinData = {
						platform:"twitchat",
						channel_id: uid,
						type:"autoban_join",
						date:Date.now(),
						id:Utils.getUUID(),
						user,
						rule:{
							enabled:true,
							id:Utils.getUUID(),
							label:"Durss filter",
							regex:"durss",
							serverSync:false
						},
					};
					data = m;
					break;
				}

				case TwitchatDataTypes.TwitchatMessageType.BINGO: {
					const m:TwitchatDataTypes.MessageBingoData = {
						platform:"twitchat",
						type:"bingo",
						date:Date.now(),
						id:Utils.getUUID(),
						user,
						bingoData: {
							guessEmote:false,
							guessNumber:true,
							min:0,
							max:1000,
							numberValue:Math.round(Math.random()*999),
							winners: [user],
						}
					};
					data = m;
					break;
				}

				case TwitchatDataTypes.TwitchatMessageType.RAFFLE: {
					const entries:TwitchatDataTypes.RaffleEntry[] = [];
					for (let i = 0; i < 10; i++) {
						entries.push({
							id:Utils.getUUID(),
							label:"Option "+(i+1),
							score:1,
						});
					}
					const m:TwitchatDataTypes.MessageRaffleData = {
						platform:"twitchat",
						type:"raffle",
						date:Date.now(),
						id:Utils.getUUID(),
						raffleData: {
							command:"",
							created_at:Date.now()-30000,
							duration_s:60,
							followRatio:0,
							subRatio:0,
							vipRatio:0,
							subgitRatio:0,
							mode:'manual',
							subMode_excludeGifted:false,
							subMode_includeGifters:false,
							showCountdownOverlay:false,
							maxEntries: 0,
							entries:[],
							customEntries:entries.map(v=>v.label).join(","),
							winners:[Utils.pickRand(entries)],
						},
					};
					data = m;
					break;
				}

				case TwitchatDataTypes.TwitchatMessageType.COUNTDOWN: {
					const m:TwitchatDataTypes.MessageCountdownData = {
						platform:"twitchat",
						type:"countdown",
						date:Date.now(),
						id:Utils.getUUID(),
						countdown: {
							duration:Math.round(Math.random() *60*60)*1000,
							startAt:Date.now(),
							timeoutRef:-1,
						}
					};
					data = m;
					break;
				}
			}
			if(hook) {
				if(hook(data) === false) return;
			}
			StoreProxy.chat.addMessage(data);
		}
	} as IDebugActions
	& ThisType<IDebugActions
		& UnwrapRef<IDebugState>
		& _StoreWithState<"Debug", IDebugState, IDebugGetters, IDebugActions>
		& _StoreWithGetters<IDebugGetters>
		& PiniaCustomProperties
	>,
})