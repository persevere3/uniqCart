<template>
  <div class="stepOne">
    <div class="table">
      <div class="thead">
        <div class="th picName">商品</div>
        <div class="th spec">規格</div>
        <div class="th price">單價</div>
        <div class="th qty">數量</div>
        <div class="th subtotal">小計</div>
        <div class="th delete"></div>
      </div>
      <div class="tbody">
        <template>
          {{ cart }}
          <div v-for="item in cart">
            <!-- 有規格 -->
            <template v-if="item.specArr">
              <template v-for="spec in item.specArr " :key="spec.ID">
                <CartStepOneTr :main="item" :spec="spec" />
              </template>
            </template>
            <!-- 沒有規格 -->
            <template v-else>
              <CartStepOneTr :main="item" />
            </template>

            <!-- 加價購 -->
            <template>
              <div v-for="item2 in item.addPrice">
                <!-- 有規格 -->
                <template v-if="item2.specArr">
                  <template v-for="spec2 in item2.specArr" :key="spec2.ID">
                    <CartStepOneTr v-if="spec2.buyQty > 0" :main="item" :addPrice="item2" :spec="spec2" :cartSpecCheckedId="cartSpecCheckedId" />
                  </template>
                </template>
                <!-- 沒有規格 -->
                <template v-else>
                  <CartStepOneTr v-if="item2.buyQty > 0" :main="item" :addPrice="item2" :cartSpecCheckedId="cartSpecCheckedId" />
                </template>
              </div>
            </template>
          </div>
        </template>
      </div>
    </div>

    <div class="discount" v-if="store">
         
      <h5 v-show="store.Discount == 1" class="notice" >消費滿{{store.Price}}元 ，折扣{{store.Ratio}}元 。</h5>
      <h5 v-show="store.Discount == 2" class="notice" >消費滿{{store.Price}}元 ，打{{(100 - store.Ratio) % 10 === 0 ? (100 - store.Ratio)/10 : 100 - store.Ratio }}折 。</h5>
      <p>如果要使用折扣碼，請在此填入</p>
      <div class="discountBox">
        <input type="text" v-model.trim="discountCode" @keyup.enter="discount">
        <div class="button" @click="discount">使用折扣碼</div>
        <div class="button" @click="unDiscount">取消折扣碼</div>
      </div>
      <div class="discountError" v-if="discountErrorMessage">{{ discountErrorMessage }}</div>
    </div>

    <CartStepTotal />

    <div class="next" @click="stepPage = 2">下一步</div>
  </div>
</template>

<script setup>
  // component ==================================================
  import CartStepOneTr from '@/components/cart/CartStepOneTr.vue'
  import CartStepTotal from '@/components/cart/CartStepTotal.vue'

  // store ==================================================
  import { useCommon }  from '@/stores/common/common'
  import { useCart }  from '@/stores/cart'

  let { store } = storeToRefs(useCommon())
  let { cart, discountCode, discountErrorMessage, stepPage } = storeToRefs(useCart())
  let { discount, unDiscount } = useCart()

  // state ==================================================
  const state = reactive({
    cartSpecCheckedId: -1,
  })
  let { cartSpecCheckedId } = toRefs(state)
</script>
