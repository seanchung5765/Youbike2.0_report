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
  type: {
    type: Number,
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

watchEffect(() => {
  const chartContainer = chartContainer1.value;
  if (chartContainer) {
    const observer = new ResizeObserver(() => {
      handleResize();
    });
    observer.observe(chartContainer);
  }
});

const renderdata = async () => {
  const options1 = {
    title: {
      text: props.title,
      subtext: props.secondtitle,
      left: "center",
    },
    legend: {},
    tooltip: {},

    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },

    xAxis: {
      type: "category",
      data: [
        "0-15",
        "30",
        "45",
        "60",
        "75",
        "90",
        "150",
        "210",
        "270",
        "330",
        "390",
        "+390",
      ],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: props.data,
        type: "bar",
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

// function generateTimeArray() {
//   let times = [];
//   for (let hour = 0; hour < 24; hour++) {
//     for (let minute = 0; minute < 60; minute++) {
//       let formattedHour = hour.toString().padStart(2, "0");
//       let formattedMinute = minute.toString().padStart(2, "0");
//       times.push(`${formattedHour}:${formattedMinute}`);
//     }
//   }
//   return times;
// }

onMounted(() => {
  window.addEventListener("resize", handleResize, { passive: true });
  chart1 = echarts.init(chartContainer1.value, "dark");
  renderdata();
});

// function downloadImage() {
//   const url = chart1.getDataURL({
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

// defineExpose({
//   downloadImage,
// });
</script>

<style>
.chart-container {
  height: 350px;
}
</style>
