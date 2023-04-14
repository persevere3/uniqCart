export const useFilters = defineStore('filters', () => {
  // methods ==================================================
  const methods = {
    // number
    number(number) {
      let regExp = /^[0-9]+$/;
      if(!regExp.test(number)) return 0
      return Number(number)
    },
    // 千分位
    numberThousands(number) {
      return String(number).replace( /(\d)(?=(?:\d{3})+$)/g, '$1,')
    },

    // ↵ => <br>
    unescapeEnter(text){
      return String(text).replace(/↵/g, '<br>');
    },
    // => <, >, &, ", '
    unescapeHTML(text) {
      return String(text).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
    },
  }

  return {
    ...methods
  }
})