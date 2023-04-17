<template>
  <div class="message_container">
    <div v-for="item in messageArr" :key="item.id" 
        class="message" :class="{ messageActive:item.messageActive, messagefadeout:item.messagefadeout}" 
        :style="`background:${item.isSuccess ? 'rgba(50, 200, 50, 0.6)' : 'rgba(255, 0, 0, 0.6)'}`"> 
        {{ item.messageStr }}
    </div>
  </div>
</template>

<script setup>
  // store
  import { useAll }  from '@/stores/all'

  let { messageArr } = storeToRefs(useAll())
</script>

