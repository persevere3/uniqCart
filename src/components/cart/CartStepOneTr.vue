<template>
  <div class="tr p-1">
    <div class="td picName jcs">
      <div class="pic" :style="{backgroundImage :`url(${addPrice ? product.Img : product.imgArr[0]})`}">
        <div class="tag" v-if="addPrice">加價購</div>
      </div>
      <div class="name">{{product.Name}}</div>
    </div>
    <div class="td spec">
      <template v-if="spec">
        <!-- rwd -->
        <div class="specButton" @click="cartSpecCheckedId = cartSpecCheckedId == spec.ID ? -1 : spec.ID"> 
          規格 <i :class="{iActive:cartSpecCheckedId == spec.ID}" class="fa fa-caret-down" aria-hidden="true"></i>  
        </div>
        <div class="specText" :class="{specTextShow:cartSpecCheckedId == spec.ID}"> {{spec.Name}} </div>
      </template>
    </div>
    <div class="td price">  NT$ {{numberThousands(product[addPrice ? 'Price' : 'NowPrice'])}} </div>
    <div class="td qty">
      <div class="qtyBox" v-show="store.Enable === '1'">
        <template v-if="!addPrice">
          <div class="reduce" :class="{qtyDisabled:buyQty < 1}" @click="changeMainBuyQty(product, specIndex, buyQty - 1)"><i class="fa fa-minus"></i></div>
          <input type="text" class="number" size="3" maxlength="3" 
            v-model="buyQty"
            @keyup.enter="changeMainBuyQty(product, specIndex, buyQty)"
            @blur="changeMainBuyQty(product, specIndex, buyQty)" 
          >
          <div class="add" :class="{qtyDisabled:(productSpec.Enable == 1 && buyQty > productSpec.Amount - 1) || buyQty > 998 }" @click="changeMainBuyQty(product, specIndex, buyQty * 1 + 1)"><i class="fa fa-plus"></i></div>
        </template>
        <template v-else>
          <div class="reduce" :class="{qtyDisabled:buyQty < 1}" @click="changeAddpriceBuyQty(main, addPriceIndex, specIndex, buyQty - 1)"><i class="fa fa-minus"></i></div>
          <input type="text" class="number" size="3" maxlength="3"
            v-model="buyQty"
            @keyup.enter="changeAddpriceBuyQty(main, addPriceIndex, specIndex, buyQty)"
            @blur="changeAddpriceBuyQty(main, addPriceIndex, specIndex, buyQty)" 
          >
          <div class="add" :class="{qtyDisabled:buyQty > getMainTotalQty(main) - 1 || (productSpec.Enable == 1 && buyQty > productSpec.Amount - 1) || buyQty > 998 }" @click="changeAddpriceBuyQty(main, addPriceIndex, specIndex, buyQty * 1 + 1)"><i class="fa fa-plus"></i></div>
        </template>
      </div>
      <div class="discontinued" v-show="store.Enable === '0'">停售中</div>
    </div>
    <div class="td subtotal"> 
      <div class="priceTitle">小計</div>
      <div class="priceText"> 
        NT$ {{numberThousands(product[addPrice ? 'Price' : 'NowPrice'] * (isNaN(buyQty) ? 0 : buyQty))}} </div> 
    </div>
    <div class="td delete">
      <div class="deleteButton"
        @click="!addPrice ? changeMainBuyQty(product, specIndex, 0)
                          : changeAddpriceBuyQty(main, addPriceIndex, specIndex, 0)"
      > 
        刪除 
      </div>
    </div>
  </div>
</template>

<script setup>
  // store ==================================================
  import { useCommon }  from '@/stores/common/common'
  import { useProducts }  from '@/stores/products'
  import { useHandlerChangeQty }  from '@/stores/handlerChangeQty'

  let { store } = storeToRefs(useCommon())
  let { numberThousands } = useCommon()
  let { getMainTotalQty } = useProducts()
  let { changeMainBuyQty, changeAddpriceBuyQty } = useHandlerChangeQty()

  // props ==================================================
  const props = defineProps(['main', 'addPrice', 'spec', 'cartSpecCheckedId'])

  // computed ==================================================
  const product = computed(() => {
    return props.addPrice ? props.addPrice : props.main
  })

  const productSpec = computed(() => {
    return props.spec ? props.spec : product.value
  })

  const addPriceIndex = computed(() => {
    if(props.addPrice) {
      return props.main.addPrice.map(item => item.ID).indexOf(props.addPrice.ID);
    }
    return null
  })

  const specIndex = computed(() => {
    if(props.spec) {
      return product.value.specArr.map(item => item.ID).indexOf(props.spec.ID);
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
</script>
