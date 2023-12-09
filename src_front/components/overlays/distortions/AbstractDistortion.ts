import type { TwitchatDataTypes } from '@/types/TwitchatDataTypes';
import Utils from '@/utils/Utils';
import * as THREE from 'three';
import { ComponentBase, Prop, Vue } from 'vue-facing-decorator';

/**
 * Following vars are declared here instead as class props
 * because of a vue VS threejs incompatibility.
 * @see https://stackoverflow.com/questions/65693108/threejs-component-working-in-vuejs-2-but-not-3#comment116149963_65693108
 */
let scene!:THREE.Scene;
let camera!:THREE.OrthographicCamera;
let renderer!:THREE.WebGLRenderer;
let instancedDistortMesh!:THREE.InstancedMesh;
let instancedOverlayMesh!:THREE.InstancedMesh;
let uvOffsetAttribute!:THREE.InstancedBufferAttribute;

@ComponentBase({
    name: "AbstractDistortion",
})
export default class AbstractDistortion extends Vue {

	@Prop()
	public params!:TwitchatDataTypes.HeatDistortionData;
	
	private maxInstances = 1000;
	private items:IDistortItem[] = [];
	private uvOffsets:number[] = [];
	private shCols = 8;
	private shRows = 8;
	private uvScaleX = 1;
	private uvScaleY = 1;
	private frames = 128;
	private offscreenMatrix:THREE.Matrix4 = new THREE.Matrix4();
	private id:number = 0;

	private clickHandler!:(e:MouseEvent) => void;
	
	private heatEventHandler!:(event:{detail:TwitchatDataTypes.HeatClickData}) => void;

	public mounted():void {
		this.clickHandler = (e:MouseEvent) => this.onClick(e);
		this.heatEventHandler = (e) => this.onHeatClick(e);
		
		//@ts-ignore
		window.addEventListener("heat-click", this.heatEventHandler);
		document.body.addEventListener("click", this.clickHandler);
	}

	public beforeUnmount():void {
		//@ts-ignore
		window.removeEventListener("heat-click", this.heatEventHandler);
		document.body.removeEventListener("click", this.clickHandler);

		scene.clear();
		camera.clear();
		instancedDistortMesh.clear();
		instancedOverlayMesh.clear();
		renderer.dispose();
	}

	private onClick(e:MouseEvent):void {
		const vec3 = this.screenToWorld(e.clientX, e.clientY);
		this.addItem(this.buildItem(vec3.x, vec3.y));
	}
	
	protected async onHeatClick(event:{detail:TwitchatDataTypes.HeatClickData}):Promise<void> {
		if(this.params.enabled == false) return;
		if(event.detail.twitchatOverlayID != this.params.id) return;

		const data = event.detail;
		const infos:TwitchatDataTypes.UserChannelInfo = {
			badges: [],
			following_date_ms:data.followDate,
			online:false,
			is_new:false,
			is_gifter:false,
			is_raider:false,
			is_banned:data.isBan,
			is_broadcaster:data.isBroadcaster,
			is_following:data.isFollower,
			is_moderator:data.isMod,
			is_subscriber:data.isSub,
			is_vip:data.isVip,
		};
		const channelInfo:{[key:string]:TwitchatDataTypes.UserChannelInfo} = {};
		channelInfo[data.channelId] = infos;
		const user:Pick<TwitchatDataTypes.TwitchatUser, "id" | "login" | "channelInfo"> = {
			id:event.detail.uid,
			login:event.detail.login,
			channelInfo
		}
		
		//Stop there if user isn't allowed
		if(!event.detail.testMode && !await Utils.checkPermissions(this.params.permissions, user, data.channelId)) return;

		const vec3 = this.screenToWorld(event.detail.x * window.innerWidth/2, event.detail.y * window.innerHeight);
		this.addItem(this.buildItem(vec3.x, vec3.y));
	}

