<template>
  <div class="cart">
    <div class="background" ref="cartModal">
      <div class="close">
        <i class="fa fa-times" aria-hidden="true" @click="showPage = 'main'; stepPage = 1"></i>
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
      <div class="noItem" v-show="cartLength === 0">
        <p>購物車沒有內容</p>  
        <div class="button" @click="showPage='main'">back</div>
      </div>
      <div class="footer">
        <div class="top"></div>
        <div class="bottom">POWERED AND SECURED BY HONG BO</div>
      </div>

      <div class="ECPay_form_container" v-html="ECPay_form"></div>
    </div>

    <!-- 該mail已使用過折扣碼 confirm -->
    <div class="confirm" v-if="isConfirmDiscountCodeUsed">
      <div class="frame">
        <div class="border"></div>
        <div class="confirm_title"> 
          <i class="fa fa-question-circle" aria-hidden="true"></i>
        </div>
        <div class="message" v-if="!user_account"> 該手機已使用過此折扣碼，按確定取消折扣碼優惠直接完成訂單，按取消重新輸入手機或折扣碼 </div>
        <div class="message" v-else> 該會員已使用過此折扣碼，按確定取消折扣碼優惠直接完成訂單，按取消重新輸入折扣碼 </div>
        <div class="buttonGroup">
          <div class="button cancel" @click=" isConfirmDiscountCodeUsed = false;"> 取消 </div>
          <div class="button determine" @click="cancelDiscountCodeCreateOrder()"> 確定  </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  // component ==================================================
  import cartStepOne from '@/components/CartStepOne.vue'
  import cartStepTwo from '@/components/CartStepTwo.vue'

  // store ==================================================
  const commonStore = {...storeToRefs(useCommonStore())}
  const cartStore = {...storeToRefs(useCartStore())}

  // state ==================================================
  const state = reactive({
    
  })

  // ref 
  const cartModal = ref(null)

  // watch ==================================================
  watch(() => cartStore.stepPage, (newV, oldV) => {
    cartModal.value.scrollTop = 0;
    if(commonStore.showPage == 'cart') cartStore.getTotal(newV - 1)
    if(newV == 2) getUserInfoHandler()
  })
  
  // methods ==================================================
  const methods = reactive({
    
  })
</script>