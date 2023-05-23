<template>
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
    <p> 購物車是空的?? </p>  
    <p> 趕緊手刀買起來!! </p> 
    <div class="button" @click="showPage='main'"> 現在就去逛! </div>
  </div>
  <div class="footer">
    POWERED AND SECURED BY UNIQ Micronet
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

  let { user_account, showPage } = storeToRefs(useCommon())
  let { getUserInfo } = useInfo()
  let { cartLength, successUsedDiscountCode, stepPage } = storeToRefs(useCart())
  let { getTotal } = useCart()

  // watch ==================================================
  watch(stepPage, (newV, oldV) => {
    getTotal(newV - 1)
    if(newV == 2 && user_account.value) getUserInfo()
  })

  watch(successUsedDiscountCode, () => {
    if(stepPage.value > 0) getTotal(stepPage.value - 1)
  })
</script>