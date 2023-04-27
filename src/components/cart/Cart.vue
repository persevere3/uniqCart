<template>
  <div class="cart">
    <div class="background">
      <div class="close">
        <i class="fa fa-times" aria-hidden="true" @click="showPage = 'main'"></i>
      </div>
      
      <CartContent />
    </div>
  </div>
</template>

<script setup>
  // component ==================================================
  import CartContent from '@/components/cart/CartContent.vue'

  // store ==================================================
  import { useCommon }  from '@/stores/common/common'

  let { showPage } = storeToRefs(useCommon())
</script>