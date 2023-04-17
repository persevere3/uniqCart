<template>
  <!-- icon -->
  <div class="cartIcon" :class="{shrink:isShrink}" v-show="showPage === 'main'" @click="showPage = 'cart'">
    <i class="fa fa-shopping-cart fa-2x" aria-hidden="true"></i>
    <div class="num">
      {{cartLength}}
    </div>
  </div>

  <!-- 動畫 -->
  <div class="flyImg" :style="`top: ${flyImgTop}px; left: ${flyImgLeft}px`" v-if="flyItem">
    <img :src="flyItem.imgArr[0]" alt="">
  </div>
</template>

<script setup>
  // store
  import { useAll }  from '@/stores/all'
  import { useCart }  from '@/stores/cart'
  import { useHandlerChangeQty }  from '@/stores/handlerChangeQty'

  let { showPage } = storeToRefs(useAll())
  let { cartLength } = storeToRefs(useCart())
  let { flyItem, flyImgTop, flyImgLeft, isShrink} = storeToRefs(useHandlerChangeQty())
</script>