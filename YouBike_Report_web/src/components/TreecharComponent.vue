<template>
  <div class="chart-container" ref="chartContainer1"></div>
</template>

<script setup>
import * as echarts from "echarts";
import { onMounted, onUnmounted, ref, watch, markRaw } from "vue";

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  treetitle: {
    type: String,
    required: true,
  },
});

const chartContainer1 = ref(null);
// 宣告為普通的變數，並在 mounted 時用 markRaw 裝起來
let chart1 = null; 
let observer = null; // 把 observer 提拔到外層，方便稍後銷毀

function handleResize() {
  if (chart1) chart1.resize();
}

const renderdata = () => {
  if (!chart1) return;
  
  const option = {
    title: {
      text: props.title,
      subtext: props.date,
      left: "center",
      top: "5%",
      textStyle: {
        fontSize: 30,
        fontWeight: "bold",
      },
    },
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
      formatter: "{b}", 
    },
    series: [
      {
        type: "tree",
        top: "20%",
        bottom: "3%",
        right: "30%",
        left: "30%",
        data: [
          {
            name: props.treetitle,
            children: props.data,
          },
        ],
        initialTreeDepth: -1,
        symbol: "emptyCircle",
        symbolSize: 10,
        itemStyle: {
          color: "#4187f5",
          borderColor: "#4187f5",
        },
        label: {
          position: "left",
          verticalAlign: "middle",
          align: "right",
          color: "#ffffff",
          fontSize: 15,
          fontStyle: "italic",
        },
        leaves: {
          label: {
            position: "right",
            verticalAlign: "middle",
            align: "left",
            color: "#ffffff",
            fontSize: 15,
            fontStyle: "italic",
          },
        },
        expandAndCollapse: true,
        animationDuration: 550,
        animationDurationUpdate: 750,
      },
    ],
  };

  chart1.setOption(option);
};

// 監聽資料變化，重新畫圖
watch(() => props.data, () => {
  renderdata();
}, { deep: true });

onMounted(() => {
  // 🚀 2. 使用 markRaw 告訴 Vue 不要對 ECharts 實例做深度監聽 (大幅提升效能)
  chart1 = markRaw(echarts.init(chartContainer1.value, "dark"));
  renderdata();

  // 🚀 3. 正確的註冊 ResizeObserver
  if (chartContainer1.value) {
    observer = new ResizeObserver(() => {
      handleResize();
    });
    observer.observe(chartContainer1.value);
  }
});

onUnmounted(() => {
  // 🚀 4. 元件銷毀時，一定要斷開 Observer 與釋放 ECharts 實例，避免記憶體洩漏！
  if (observer) observer.disconnect();
  if (chart1) chart1.dispose();
});
</script>

<style lang="scss" scoped>
.chart-container {
  height: 350px;
}
</style>