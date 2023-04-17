<template>
  <div class="total">
    <ul>
      <li>
        <div class="before">商品金額</div>
        <div class="after">NT$ {{numberThousands(total.Total)}}</div>
      </li>
      <li>
        <div class="before">- 折扣</div>
        <div class="after">NT$ {{numberThousands(total.Discount)}}</div>
      </li>
      <li>
        <div class="before">- 折扣碼優惠</div>
        <div class="after">NT$ {{numberThousands(total.DiscountCode)}}</div>
      </li>
      <li>
        <div class="before">小計</div>
        <div class="after" v-if=" subtotal >= 0"> NT$ {{numberThousands(subtotal)}} </div>
        <div class="after" v-else> NT$ 0 </div>
      </li>
      <hr>
      <li v-if="user_account && is_use_bonus && use_bonus > 0">
        <div class="before">- 購物金</div>
        <div class="after">NT$ {{numberThousands(use_bonus)}}</div>
      </li>
      <li v-if="stepPage === 2">
        <div class="before">+ 運費</div>
        <div class="after">NT$ {{numberThousands(total.Shipping)}}</div>
      </li>
      <li>
        <div class="before"> 金額總計 </div>
        <div class="after">NT$ {{numberThousands(total.Sum)}}</div>
      </li>
      <template v-if="stepPage === 2 && user_account">
        <hr>
        <li> 訂單完成後獲得 NT${{ numberThousands(member_bonus) }} 購物金 </li>
        <li> (購物金將在出貨日滿14天後獲得) </li>
      </template>
    </ul>
  </div>
</template>

<script setup>
  // store ==================================================
  import { useAll }  from '@/stores/all'
  import { useCart }  from '@/stores/cart'
  import { useFilters }  from '@/stores/filters'

  let { user_account } = storeToRefs(useAll())
  let { stepPage, total, is_use_bonus, use_bonus, member_bonus } = storeToRefs(useCart())
  let { numberThousands } = useFilters()

  // computed ==================================================
  let subtotal = computed(() => {
    return parseInt(total.value.Total) - parseInt(total.value.Discount) - parseInt(total.value.DiscountCode)
  })
</script>
