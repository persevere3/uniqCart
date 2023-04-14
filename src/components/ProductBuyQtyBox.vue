<template>
  <div>
    <div class="spec" v-if="product.specArr">
      <!-- tabindex="0" => @blur 生效 -->
      <div class="select" @click="product.isShowOption = !product.isShowOption" tabindex="0" @blur="product.isShowOption = false"> 
        <div class="text"> {{productSpec === -1 ? "請選擇規格" : productSpec.Name }} </div>
        <div class="icon" :class="{iconActive:product.isShowOption}"> <i class="fa fa-caret-down" aria-hidden="true"></i> </div>
        <ul class="option" :class="{showOption:product.isShowOption}">                                                                  
          <li v-for="spec in product.specArr" :key="spec.ID" @click.stop="selectSpec(product, spec);">
            {{spec.Name}}
          </li>
        </ul>
      </div>
    </div>
    <div class="noSpec" v-else></div>

    <div class="discontinued" v-if="productSpecStatus === -1"> 停售中 </div>
    <div class="discontinued" v-else-if="productSpecStatus === 0">暫無庫存</div>
    <div class="qtyBox" :class="{noSelect:productSpec === -1 }" v-else>
      <template v-if="productSpec !== -1">
        <template v-if="addPrice">
          <div class="reduce" :class="{qtyDisabled:buyQty < 1}" @click="changeAddpriceBuyQty(main, addPriceIndex, specIndex, buyQty - 1)"><i class="fa fa-minus"></i></div>
          <input class="number" type="text" size="3" maxlength="3"
            :disabled="getMainTotalQty(main) < 1"
            v-model="buyQty"
            @blur="changeAddpriceBuyQty(main, addPriceIndex, specIndex, buyQty)" 
            @keyup.enter="changeAddpriceBuyQty(main, addPriceIndex, specIndex, buyQty)"
          >
          <div class="add" :class="{qtyDisabled: buyQty > getMainTotalQty(main) - 1 || (productSpec.Enable == 1 && buyQty > productSpec.Amount - 1) || buyQty > 998 }" @click="changeAddpriceBuyQty(main, addPriceIndex, specIndex, buyQty * 1 + 1)"><i class="fa fa-plus"></i></div>
        </template>
        <template v-else>
          <div class="reduce" :class="{qtyDisabled:buyQty < 1}" @click="changeMainBuyQty(main, specIndex, buyQty - 1, event ? $event : null)"> <i class="fa fa-minus"></i> </div>
          <input class="number" type="text" size="3" maxlength="3" 
            v-model="buyQty"
            @blur="changeMainBuyQty(main, specIndex, buyQty)" 
            @keyup.enter="changeMainBuyQty(main, specIndex, buyQty)"
          >
          <div class="add" :class="{qtyDisabled:(productSpec.Enable == 1 && buyQty > productSpec.Amount - 1) || buyQty > 998 }" @click="changeMainBuyQty(main, specIndex, buyQty * 1 + 1, event ? $event : null)"><i class="fa fa-plus"></i></div>
        </template>
      </template>
      <template v-else>
        <div class="reduce"><i class="fa fa-minus"></i></div>
        <input type="text" size="3"  maxlength="3" class="number" disabled>
        <div class="add"><i class="fa fa-plus"></i></div>
      </template>
    </div>
  </div>
</template>

<script setup>
  // store ==================================================
  import { useCommon }  from '@/stores/common'
  import { useProducts }  from '@/stores/products'
  import { useHandlerChangeQty }  from '@/stores/handlerChangeQty'

  let { store } = storeToRefs(useCommon())
  let { getMainTotalQty } = useProducts()
  let { changeMainBuyQty, changeAddpriceBuyQty } = useHandlerChangeQty()

  // props ==================================================
  let props = defineProps(['main', 'addPrice', 'event'])

  // computed ==================================================
  const product = computed(() => {
    return props.addPrice ? props.addPrice : props.main
  })

  const productSpec = computed(() => {
    // 沒規格
    if(!product.value.selectSpecItem) {
      return product.value
    }
    // 有規格
    else {
      // 沒選
      if(!product.value.selectSpecItem.ID) {
        return -1
      }
      // 有選
      else {
        return product.value.selectSpecItem
      }
    }
  })

  const addPriceIndex = computed(() => {
    if(props.addPrice) {
      return props.main.addPrice.map(item => item.ID).indexOf(props.addPrice.ID);
    }
    return null
  })

  const specIndex = computed(() => {
    if(product.value.specArr) {
      return product.value.specArr.map(item => item.ID).indexOf(product.value.selectSpecItem.ID);
    }
    return null
  })

  const buyQty = computed({
    get() {
      return productSpec.value['buyQty']
    },
    set(newBuyQty) {
      productSpec.value['buyQty'] = newBuyQty
    }
  })

  const productSpecStatus = computed(() => {
    // 停售中 -1
    if(store.value.Enable == 0) return -1
    // 暫無庫存 0
    if(productSpec.value !== -1 && productSpec.value.Enable == 1 && productSpec.value.Amount == 0) return 0

    return 1
  })
  
  // methods ==================================================
  function selectSpec(item, spec) {
    item.isShowOption = false; 
    item.selectSpecItem = spec;
  }
</script>
