<template>
	<div class="placementselector">
		<div class="item" :class="placement=='tl'? 'selected' : ''" :disabled="sidesOnly !== false? 'true' : 'false'">
			<input type="radio" v-model="placement" value="tl" id="mazePos_tl">
			<label for="mazePos_tl">┌</label>
		</div>
		<div class="item" :class="placement=='t'? 'selected' : ''">
			<input type="radio" v-model="placement" value="t" id="mazePos_t">
			<label for="mazePos_t">┬</label>
		</div>
		<div class="item" :class="placement=='tr'? 'selected' : ''" :disabled="sidesOnly !== false? 'true' : 'false'">
			<input type="radio" v-model="placement" value="tr" id="mazePos_tr">
			<label for="mazePos_tr">┐</label>
		</div>
		<div class="item" :class="placement=='l'? 'selected' : ''">
			<input type="radio" v-model="placement" value="l" id="mazePos_l">
			<label for="mazePos_l">├</label>
		</div>
		<div class="item" :class="placement=='m'? 'selected' : ''" :disabled="sidesOnly !== false">
			<input type="radio" v-model="placement" value="m" id="mazePos_m">
			<label for="mazePos_m">┼</label>
		</div>
		<div class="item" :class="placement=='r'? 'selected' : ''">
			<input type="radio" v-model="placement" value="r" id="mazePos_r">
			<label for="mazePos_r">┤</label>
		</div>
		<div class="item" :class="placement=='bl'? 'selected' : ''" :disabled="sidesOnly !== false? 'true' : 'false'">
			<input type="radio" v-model="placement" value="bl" id="mazePos_bl">
			<label for="mazePos_bl">└</label>
		</div>
		<div class="item" :class="placement=='b'? 'selected' : ''">
			<input type="radio" v-model="placement" value="b" id="mazePos_b">
			<label for="mazePos_b">┴</label>
		</div>
		<div class="item" :class="placement=='br'? 'selected' : ''" :disabled="sidesOnly !== false? 'true' : 'false'">
			<input type="radio" v-model="placement" value="br" id="mazePos_br">
			<label for="mazePos_br">┘</label>
		</div>
	</div>
</template>

<script lang="ts">
import type { TwitchatDataTypes } from '@/types/TwitchatDataTypes';
import { watch } from 'vue';
import {toNative,  Component, Prop, Vue } from 'vue-facing-decorator';

@Component({
	components:{},
	emits:["update:modelValue", "change"],
})
class PlacementSelector extends Vue {

	@Prop
	public modelValue!:TwitchatDataTypes.ScreenPosition;

	@Prop({default:false, type:Boolean})
	public sidesOnly!:boolean;
	
	public placement:TwitchatDataTypes.ScreenPosition = "bl";

	public beforeMount():void {
		this.placement = this.modelValue;
		
		watch(() => this.placement, ()=> {
			this.$emit("update:modelValue", this.placement);
			this.$emit("change", this.placement);
		})

		watch(() => this.sidesOnly, ()=> {
			if(this.sidesOnly !== false) {
				const list:TwitchatDataTypes.ScreenPosition[] = ["tl", "bl", "br","tr","m"];
				if(list.includes(this.modelValue)) {
					this.placement = "t";
				}
			}
		})
	}

}
export default toNative(PlacementSelector);
</script>

<style scoped lang="less">
.placementselector{
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: center;
	@btSize: 25px;
	width: @btSize * 3;
	margin-top: .5em;
	.item {
		width: @btSize;
		height: @btSize;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 5px;
		background-color: rgba(255, 255, 255, .5);
		border: 1px solid rgba(0, 0, 0, .25);
		transition: background-color .2s;
		color: var(--color-text);
		background-color: var(--background-color-fader);
		&.selected {
			background-color: var(--color-light);
			color: var(--color-dark);
		}
		&:hover {
			background-color: var(--color-light-fade);
		}
		label {
			margin: 0;
			padding: 0;
		}
		input {
			margin: 0;
			padding: 0;
			opacity: 0;
			position: absolute;
			top:0;
			left:0;
			width: 100%;
			height: 100%;
			cursor: pointer;
		}
		&[disabled='true'] {
			pointer-events: none;
			opacity: .5;
			background-color: transparent;
			border: none;
			color: var(--color-text);
			// border: 1px solid rgba(255, 255, 255, .5);
		}
	}
}
</style>