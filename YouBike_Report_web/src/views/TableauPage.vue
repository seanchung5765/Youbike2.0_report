<template>
  <div>
    <div v-if="jwt">
      <tableau-viz
        id="tableauViz"
        ref="tableauViz"
        :src="vizUrl"
        :token="jwt"
        width="100%"
        height="600px">
      </tableau-viz>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import axios from 'axios'

  const jwt = ref('');
  const nodeDomain = import.meta.env.VITE_NODE_URL;
  const tableauDomain  = import.meta.env.VITE_TABLEAU_ROOT;
  const vizUrl = ref(`${tableauDomain}/#/site/youbike/views/_0/sheet0?:iid=1`);
  let refreshIntervalId = null;

  const getTokenAndLoad = async () => {
    // email 建議從登入系統取得
    const email = 'jackhuang@youbike.com.tw'
    const res = await axios.post(`${nodeDomain}/isauth/tableau`, { email })
    jwt.value = res.data.token
  };

  // 監聽 jwt 變化，當 token 有值且 <tableau-viz> 已出現時，才加事件監聽
  watch(jwt, (newVal) => {
    if (newVal) {
      setTimeout(() => {
        const tableauViz = document.getElementById('tableauViz')
        if (tableauViz) {
          tableauViz.addEventListener('firstinteractive', async () => {
            try {
              const workbook = tableauViz.workbook

              // 檢查 activeSheet 是 Dashboard（含多 worksheet），還是單一 worksheet
              let worksheets = []
              if (workbook.activeSheet.worksheets) {
                // Dashboard: 取得所有 worksheet
                worksheets = workbook.activeSheet.worksheets
              } else {
                // 單一 worksheet
                worksheets = [workbook.activeSheet]
              }

              // 依序取得每個 worksheet 的篩選器名稱
              for (const ws of worksheets) {
                const defaultValue = "新北市"
                // console.log(`defaultValue=${defaultValue}`)
                await ws.applyFilterAsync("縣市", [defaultValue], 'replace')
                /*
                if (ws.getFiltersAsync) {
                  const filter = await ws.getFilterAsync("縣市")
                  const defaultValue = filter.values[0]
                  console.log(`defaultValue=${defaultValue}`)
                  const filters = await ws.getFiltersAsync()
                  const filterNames = filters.map(f => f.fieldName)
                  const filterValues = filters.map(f => f.values)
                  console.log(`工作表「${ws.name}」的篩選器名稱：`, filterNames, filterValues)
                }
                */
              }
            } catch (ex) {
              console.warn('設定預設篩選器失敗', ex)
            }
          })
        }
      }, 0)
    }
  })

  onMounted(() => {
    // 載入 Tableau Embedding API v3, 並動態插入 ES Module Script
    const script = document.createElement('script')
    script.type = 'module'
    script.src = `${tableauDomain}/javascripts/api/tableau.embedding.3.latest.min.js`
    document.head.appendChild(script)

    // 自動呼叫取得 JWT
    getTokenAndLoad()

    // 設定自動刷新
    refreshIntervalId = setInterval(async () => {
      const tableauViz = document.querySelector('tableau-viz')
      if (tableauViz && tableauViz.refreshDataAsync) {
        try {
          await tableauViz.refreshDataAsync()
          console.log('儀錶板已自動刷新')
        } catch (ex) {
          console.warn('刷新失敗', ex)
        }
      }
    }, 2 * 60 * 1000) // 每 2 分鐘刷新一次
  })

  onUnmounted(() => {
    if (refreshIntervalId) {
      clearInterval(refreshIntervalId)
    }
  });
</script>

