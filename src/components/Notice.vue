<template>
  <div class="notice_page">
    <div class="background" >
      <div class="close" @click="showPage = 'main'"> <i class="fa fa-times" aria-hidden="true"></i> </div>
      <div class="content ql-editor" ref='notice_page_content' v-html="unescapeHTML(store[showPage])"></div>
    </div>
  </div>
</template>

<script setup>
  // store ==================================================
  import { useCommon }  from '@/stores/common'
  import { useFilters }  from '@/stores/filters'

  let { store, showPage } = useCommon()
  let { unescapeHTML } = useFilters()

  // props ==================================================
  let { innerHeight } = defineProps(['innerHeight'])

  // ref ==================================================
  const notice_page_content = ref(null)
  
</script>