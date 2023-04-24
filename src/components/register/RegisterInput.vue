<template>
  <div class="input_container" :class="{ error: input.is_error }">
    <!-- 日期 -->
    <template v-if="input.type === 'date'" >
      <VueDatePicker :placeholder="input.placeholder" format="yyyy/MM/dd"
        :enable-time-picker="false"
        v-model="input.value" @closed="verify(input)" @cleared="verify(input)"
      >
      </VueDatePicker>
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
  import VueDatePicker from '@vuepic/vue-datepicker';
  import '@vuepic/vue-datepicker/dist/main.css'

  // store ==================================================
  import { useVerify } from '@/stores/verify'

  let { verify } = useVerify()

  // props
  let { input } = defineProps(['input']) 
</script>
