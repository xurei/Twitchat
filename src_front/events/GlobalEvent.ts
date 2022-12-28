import { Event } from './EventDispatcher';

/**
* Created : 31/10/2022 
*/
export default class GlobalEvent extends Event {

	public static ADD_MESSAGE = "ADD_MESSAGE";
	public static DELETE_MESSAGE = "DELETE_MESSAGE";
	public static TRACK_USER = "TRACK_USER";
	public static UNTRACK_USER = "UNTRACK_USER";
	public static PIN_MESSAGE = "PIN_MESSAGE";
	public static UNPIN_MESSAGE = "UNPIN_MESSAGE";
	
	constructor(eventType:string, public data?:any) {
		super(eventType);
	}
	
	/********************
	* GETTER / SETTERS *
	********************/
	
	
	
	/******************
	* PUBLIC METHODS *
	******************/
	
	
	
	/*******************
	* PRIVATE METHODS *
	*******************/
}