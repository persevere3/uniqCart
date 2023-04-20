<template>
  <div class="cart">
    <div class="background" ref="cartModal">
      <div class="close">
        <i class="fa fa-times" aria-hidden="true" @click="showPage = 'main';"></i>
      </div>
      <div class="step">
        <div class="stepItem" :class="{stepItemActive:stepPage === 1}">
          <div class="icon" >1</div>
          <p>確認購物車</p>
        </div>
        <div class="arrow" :class="{arrowActive:stepPage === 1}"> <i class="fa fa-arrow-right" aria-hidden="true"></i> </div>
        <div class="stepItem" :class="{stepItemActive:stepPage === 2}"> 
          <div class="icon">2</div>
          <p>付款與運送方式</p>
        </div>
        <div class="arrow" :class="{arrowActive:stepPage === 2}"> <i class="fa fa-arrow-right" aria-hidden="true"></i> </div>
        <div class="stepItem" :class="{stepItemActive:stepPage === 3}">
          <div class="icon">3</div>
          <p>完成訂單</p>
        </div>
      </div>
      <cartStepOne v-if="(cartLength !== 0 ) && stepPage === 1" />
      <cartStepTwo v-if="(cartLength !== 0 ) && stepPage === 2" />
      <div class="noItem" v-if="cartLength === 0">
        <p>購物車沒有內容</p>  
        <div class="button" @click="showPage='main';">back</div>
      </div>
      <div class="footer">
        <div class="top"></div>
        <div class="bottom">POWERED AND SECURED BY UNIQ Micronet</div>
      </div>

      <div class="ECPay_form_container" v-html="ECPay_form"></div>
    </div>
  </div>
</template>

<script setup>
  // component ==================================================
  import cartStepOne from '@/components/cart/CartStepOne.vue'
  import cartStepTwo from '@/components/cart/CartStepTwo.vue'

  // store ==================================================
  import { useCommon }  from '@/stores/common/common'
  import { useInfo }  from '@/stores/info'
  import { useCart }  from '@/stores/cart'

  let { showPage } = storeToRefs(useCommon())
  let { getUserInfo } = useInfo()
  let { cartLength, successUsedDiscountCode, stepPage, ECPay_form } = storeToRefs(useCart())
  let { getTotal } = useCart()

  // ref 
  const cartModal = ref(null)

  // watch ==================================================
  watch(stepPage, (newV, oldV) => {
    console.log('watch: stepPage', newV, oldV)
    cartModal.value.scrollTop = 0;
    getTotal(newV - 1)
    if(newV == 2) getUserInfo()
  })

  watch(successUsedDiscountCode, () => {
    if(stepPage.value > 0) getTotal(stepPage.value - 1)
  })
</script>