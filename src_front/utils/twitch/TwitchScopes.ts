export const TwitchScopes = {
	CHAT_READ: "chat:read",
	CHAT_WRITE: "chat:edit",
	WHISPER_READ: "whispers:read",
	WHISPER_WRITE: "user:manage:whispers",
	SHOUTOUT: "moderator:manage:shoutouts",
	SEND_ANNOUNCE: "moderator:manage:announcements",
	DELETE_MESSAGES: "moderator:manage:chat_messages",
	LIST_CHATTERS: "moderator:read:chatters",
	LIST_REWARDS: "channel:read:redemptions",
	MANAGE_POLLS: "channel:manage:polls",
	MANAGE_PREDICTIONS: "channel:manage:predictions",
	SET_ROOM_SETTINGS: "moderator:manage:chat_settings",
	MODERATION_EVENTS: "channel:moderate",
	READ_MODS_AND_BANNED: "moderation:read",
	EDIT_MODS: "channel:manage:moderators",
	EDIT_VIPS: "channel:manage:vips",
	START_RAID: "channel:manage:raids",
	SET_STREAM_INFOS: "channel:manage:broadcast",
	READ_HYPE_TRAIN: "channel:read:hype_train",
	START_COMMERCIAL: "channel:edit:commercial",
	CHECK_SUBSCRIBER_STATE: "user:read:subscriptions",
	LIST_SUBSCRIBERS: "channel:read:subscriptions",
	READ_CHEER: "bits:read",
	LIST_FOLLOWINGS: "user:read:follows",
	LIST_FOLLOWERS: "moderator:read:followers",
	LIST_BLOCKED: "user:read:blocked_users",
	EDIT_BLOCKED: "user:manage:blocked_users",
	EDIT_BANNED: "moderator:manage:banned_users",
	AUTOMOD: "moderator:manage:automod",
	SHIELD_MODE: "moderator:manage:shield_mode",
	CLIPS: "clips:edit"
} as const;
export type TwitchScopesString = typeof TwitchScopes[keyof typeof TwitchScopes];

export const TwitchScope2Icon:Partial<{[key in TwitchScopesString]:string}> = {};
TwitchScope2Icon[TwitchScopes.CHAT_READ]				= "whispers";
TwitchScope2Icon[TwitchScopes.CHAT_WRITE]				= "whispers";
TwitchScope2Icon[TwitchScopes.WHISPER_READ]				= "whispers";
TwitchScope2Icon[TwitchScopes.WHISPER_WRITE]			= "whispers";
TwitchScope2Icon[TwitchScopes.SHOUTOUT]					= "shoutout";
TwitchScope2Icon[TwitchScopes.SEND_ANNOUNCE]			= "announcement";
TwitchScope2Icon[TwitchScopes.DELETE_MESSAGES]			= "trash";
TwitchScope2Icon[TwitchScopes.LIST_CHATTERS]			= "user";
TwitchScope2Icon[TwitchScopes.LIST_REWARDS]				= "channelPoints";
TwitchScope2Icon[TwitchScopes.MANAGE_POLLS]				= "poll";
TwitchScope2Icon[TwitchScopes.MANAGE_PREDICTIONS]		= "prediction";
TwitchScope2Icon[TwitchScopes.SET_ROOM_SETTINGS]		= "lock";
TwitchScope2Icon[TwitchScopes.MODERATION_EVENTS]		= "mod";
TwitchScope2Icon[TwitchScopes.EDIT_MODS]				= "mod";
TwitchScope2Icon[TwitchScopes.EDIT_VIPS]				= "vip";
TwitchScope2Icon[TwitchScopes.START_RAID]				= "raid";
TwitchScope2Icon[TwitchScopes.SET_STREAM_INFOS]			= "info";
TwitchScope2Icon[TwitchScopes.READ_HYPE_TRAIN]			= "train";
TwitchScope2Icon[TwitchScopes.START_COMMERCIAL]			= "coin";
TwitchScope2Icon[TwitchScopes.CHECK_SUBSCRIBER_STATE]	= "sub";
TwitchScope2Icon[TwitchScopes.LIST_SUBSCRIBERS]			= "sub";
TwitchScope2Icon[TwitchScopes.READ_CHEER]				= "bits";
TwitchScope2Icon[TwitchScopes.LIST_FOLLOWINGS]			= "user";
TwitchScope2Icon[TwitchScopes.LIST_FOLLOWERS]			= "user";
TwitchScope2Icon[TwitchScopes.LIST_BLOCKED]				= "block";
TwitchScope2Icon[TwitchScopes.EDIT_BLOCKED]				= "block";
TwitchScope2Icon[TwitchScopes.EDIT_BANNED]				= "ban";
TwitchScope2Icon[TwitchScopes.READ_MODS_AND_BANNED]		= "ban";
TwitchScope2Icon[TwitchScopes.AUTOMOD]					= "automod";
TwitchScope2Icon[TwitchScopes.SHIELD_MODE]				= "shield";
TwitchScope2Icon[TwitchScopes.CLIPS]					= "clip";