	protected initialize(spritesheet:{cols:number, rows:number, uvScaleX:number, uvScaleY:number, frames:number, texture:string, overlay:string}):void{
		this.shCols = spritesheet.cols;
		this.shRows = spritesheet.rows;
		this.frames = spritesheet.frames;
		this.uvScaleX = spritesheet.uvScaleX;
		this.uvScaleY = spritesheet.uvScaleY;

		// Create a scene
		scene = new THREE.Scene();

		// Create a camera
		const aspectRatio = window.innerWidth / window.innerHeight;
		const frustumSize = 10;
		camera = new THREE.OrthographicCamera(
			frustumSize * aspectRatio / -2, 
			frustumSize * aspectRatio / 2, 
			frustumSize / 2, 
			frustumSize / -2, 
			1, 
			100
		);
		camera.position.z = 10;

		const canvas = document.createElement("canvas");
		canvas.style.position = "fixed";
		canvas.style.top = "0px";
		canvas.style.left = "0px";
		document.body.appendChild(canvas);

		// Create a renderer
		renderer = new THREE.WebGLRenderer({canvas});
		renderer.setClearColor(new THREE.Color(0x808000), 0);
		// renderer.setClearColor(new THREE.Color(0x808000), 1);
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);

		const backgroundGeometry = new THREE.PlaneGeometry(frustumSize * aspectRatio / 2, frustumSize);
		const backgroundMaterial = new THREE.MeshBasicMaterial({ color: 0x808000 });
		const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
		background.position.x = -frustumSize * aspectRatio / 4;
		scene.add(background);
		
		// Load the texture
		const textureLoader = new THREE.TextureLoader();
		const textureDistort = textureLoader.load( spritesheet.texture );
		const textureLoader2 = new THREE.TextureLoader();
		const textureOverlay = textureLoader2.load( spritesheet.overlay );
		// const texture = textureLoader.load('hearts_sh.png');
		// const texture = textureLoader.load('test.png');

		// Create a geometry (for example, a cube)
		const geometry = new THREE.PlaneGeometry(.5, .5);

		// Create material
		const materialDistort = new THREE.ShaderMaterial({
			transparent: true,
			// blending: THREE.AdditiveBlending,
			uniforms: {
				texture1: { value: textureDistort },
			},
			vertexShader: `
				precision highp float;
				attribute vec2 uvOffset;
				varying vec2 vUv;

				void main() {
					vUv = uv * vec2(${this.uvScaleX}, ${this.uvScaleY}) + uvOffset;
					vec4 worldPosition = instanceMatrix * vec4(position, 1.0);
					gl_Position = projectionMatrix * modelViewMatrix * worldPosition;
				}
			`,
			fragmentShader: `
				uniform sampler2D texture1;
				varying vec2 vUv;

				void main() {
					gl_FragColor = texture2D(texture1, vUv);
				}
			`
		});
		const materialOverlay = materialDistort.clone();
		materialOverlay.uniforms.texture1.value = textureOverlay;

		// Create an InstancedMesh for distortions
		instancedDistortMesh = new THREE.InstancedMesh(geometry, materialDistort, this.maxInstances);
		instancedDistortMesh.count = 0;

		// Create an InstancedMesh for overlays
		instancedOverlayMesh = new THREE.InstancedMesh(geometry, materialOverlay, this.maxInstances);
		instancedOverlayMesh.count = 0;

		for (let i = 0; i < this.maxInstances; i++) {
			this.uvOffsets.push(1 - this.uvScaleX, 1-this.uvScaleY);
		}

		uvOffsetAttribute = new THREE.InstancedBufferAttribute(new Float32Array(this.uvOffsets), 2);
		instancedDistortMesh.geometry.setAttribute('uvOffset', uvOffsetAttribute);
		scene.add(instancedDistortMesh);

		instancedOverlayMesh.geometry.setAttribute('uvOffset', uvOffsetAttribute);
		scene.add(instancedOverlayMesh);
		

		const pos = this.screenToWorld(window.innerWidth*10, window.innerHeight*10);
		this.offscreenMatrix.setPosition(pos.x, pos.y, 0);

