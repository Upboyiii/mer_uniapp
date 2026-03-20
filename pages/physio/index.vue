<template>
	<view class="physio-page" :data-theme="theme">
		<emptyPage title="暂无理疗记录~" mTop="25%" :imgSrc="urlDomain+'crmebimage/presets/noJilu.png'"></emptyPage>
		<view v-if="bottomNavigationIsCustom" class="footerBottom"></view>
		<pageFooter></pageFooter>
	</view>
</template>

<script>
import { mapGetters } from 'vuex';
import pageFooter from '@/components/pageFooter/index.vue';
import emptyPage from '@/components/emptyPage.vue';
export default {
	components: { pageFooter, emptyPage },
	data() {
		return {
			urlDomain: this.$Cache.get("imgHost")
		};
	},
	computed: {
		...mapGetters(['viewColor', 'keyColor', 'bottomNavigationIsCustom']),
		theme() {
			return this.viewColor || '';
		}
	},
	onLoad(options) {},
	methods: {}
};
</script>

<style lang="scss" scoped>
.physio-page {
	min-height: 100vh;
	background: #fff;
}
</style>
