<template>
  <!-- 前往付款頁面 -->
  <div class="confirm" v-if="isConfirmToPay">
    <div class="frame">
      <div class="border"></div>
      <div class="confirm_title"> 
        <i class="fa fa-check-circle" aria-hidden="true"></i>  
        <div class="text"> 已收到您的訂單！ </div>
      </div>
      <div class="message"> 
        <template v-if="pay_method != 'PayOnDelivery' && pay_method != 'MartPayOnDelivery'">
          前往付款頁面
        </template>
      </div>
      <div class="buttonGroup">
        <div class="button determine" @click="isConfirmToPay = false; toPay()"> 確定 </div>
      </div>
    </div>
  </div>

  <!-- 已使用過折扣碼 -->
  <div class="confirm" v-if="isConfirmDiscountCodeUsed">
    <div class="frame">
      <div class="border"></div>
      <div class="confirm_title"> 
        <i class="fa fa-question-circle" aria-hidden="true"></i>
      </div>
      <div class="message"> 您已使用過此折扣碼！請按取消後重新輸入 <span v-if="!user_account"> 手機或 </span> 折扣碼，或按確定放棄優惠直接完成訂單 </div>
      <div class="buttonGroup">
        <div class="button cancel" @click="isConfirmDiscountCodeUsed = false;"> 取消 </div>
        <div class="button determine" @click="cancelDiscountCodeCreateOrder()"> 確定  </div>
      </div>
    </div>
  </div>

  <!-- ATM 匯款訊息 -->
  <div class="confirm" v-if="isConfirmATM">
    <div class="frame">
      <div class="border"></div>

      <div class="confirm_title"> 
        <i class="fa fa-check-circle" aria-hidden="true"></i>  
      </div>
      <div class="message bank"> 
        <div class="bank_name">
          <label> 匯款銀行 : </label> 
          {{store.SelfAtmBankId}} {{bank[store.SelfAtmBankId]}}
        </div>
        <div class="bank_account">
          <label> 匯款帳號 : </label> 
          <input type="text" class="copy_input" readonly v-model="store.SelfAtmId">
          <div class="copy" @click="copy(store.SelfAtmId, '.copy_input')"> <i class="fas fa-copy"></i> </div>
        </div>
      </div>
      <div class="notice">
        <i class="fas fa-exclamation-circle"></i>
        請記得在匯款成功後前往 <div class="a" @click="urlPush(`${getPathname('order')}?phone=${info.purchaser_number.value}&email=${info.purchaser_email.value}`, true)"> 訂單列表 </div>
        輸入匯款帳戶末6碼，我們確認後將儘快為您安排出貨！
      </div>

      <div class="buttonGroup">
        <div class="button determine" @click="isConfirmATM = false"> 確定 </div>
      </div>
    </div>
  </div>

  <!-- 詢問是否註冊會員 -->
  <div class="confirm" v-if="isConfirmIsRegister">
    <div class="frame">
      <div class="border"></div>
      <div class="confirm_title"> 
        <i class="fa fa-check-circle" aria-hidden="true"></i>  
      </div>
      <div class="message"> 
        是否可以耽擱您一點時間來加入我們會員？
      </div>
      <div class="buttonGroup">
        <div class="button cancel" @click="isConfirmIsRegister = false; toPay()"> 
          否
          <template v-if="pay_method != 'PayOnDelivery' && pay_method != 'MartPayOnDelivery'">
            ，前往付款頁面
          </template>
        </div>
        <div class="button determine" @click="isConfirmIsRegister = false; isConfirmRegister = true"> 是，請填寫註冊資料 </div>
      </div>
    </div>
  </div>

  <!-- 註冊會員 -->
  <Register v-if="isConfirmRegister" />

  <div class="ECPay_form_container" v-html="ECPay_form_value"></div>
  <div class="ECPay_form_container" v-html="ECPay_store_form_value"></div>
</template>

<script setup>
  // component ==================================================
  import Register  from '@/components/register/Register.vue'

  // store ==================================================
  import { useCommon }  from '@/stores/common/common'
  import { useCart }  from '@/stores/cart'
  import { useInfo }  from '@/stores/info'
  import { useHandlerCart }  from '@/stores/handlerCart'

  let { user_account, store } = storeToRefs(useCommon())
  let { copy, urlPush, getPathname } = useCommon()
  let { bank, ECPay_form_value, ECPay_store_form_value } = storeToRefs(useCart())
  let { info, pay_method } = storeToRefs(useInfo())
  let { isConfirmToPay, isConfirmDiscountCodeUsed, isConfirmATM, isConfirmIsRegister, isConfirmRegister } = storeToRefs(useHandlerCart())
  let { cancelDiscountCodeCreateOrder, toPay } = useHandlerCart()
</script>
