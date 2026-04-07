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

const renderdata = () => {
  chart1.clear();

  // console.log(props);
  const data1 = [];
  const data2 = [];
  props.data.forEach((item) => {
    data1.push(props.data.length === 0 ? "" : item["status"]);
    data2.push({
      // markLine: {
      //   data: [
      //     {
      //       name: "標準99",
      //       yAxis: 99,
      //       symbol: "circle",
      //       lineStyle: { type: "dashed" },
      //       label: { formatter: "{b}" },
      //     },
      //   ],
      // },
      // color: ["#5470c6"],
      name: props.data.length === 0 ? "" : item["status"],
      type: "line",
      data: props.data.length === 0 ? [] : item["value"],
      // itemStyle: {
      //   normal: {
      //     color: (item) => (item.value < 99 ? "#FF0000" : "#5470c6"),
      //   },
      // },
    });
  });

  // console.log(data1, data2);
  const options1 = {
    title: {
      top: "5%",
      subtext: props.secondtitle || "日期沒收到",
      left: "center",
      textStyle: {
        fontSize: 30,
      },
      text: props.title || "標題沒收到",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      left: "left",
      data: data1,
    },
    grid: {
      top: "30%",
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    toolbox: {
      show: true,
      feature: {
        magicType: { type: ["line", "bar"] },
        saveAsImage: {},
      },
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
        "21",
        "22",
        "23",
      ],
    },

    yAxis: {
      min: props.title[0] === "2" ? 70 : 0,
      max: 100,

      //2.0就變成10格
      splitNumber: props.title[0] === "2" ? 7 : 5,
      type: "value",
    },

    series: data2,
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
