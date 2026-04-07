<template>
  <div class="chart-container" ref="chartContainer1"></div>
</template>

<script setup>
import * as echarts from "echarts";
import { onMounted, ref, watch, watchEffect } from "vue";
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

let chart1 = null;
function handleResize() {
  chart1.resize();
}

//監聽寬度變化
watchEffect(() => {
  const chartContainer = chartContainer1.value;
  if (chartContainer) {
    const observer = new ResizeObserver(() => {
      // 在這裡執行寬度變化時的操作
      handleResize();
    });
    observer.observe(chartContainer);
  }
});

const renderdata = () => {
  const option = {
    title: {
      text: props.title,
      subtext: props.date,
      left: "center", // 標題位置，可選值：'left', 'center', 'right'
      top: "5%", // 標題距離頂部的距離
      textStyle: {
        fontSize: 30, // 標題字體大小
        fontWeight: "bold", // 標題字體粗細
      },
    },
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
      formatter: "{b}", // 使用自定義格式顯示節點的值
    },

    series: [
      {
        type: "tree",
        top: "20%", // 標題距離頂部的距離
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

watch(
  () => props.data,
  () => {
    renderdata();
  }
);

onMounted(() => {
  window.addEventListener("resize", handleResize, { passive: true });
  chart1 = echarts.init(chartContainer1.value, "dark");
  renderdata();
});
</script>

<style lang="scss" scoped>
.chart-container {
  height: 350px;
}
</style>
