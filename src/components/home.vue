<template>
  <div class="productContainer" @click.stop="isShowFavorite = false">
    <Main v-if="showPage === 'main'" />
    <SelectProduct v-if="selectProduct.ID" :style="`height:${innerHeight}px`" />
    <Cart v-if="showPage === 'cart'" :style="`height:${innerHeight}px`" />
    <!-- 訂購須知 配送須知 隱私權聲明 -->
    <Notice v-if="showPage === 'Content' || showPage === 'Description' || showPage === 'PrivacyPolicy'" :style="`height:${innerHeight}px`"/>
    
    <CartIcon v-if="showPage === 'main' && !selectProduct.ID" />
    <FavoriteIcon />

    <Confirm />
    <Message />
  </div>
</template>

<script setup>
  import Main from '@/components/Main.vue'
  import SelectProduct from '@/components/SelectProduct.vue'
  import Cart from '@/components/cart/Cart.vue'
  import Notice from '@/components/Notice.vue'
  import CartIcon from '@/components/CartIcon.vue'
  import FavoriteIcon from '@/components/FavoriteIcon.vue'
  import Confirm from '@/components/Confirm.vue'
  import Message from '@/components/Message.vue'

  // store ==================================================
  import { useCommon }  from '@/stores/common/common'
  import { useProducts }  from '@/stores/products'
  import { useCart }  from '@/stores/cart'
  import { useInfo }  from '@/stores/info'
  import { useHandlerInit }  from '@/stores/handlerInit'
import { getTransitionRawChildren } from 'vue'

  let { user_account, isShowFavorite, showPage } = storeToRefs(useCommon())
  let { selectProduct } = storeToRefs(useProducts())
  let { stepPage, total_bonus } = storeToRefs(useCart())
  let { getTotal } = useCart()
  let { info, userInfo } = storeToRefs(useInfo())
  let { getSiteHandler } = useHandlerInit()

  // state ==================================================
  const state = reactive({
    innerHeight: 0,
  })
  let { innerHeight } = toRefs(state)

  // onMounted ==================================================
  onMounted(() => {
    getSiteHandler();

    state.innerHeight = window.innerHeight;
    window.onresize = () => {
      state.innerHeight = window.innerHeight;
    }
  })

  // watched ==================================================
  watch(showPage, (newV, oldV) => {
    console.log('watch: showPage', newV, oldV)
    if(newV == 'cart') {
      stepPage.value = 1
      getTotal(1)
    }
  })

  watch(user_account, (newV, oldV) => {
    console.log('watch: user_account', newV, oldV)
    localStorage.setItem('user_account', newV);

    if(!newV) {
      info.value.purchaser_email.value = '';
      info.value.purchaser_name.value = '';
      info.value.purchaser_number.value = '';
      info.value.receiver_name.value = '';
      info.value.receiver_number.value = '';

      userInfo.value = {};
    }
  })

  watch(userInfo, (newV, oldV) => {
    console.log('watch: userInfo', newV, oldV)
    if(!newV.Phone && !newV.Email) {
      user_account.value = '';
    }
    total_bonus.value = newV.Wallet * 1
  }, {deep: true})
</script>

<style lang="scss">
  @import "../styles/css/quill.css";
  @import "../styles/scss/index.scss";
</style>
