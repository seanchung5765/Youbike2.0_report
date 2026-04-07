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
    type: Array,
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
  let option = {
    title: {
      left: "center",
      top: "5%",
      text: "騎乘次數(台灣合計)",
      subtext: `${props.date[0]}~${props.date[6]}`,
      textStyle: {
        fontSize: 30,
      },
    },
    tooltip: {
      trigger: "item",
      formatter: "{c}",
    },
    grid: {
      top: "25%", // 調整圖表往下的距離
      bottom: "10%",
    },
    xAxis: {
      type: "category",
      data: props.date,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: props.data,
        type: "bar",
        showBackground: true,
        backgroundStyle: {
          color: "rgba(180, 180, 180, 0.2)",
        },
        label: {
          show: true,
          position: "insideTop",
          color: "white",
          formatter: "{c}", // 显示数据值
        },
      },
    ],
  };
  chart1.setOption(option);
};

watch(
  () => props.data,
  () => {
    renderdata();
    // setTimeout(() => {
    //   downloadImage(chart1);
    // }, 3000);
  }
);

onMounted(() => {
  window.addEventListener("resize", handleResize, { passive: true });
  chart1 = echarts.init(chartContainer1.value, "dark");
  renderdata();
});

// function downloadImage(chart) {
//   const url = chart.getDataURL({
//     type: "png",
//     pixelRatio: 2,
//     backgroundColor: "#000000",
//   });
//   console.log(url);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = "chart.png"; // 可以指定下載的文件名
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);
// }
</script>

<style lang="scss" scoped></style>