		// Set random positions, scales, and rotations for instances
		// for (let i = 0; i < 10; i++) {
			// addItem();
		// }
		// this.addItem(this.buildItem());
		this.renderFrame();
	}

	public renderFrame():void {

		var rotationMatrix = new THREE.Matrix4();
		requestAnimationFrame(this.renderFrame);

		let offsetUvY = 1 - (this.uvScaleY * this.shRows);
		let screenW = this.screenToWorld(window.innerWidth,0).x;
		
		for (let i = 0; i < this.items.length; i++) {
			const item = this.items[i];
			if(!this.computeItem(item)) {
				this.removeItem(item);
				i--;
				continue;
			}
			// item.angle += Math.PI/200;
			rotationMatrix.makeRotationZ(item.angle);
			
			let frame = Math.max(0, Math.min(this.frames-1, Math.floor(item.frame)));
			if(frame <= 0 && item.alphaSpeed < 0) {
				item.alphaSpeed = -item.alphaSpeed*.5;
			}
			
			const matrix = new THREE.Matrix4();
			instancedDistortMesh.getMatrixAt(i, matrix );
			matrix.makeTranslation(item.x, item.y, 0);
			matrix.multiply(rotationMatrix);
			matrix.scale(new THREE.Vector3(item.scale, item.scale, 1));
			
			const matrix2 = new THREE.Matrix4();
			instancedOverlayMesh.getMatrixAt(i, matrix2 );
			matrix2.makeTranslation(item.x + screenW, item.y, 0);
			matrix2.scale(new THREE.Vector3(item.scale, item.scale, 1));

			instancedDistortMesh.geometry.attributes.uvOffset.setXY(i, (frame%this.shCols)*this.uvScaleX, 1-offsetUvY - this.uvScaleY - Math.floor(frame/this.shCols)*this.uvScaleY);
			// frame = Math.round(frame/2);
			instancedOverlayMesh.geometry.attributes.uvOffset.setXY(i, (frame%this.shCols)*this.uvScaleX, 1-offsetUvY - this.uvScaleY - Math.floor(frame/this.shCols)*this.uvScaleY);

			instancedDistortMesh.setMatrixAt(i, matrix);
			instancedOverlayMesh.setMatrixAt(i, matrix2);
		}
		
		instancedDistortMesh.instanceMatrix.needsUpdate = true;
		instancedDistortMesh.geometry.attributes.uvOffset.needsUpdate = true;
		instancedOverlayMesh.instanceMatrix.needsUpdate = true;
		instancedOverlayMesh.geometry.attributes.uvOffset.needsUpdate = true;

		// Render the scene
		renderer.render(scene, camera);
	}

	protected computeItem(item:IDistortItem):boolean {
		item.scaleSpeed *= .995;
		item.scale += item.scaleSpeed;
		item.frame += item.alphaSpeed;
		return !(item.frame >= this.shCols*this.shRows-1 && item.alphaSpeed > 0);
	}

	protected buildItem(px?:number, py?:number):IDistortItem {
		const vec3 = this.screenToWorld(window.innerWidth, window.innerHeight);
		this.id ++;
		return {
			x:px || Math.random() * vec3.x - vec3.x/2,
			y:py || Math.random() * vec3.y - vec3.y/2,
			scale:0,
			frame:this.frames,
			alphaSpeed:-(Math.random()*.5)-1,
			scaleSpeed:Math.random() * 0.05 + .05,
			// scaleSpeed:Math.random() * 0.05 + .01,
			angle:Math.random() * Math.PI * 2,
			id:this.id,
		};
	}

	protected removeItem(data:IDistortItem):void {
		const index = this.items.findIndex(v=>v.id == data.id);
		
		instancedDistortMesh.setMatrixAt(index, this.offscreenMatrix);
		instancedOverlayMesh.setMatrixAt(index, this.offscreenMatrix);
		instancedDistortMesh.count --;
		instancedOverlayMesh.count --;
		this.items.splice(index, 1);
	}

	protected addItem(data:IDistortItem):number {
		const index = this.items.length;
		instancedDistortMesh.count ++;
		instancedOverlayMesh.count ++;
		instancedDistortMesh.geometry.attributes.uvOffset.setXY(index, 0, 0);
		instancedOverlayMesh.geometry.attributes.uvOffset.setXY(index, 0, 0);
		instancedDistortMesh.setMatrixAt(index, new THREE.Matrix4());
		instancedOverlayMesh.setMatrixAt(index, new THREE.Matrix4());
		this.items.push(data);
		return index;
	}

	protected screenToWorld(px:number, py:number):THREE.Vector3 {
		return new THREE.Vector3(
			(px / window.innerWidth) * 2 - 1,
			-(py / window.innerHeight) * 2 + 1,
			0.5
		).unproject( camera );
	}
}

export interface IDistortItem {
	x:number,
	y:number,
	scale:number,
	frame:number,
	alphaSpeed:number,
	scaleSpeed:number,
	angle:number,
	id:number
}
