<template>
  <!-- 前往付款頁面 -->
  <div class="confirm" v-if="isConfirmToPay">
    <div class="frame">
      <div class="border"></div>
      <div class="confirm_title"> 
        <i class="fa fa-check-circle" aria-hidden="true"></i>  
        <div class="text"> 訂單完成！ </div>
      </div>
      <div class="message"> 
        <template v-if="pay_method != 'PayOnDelivery'">
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
      <div class="message" v-if="!user_account"> 該手機已使用過此折扣碼，按確定取消折扣碼優惠直接完成訂單，按取消重新輸入手機或折扣碼 </div>
      <div class="message" v-else> 該會員已使用過此折扣碼，按確定取消折扣碼優惠直接完成訂單，按取消重新輸入折扣碼 </div>
      <div class="buttonGroup">
        <div class="button cancel" @click=" isConfirmDiscountCodeUsed = false;"> 取消 </div>
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
        <div class="text"> 訂單完成！ </div>
      </div>
      <div class="message bank"> 
        <div style="display: flex; flex-wrap: wrap;">
          <div style="margin-right: 5px; margin-bottom: 10px;"> 匯款銀行 : </div>
          <div style="margin-bottom: 10px;"> {{store.SelfAtmBankId}} {{bank[store.SelfAtmBankId]}}  </div>
        </div>
        <div class="bank_account">
          <div class="bank_title"> 匯款帳號 : </div>
          <input type="text" class="copy_input" readonly v-model="store.SelfAtmId">
          <div class="copy" @click="copy(store.SelfAtmId, '.copy_input')"> <i class="fas fa-copy"></i> </div>
        </div>
      </div>
      <div class="tip">
        <i class="fas fa-exclamation-circle"></i>
        請在匯款成功後前往 <div class="a" @click="urlPush(`/order.html?phone=${info.purchaser_number.value}&mail=${info.purchaser_email.value}`, true)"> 訂單列表 </div>
        輸入匯款帳戶末6碼工作人員確認後將儘快為您安排出貨。
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
        <div class="text"> 訂單完成！ </div>
      </div>
      <div class="message"> 
        請問是否要註冊成為會員
      </div>
      <div class="buttonGroup">
        <div class="button cancel" @click="isConfirmIsRegister = false; toPay()"> 
          否
          <template v-if="pay_method != 'PayOnDelivery'">
            ，前往付款頁面 
          </template>
        </div>
        <div class="button determine" @click="isConfirmIsRegister = false; isConfirmRegister = true"> 是，填寫註冊資料 </div>
      </div>
    </div>
  </div>

  <!-- 註冊會員 -->
  <Register v-if="isConfirmRegister" />
</template>

<script setup>
  // component ==================================================
  import Register  from '@/components/register/Register.vue'

  // store ==================================================
  import { useCommon }  from '@/stores/common/common'
  import { useCart }  from '@/stores/cart'
  import { useInfo }  from '@/stores/info'
  import { useHandlerCart }  from '@/stores/handlerCart'

  let { user_account, store, isConfirmToPay, isConfirmDiscountCodeUsed, isConfirmATM, isConfirmIsRegister, isConfirmRegister } = storeToRefs(useCommon())
  let { copy, urlPush } = useCommon()
  let { bank } = storeToRefs(useCart())
  let { info, pay_method } = storeToRefs(useInfo())
  let { cancelDiscountCodeCreateOrder, toPay } = useHandlerCart()
</script>
