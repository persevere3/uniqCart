<template>
  <div class="selectProduct">
    <div class="background">
      <div class="close" @click="showPage = 'main'"> <i class="fa fa-times" aria-hidden="true"></i> </div>
      <div class="picContent">
        <div class="pic" ref="mainPicWidth">
          <div class="mainPic" :style="{backgroundImage :`url(${selectProduct.imgArr[selectProduct.mainImgIndex]})`}">
          </div>
          <div class="allPic" :style="{height:`${picHeight}px`}">
            <ul :style="`left: -${picUlleft * liWidth}px; width: ${selectProduct.allPicLength * liWidth}px;`" >
              <li v-for = "(item, index) in selectProduct.imgArr" :key="`${item}_${index}`" 
                v-show="item" @click="selectProduct.mainImgIndex = index"   
              >
                <div class="img" :style="{backgroundImage :`url(${item})`, width: `${picWidth}px`}"
                    :class="{imgActive:selectProduct.mainImgIndex === index}">
                </div>
              </li>
            </ul>
          </div>
          <div class="controller" :style="{height:`${picHeight}px`}">
            <div class="left" :class="{disabled:picUlleft < 1}" @click="picUlleft < 1 ? picUlleft : picUlleft--"> <i class="fa fa-chevron-left" aria-hidden="true"></i> </div>
            <div class="right" :class="{disabled:picUlleft + 1 > selectProduct.allPicLength - 3}" @click=" picUlleft + 1 > selectProduct.allPicLength - 3 ? picUlleft : picUlleft++"> <i class="fa fa-chevron-right" aria-hidden="true"></i> </div>
          </div>
        </div>
        <div class="content">
            <div class="title">{{selectProduct.Name}}</div>
            <div class="price origin">NT$ {{numberThousands(selectProduct.Price)}}</div>
            <div class="price">NT$ {{numberThousands(selectProduct.NowPrice)}}</div>
            <div class="title"> <div v-html="unescapeEnter(selectProduct.Content)"></div> </div>

            <ProductBuyQtyBox :main="selectProduct" />

            <div class="goToCart" v-if="isShowGoToCart" @click="showPage = 'cart'">
              加入購物車 <i class="fa fa-shopping-cart" aria-hidden="true"></i>
            </div>

            <div class="addTo_favorite_btn" @click.stop="toggleFavorite(selectProduct.ID)">
              加入我的最愛 <i class="fas fa-heart" :class="{is_favorite : favorite[selectProduct.ID]}"></i>
            </div>

            <div class="share_link" @click="click_share_link">
              分享 <i class="fas fa-share"></i>
            </div>
            <input type="text" class="copy_input hide" readonly>
        </div>
      </div>

      <div class="addPrice" v-if="selectProduct.addPrice && selectProduct.addPrice.length">
        <div class="title">加價購</div>
        <ul>
          <div class="ulMask" v-if="!getMainTotalQty(selectProduct)"></div>
          <li v-for="item in selectProduct.addPrice" :key="item.ID">
            <div class="pic_div">
              <div class="pic" :style="{backgroundImage :`url(${item.Img})`,}"></div>
            </div>
            <div class="content">
              <div class="title">{{item.Name}}</div>
              <div class="price">NT$ {{numberThousands(item.Price)}}</div>
              <ProductBuyQtyBox :main="selectProduct" :addPrice="item"/>
            </div>
          </li>
        </ul>
      </div>

      <div class="detail">
        <div class="title">商品詳情</div>
        <div class="content ql-editor" v-html="unescapeHTML(selectProduct.Detail)"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
  // component ==================================================
  import ProductBuyQtyBox from '@/components/ProductBuyQtyBox.vue'

  // store ==================================================
  import { useCommon }  from '@/stores/common/common'
  import { useProducts }  from '@/stores/products'

  let { showPage } = storeToRefs(useCommon())
  let { copy, showMessage } = useCommon()
  let { numberThousands, unescapeHTML, unescapeEnter } = useCommon()
  let { selectProduct, favorite } = storeToRefs(useProducts())
  let { getMainTotalQty, toggleFavorite } = useProducts()

  // state ==================================================
  const state = reactive({
    liWidth: 0,
    picHeight: 0,
    picWidth: 0,
    picUlleft: 0,
  })

  // onMounted ==================================================
  onMounted(() => {
    window.addEventListener('resize', computedPic)
  })
  onUnmounted(() => {
    window.removeEventListener('resize', computedPic)
  })

  // ref ==================================================
  const mainPicWidth = ref(null)

  // computed ==================================================
  const isShowGoToCart = computed(() => {
    if(selectProduct.value.specArr) {
      let specBuyQty = selectProduct.value.selectSpecItem.buyQty
      return specBuyQty && specBuyQty != 0
    }
    else {
      return selectProduct.value.buyQty != 0
    }
  })
  
  // methods ==================================================
  function computedPic(){
    state.liWidth = (mainPicWidth.value.offsetWidth) / 3;
    state.picHeight = state.liWidth;
    state.picWidth = state.liWidth - 10;
  }

  function click_share_link() {
    copy( `${location.origin}/cart/?id=${selectProduct.ID}`, '.copy_input');
    showMessage('複製分享連結', true);
  }
</script>
