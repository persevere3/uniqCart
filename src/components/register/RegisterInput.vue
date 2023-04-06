<template>
  <div class="input_container" :class="{ error: input.is_error }">
    <!-- 日期 -->
    <template v-if="input.type === 'date'" >
      <date-picker :placeholder="input.placeholder" format="YYYY/MM/DD" 
        v-model="input.value" @close="verify(input)" @clear="verify(input)"
      >
      </date-picker>
    </template>
    <!-- 一般 -->
    <template v-else>
      <input :type="input.type === 'password' && !input.visible 
                                    ? 'password' : 'text'"
        :readonly="input.readonly" :placeholder="input.placeholder" autocomplete="false"
        v-model.trim="input.value" @blur="verify(input)"
      >
      <div v-if="input.type === 'password'" class="eyes_icon"
        @click.stop="input.visible = !input.visible">
        <i class="fas fa-eye" v-if="input.visible"></i>
        <i class="fas fa-eye-slash" v-else></i>
      </div>
    </template>

    <div class="error message">
      <i class="error_icon fas fa-exclamation-circle"></i> 
      {{  input.message  }}
    </div>
  </div>
</template>

<script setup>
  // store ==================================================
  import { useFilterStore } from '@/stores/filters'

  const { verify } = storeToRefs(useFilterStore())

  // props
  const { input } = defineProps(['input']) 
</script>
