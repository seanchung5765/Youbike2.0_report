<!-- eslint-disable vue/no-export-in-script-setup -->
<template>
  <div class="chart-container" ref="chartContainer1"></div>
</template>

<script setup>
import * as echarts from "echarts";
import { onMounted, ref, watch, watchEffect } from "vue";

const alldate = generateTimeArray();
// console.log(alldate);

// function fillMissingTimes(data) {
//   console.log(data);
//   const firstTime = data[0]["date"];
//   const [firstHour, firstMinute] = firstTime.split(":").map(Number);

//   let filledData = [];

//   for (let hour = 0; hour <= firstHour; hour++) {
//     for (let minute = 0; minute < 60; minute++) {
//       let timeStr = `${hour.toString().padStart(2, "0")}:${minute
//         .toString()
//         .padStart(2, "0")}`;

//       if (hour === firstHour && minute === firstMinute) {
//         break;
//       }

//       filledData.push({ date: timeStr, value: null });
//     }
//   }
//   return filledData.concat(data);
// }

const data = ref([]);
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
  data.value = props.data.map((item) => item.value);

  const options1 = {
    title: {
      text: props.title,
      subtext: props.secondtitle,
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        animation: false,
        label: {
          backgroundColor: "#ccc",
          borderColor: "#aaa",
          borderWidth: 1,
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          color: "#222",
        },
      },
      formatter: function (params) {
        return (
          `時間 : ${params[0].name}` + "<br />" + `值 : ${params[0].value}`
        );
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: alldate,
      axisLabel: {},
      boundaryGap: false,
    },

    yAxis: {
      // min: 0,
      // max: props.type == 5 ? 80 : 200,
    },
    series: [
      //   {
      //     name: "L",
      //     type: "line",
      //     data: data.value.map(function (item) {
      //       return data.value;
      //     }),
      //     lineStyle: {
      //       opacity: 0,
      //     },
      //     stack: "confidence-band",
      //     symbol: "none",
      //   },

      //陰影區域
      //   {
      //     name: "U",
      //     type: "line",
      //     data: data.value.map(function (item) {
      //       return item.u - item.l;
      //     }),
      //     lineStyle: {
      //       opacity: 0,
      //     },
      //     areaStyle: null,
      //     stack: "confidence-band",
      //     symbol: "none",
      //   },

      //線
      {
        type: "line",
        // color: "#FFFFE0",
        // areaStyle: {
        //   color: "#ccc",
        // },
        // data: fillMissingTimes(data.value),
        data: data.value,
      },
    ],
  };

  chart1.setOption(options1);
};

watch(
  () => props.data,
  () => {
    renderdata();
    console.log(props.data);
  }
);

function generateTimeArray() {
  let times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute++) {
      let formattedHour = hour.toString().padStart(2, "0");
      let formattedMinute = minute.toString().padStart(2, "0");
      times.push(`${formattedHour}:${formattedMinute}`);
    }
  }
  return times;
}

onMounted(() => {
  window.addEventListener("resize", handleResize, { passive: true });
  chart1 = echarts.init(chartContainer1.value, "dark");
  renderdata();
});

function downloadImage() {
  const url = chart1.getDataURL({
    type: "png",
    pixelRatio: 2,
    backgroundColor: "#000000",
  });
  console.log(url);
  const a = document.createElement("a");
  a.href = url;
  a.download = "chart.png"; // 可以指定下載的文件名
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

defineExpose({
  downloadImage,
});
</script>

<style>
.chart-container {
  height: 350px;
}
</style>
