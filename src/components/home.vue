<template>
  <!-- @click.stop="isShowFavorite = false" ????? -->
  <div class="productContainer">
    <Main />
    <SelectProduct v-if="selectProduct.ID" :style="`height:${innerHeight}px`" />
    <Cart v-if="showPage === 'cart'" :style="`height:${innerHeight}px`" />
    <!-- 訂購須知 配送須知 隱私權聲明 -->
    <Notice v-if="showPage === 'Content' || showPage === 'Description' || showPage === 'PrivacyPolicy'" :style="`height:${innerHeight}px`"/>
    
    <CartIcon />
    <FavoriteIcon />

    <Confirm />
    <Message />
  </div>
</template>

<script setup>
  import Main from '@/components/Main.vue'
  import SelectProduct from '@/components/SelectProduct.vue'
  import Cart from '@/components/cart/Index.vue'
  import Notice from '@/components/Notice.vue'
  import CartIcon from '@/components/CartIcon.vue'
  import FavoriteIcon from '@/components/FavoriteIcon.vue'
  import Confirm from '@/components/Confirm.vue'
  import Message from '@/components/Message.vue'

  // store ==================================================
  import { useCommon }  from '@/stores/common'
  import { useProducts }  from '@/stores/products'
  import { useCart }  from '@/stores/cart'
  import { useInfo }  from '@/stores/info'
  import { useHandlerInit }  from '@/stores/handlerInit'

  let { user_account, showPage, set_user_account } = useCommon()
  let { selectProduct } = useProducts()
  let { stepPage, total_bonus } = useCart()
  let { userInfo } = useInfo()
  let { getSiteHandler } = useHandlerInit()

  // state ==================================================
  const state = reactive({
    innerHeight: 0,
  })
  let { innerHeight } = toRefs(state)

  // onMounted ==================================================
  onMounted(() => {
    getSiteHandler();

    innerHeight = window.innerHeight;
    window.onresize = () => {
      state.innerHeight = window.innerHeight;
    }
  })

  // watched ==================================================
  watch(showPage, (newV, oldV) => {
    if(newV != 'selectProduct') selectProduct = {}
    if(newV == 'cart' && newV != oldV) stepPage = 1
  })

  watch(userInfo, (newV, oldV) => {
    console.log('watch: userInfo', newV, oldV)
    if(!newV.Phone && !newV.Email) {
      user_account = '';
      set_user_account();
    }
    total_bonus = newV.Wallet * 1
  }, {deep: true})
</script>

<style lang="scss">
  @import "../styles/css/quill.css";
  @import "../styles/scss/index.scss";
</style>
