<template>
  <div class="chart-container" ref="chartContainer1"></div>
</template>

<script setup>
import * as echarts from "echarts";
import { onMounted, ref, watch, watchEffect } from "vue";
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
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
  const seriesArr = [];
  //資料
  props.data.forEach((item) => {
    seriesArr.push({
      name: item.city,
      // data: props.data,
      data: item.value,
      type: "bar",
      showBackground: true,
      barGap: 0,
      emphasis: {
        focus: "series",
      },
      label: {
        show: true,
        position: "insideTop",
        color: "black",
        formatter: "{c}",
      },
    });
  });

  //上面那排成市選單
  const legendArr = [];
  props.data.forEach((item) => {
    legendArr.push(item.city);
  });

  let option = {
    title: {
      left: "center",
      top: "10%",
      text: props.name,
      subtext: `${props.date[0]}~${props.date[props.date.length - 1]}`,
      textStyle: {
        fontSize: 30,
      },
    },
    toolbox: {
      show: true,
      orient: "vertical",
      left: "right",
      top: "center",
      feature: {
        magicType: { show: true, type: ["line", "bar", "stack"] },
      },
    },
    legend: {
      top: "2%",
      data: legendArr,
    },
    tooltip: {
      trigger: "item",
      formatter: "{c}",
    },
    grid: {
      top: "30%", // 調整圖表往下的距離
      bottom: "10%",
    },
    xAxis: {
      type: "category",
      data: props.date,
    },
    yAxis: {
      type: "value",
    },
    series: seriesArr,
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

<style lang="scss" scoped></style>
