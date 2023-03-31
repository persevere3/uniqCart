<template>
  <!-- @click.stop="isShowFavorite = false" ????? -->
  <div class="productContainer">


    <!-- 購物車動畫  購物車icon -------------------------------------------------- -->
    <div class="flyImg" :style="`top: ${flyImgTop}px; left: ${flyImgLeft}px`" v-if="flyItem">
      <img :src="flyItem.Img1" alt="">
    </div>
    <div class="cartIcon" :class="{shrink:isShrink}" v-show="showPage === 'main'" @click="showPage = 'cart'">
      <i class="fa fa-shopping-cart fa-2x" aria-hidden="true"></i>
      <div class="num">
        {{cartLength}}
      </div>
    </div>

    <!-- 我的最愛 --------------------------------------------------------------- -->
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
          <li @click.stop="showFavorite(item.ID)">
            <div class="img_and_name">
              <div class="img" :style="{backgroundImage: `url(${item.Img1})`}"></div>
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

    <!-- main -------------------------------------------------- -->
    <!-- <div class="main" v-if="showPage === 'main'">
      <div class="logo_name">
        <img :src="store.Logo" class="logo" v-if="store.Logo" @click="urlPush('/')">
      </div>
      <div class="categories">
        <ul>
          <li v-for="item in categories" :key="item.ID" 
              :class="{categoryActive:item.ID === category}"
              @click="category = item.ID; currentPage = 1;" 
          >
            {{item.Name}}
          </li>
        </ul>
      </div>
      <div class="arrangement" v-if="pageFilterProducts.length !== 0">
        <div>排列方式</div>
        <div class="icon"
          :class="{iconActive:arrangement==0}"
          @click="arrangement=0" 
        >
          <i class="fa fa-th-large" aria-hidden="true"></i>
        </div>
        <div class="icon"
          :class="{iconActive:arrangement==1}"
          @click="arrangement=1"
        >
          <i class="fa fa-th-list" aria-hidden="true"></i>
        </div>
      </div>

      <div class="products" :class="{change:arrangement==1}">
        <ul>
          <li v-for="item in pageFilterProducts" :key="item.ID" >
            <div class="pic_div">
              <div class="pic" :style="{backgroundImage :`url(${item.Img1})`, height:`${picHeight}px`}" @click="showSelect(item)">
                <div class="detailButton">
                  查看詳情
                  <i class="fas fa-heart" :class="{is_favorite : favorite[item.ID]}" @click.stop="toggleFavorite(item.ID)"></i>
                </div>
              </div>
            </div>

            <div class="content">
              <div class="title">{{item.Name}}</div>
              <div class="price origin">NT$ {{numberThousands(item.Price)}}</div>
              <div class="price">NT$ {{numberThousands(item.NowPrice)}}</div>
              <productBuyQtyBox :main="item" :event="1" />
            </div>
          </li>
        </ul>
        <div class="no_item" v-if="productCompleted && pageFilterProducts.length === 0">
          目前沒有銷售任何產品
        </div>
      </div>
      <div class="pages" v-if="pageFilterProducts.length !== 0">
        <ul>
          <li :class="{'pageDisabled':currentPage===1}" @click="pageChange(currentPage - 1)">
            Previous
          </li>

          <li v-for="page in totalPage" :key="`page_${page}`" 
              :class="{'liActive':currentPage === page}"
              @click="pageChange(page)">
            {{page}}
          </li>

          <li :class="{'pageDisabled':currentPage === totalPage}" @click="pageChange(currentPage + 1)">
            Next
          </li>
        </ul>
      </div>

      <div class="notice">
        <ul>
          <li v-if="store.Content" @click="showPage = 'Content'">
            訂購須知
          </li>
          <li v-if="store.Description" @click="showPage = 'Description'">
            配送須知
          </li>
          <li v-if="store.PrivacyPolicy" @click="showPage = 'PrivacyPolicy'">
            隱私權聲明
          </li>
        </ul>
      </div>
    </div> -->


  </div>
</template>

<script setup>
  // component
  // import selectProduct from './selectProduct.vue'
  // import cart from './cart/index.vue'
  // import productBuyQtyBox from './productBuyQtyBox.vue'
  // import register from './register/index.vue'

  import { reactive, toRefs } from 'vue';

  // store
  import { useCommon }  from '@/stores/common'
  import { useProducts }  from '@/stores/products'
  import { useCart }  from '@/stores/cart'
  import { useFilters }  from '@/stores/filters'
  import { useHandlerChangeQty }  from '@/stores/handlerChangeQty'

  const { showPage } = useCommon()
  const { favorite, showFavorite, toggleFavorite } = useProducts()
  const { cartLength } = useCart()
  const { numberThousands } = useFilters()
  const { flyItem, flyImgTop, flyImgLeft, isShrink} = useHandlerChangeQty()

  // state ==================================================
  const state = reactive({
    innerHeight: 0,
    picHeight: 0,
    isShowFavorite: false,
  })
  const { innerHeight, picHeight, isShowFavorite } = toRefs(state)

  // onMounted ==================================================
  onMounted(() => {
    getSite();

    innerHeight = window.innerHeight;
    window.onresize = () => {
      state.innerHeight = window.innerHeight;
    }
  })

</script>

<style lang="scss">
  @import "../styles/css/quill.css";
  @import "../styles/scss/index.scss";
</style>
