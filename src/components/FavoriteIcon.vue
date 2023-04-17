<template>
  <!-- icon  -->
  <div class="favoriteIcon" v-show="showPage === 'main' && Object.keys(favorite).length" @click.stop="isShowFavorite = !isShowFavorite">
    <i class="fas fa-heart fa-2x"></i>
    <div class="num">
      {{Object.keys(favorite).length}}
    </div>
  </div>

  <!-- modal -->
  <div class="favorite_container" v-show="showPage === 'main' && Object.keys(favorite).length" :class="{hover : isShowFavorite}">
    <ul class="favorite_items">
      <template v-for="item in favorite">
        <li @click.stop="showSelect(item.ID)">
          <div class="img_and_name">
            <div class="img" :style="{backgroundImage: `url(${item.imgArr[0]})`}"></div>
            <div class="name"> {{ item.Name }} </div>
          </div>
          <div class="price_and_delete">
            <div class="price"> NT${{numberThousands(item.NowPrice)}} </div>
            <div class="delete" @click.stop="toggleFavorite(item.ID)">
              <i class="fas fa-trash-alt"></i>
            </div>
          </div>
        </li>
      </template>
    </ul>
  </div>
</template>

<script setup>
  // store
  import { useAll }  from '@/stores/all'
  import { useProducts }  from '@/stores/products'
  import { useFilters }  from '@/stores/filters'

  let { showPage } = storeToRefs(useAll())
  let { favorite } = storeToRefs(useProducts())
  let { toggleFavorite } = useProducts()
  let { numberThousands } = useFilters()

  // state ==================================================
  const state = reactive({
    isShowFavorite: false,
  })
  let { isShowFavorite } = toRefs(state)
</script>