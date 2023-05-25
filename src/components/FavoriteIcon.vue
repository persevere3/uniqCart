<template>
  <!-- icon  -->
  <div class="favoriteIcon" @click.stop="isShowFavorite = !isShowFavorite">
    <i class="fas fa-heart fa-2x"></i>
    <div class="num">
      {{Object.keys(favorite).length}}
    </div>
  </div>

  <!-- modal -->
  <div class="favorite_container" v-show="showPage === 'main' && Object.keys(favorite).length" :class="{show : isShowFavorite}">
    <ul>
      <template v-for="item in favorite">
        <li @click.stop="showSelect(item)">
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
  import { useCommon }  from '@/stores/common/common'
  import { useProducts }  from '@/stores/products'

  let { isShowFavorite, showPage } = storeToRefs(useCommon())
  let { numberThousands } = useCommon()
  let { favorite } = storeToRefs(useProducts())
  let { showSelect, toggleFavorite } = useProducts()

</script>