<template>
  <div class="chart-container" ref="chartContainer1"></div>
</template>

<script setup>
import * as echarts from "echarts";
import { onMounted, ref, watch, watchEffect } from "vue";

const props = defineProps({
  // data格式
  // [
  //   {
  //     nmae:"xxx",
  //     value:xxx
  //   },
  //   {
  //     nmae:"xxx",
  //     value:xxx
  //   }
  // ]
  data: {
    type: Array,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  secondtitle: {
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
  const sortdata = (data) => data.sort((a, b) => b.value - a.value);
  const options1 = {
    title: {
      text: props.title,
      subtext: props.secondtitle,
      top: "5%",
      left: "center",
      textStyle: {
        fontSize: 20,
      },
    },
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c}({d}%)",
      position: "top",
    },
    series: [
      {
        name: "Access From",
        top: "10%",
        bottom: "-20%",
        type: "pie",
        radius: "50%",
        label: {
          formatter: "{b} : {c}", // 使用自定义富文本格式化
          rich: {
            per: {
              color: "#fff",
              backgroundColor: "#999",
              padding: [2, 4],
              borderRadius: 2,
            },
          },
          fontSize: 13, // 調整字體大小
        },
        data: sortdata(props.data),
        emphasis: {
          itemStyle: {
            // shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };
  chart1.setOption(options1);
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

<style>
.chart-container {
  height: 350px;
}
</style>
