<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="false"
    :is-full-page="true"
  />
  <div class="row mt-3">
    <div class="col-auto my-1">
      <n-select
        style="width: 130px"
        v-model:value="cityvalue"
        :options="selectoptions"
      />
    </div>
    <div class="col-auto my-1">
      <n-select
        class="col-md-3"
        style="width: 130px"
        v-model:value="Typevalue"
        :options="TypeOptions"
      />
    </div>
    <div class="col-auto">
      <n-date-picker
        v-model:formatted-value="timestamp"
        type="date"
        value-format="yyyy-MM-dd"
        :update-value-on-close="true"
        default-time="2023-06-20"
        :input-readonly="true"
        :actions="null"
      />
    </div>
    <div class="col-auto my-1">
      <n-button type="primary" class="me-1" @click="search">搜尋</n-button>
      <!-- <n-button type="primary" class="me-1" @click="output">導出圖片</n-button> -->
    </div>
  </div>
  <div class="row mt-3">
    <!-- <div v-for="i in data1" :key="i.type" class="col-6 mt-3">
      <FourEchartComponent1
        :data="i.data"
        :title="i.title"
        :secondtitle="timestamp"
        :type="Typevalue"
      />
    </div> -->
    <div class="col-6 mt-3">
      <FourEchartComponent1
        :data="data1[2].data"
        :title="data1[2].title"
        :secondtitle="timestamp"
        :type="Typevalue"
      />
    </div>

    <div class="col-6 mt-3">
      <FourEchartComponent1
        v-if="data1[0].data"
        :data="data1[0].data"
        :title="data1[0].title"
        :secondtitle="timestamp"
        :type="Typevalue"
      />
    </div>
    <div class="col-6 mt-3" v-for="i in data2" :key="i.type">
      <FourEchartComponent2
        :data="i.data"
        :title="i.title"
        :type="Typevalue"
        :secondtitle="timestamp"
      />
    </div>
    <div class="col-6 mt-3">
      <FourEchartComponent1
        v-if="data1[1].data"
        :data="data1[1].data"
        :title="data1[1].title"
        :secondtitle="timestamp"
        :type="Typevalue"
      />
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import FourEchartComponent1 from "../FourEchart/FourEchartComponent1.vue";
import FourEchartComponent2 from "../FourEchart/FourEchartComponent2.vue";
import { NSelect, NButton, NDatePicker } from "naive-ui";
import { ref, onMounted, inject } from "vue";
import { useUserStore } from "../../stores/userdata";
const swal = inject("$swal");
const store = useUserStore();
async function ErrorAlert(text) {
  swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
  });
}
const isLoading = ref(false);
const canusecitys = store.citys;
const data1 = ref([
  {
    data: [],
    title: "",
  },

  //這是擋住綁車
  {
    data: [],
    title: "",
  },
  //這是全部
  {
    data: [],
    title: "",
  },
]);
//城市權限 開始
const cityvalue = ref([]);
const selectoptions = ref([]);
function checkCity() {
  let arr = [];
  arr = [
    {
      label: "台北市",
      value: "Taipei",
      disabled: !canusecitys.includes(2),
    },
    {
      label: "新北市",
      value: "Newtaipei",
      disabled: !canusecitys.includes(3),
    },
    {
      label: "桃園市",
      value: "Taoyuan",
      disabled: !canusecitys.includes(4),
    },
    {
      label: "新竹市",
      value: "Hsinchu",
      disabled: !canusecitys.includes(5),
    },
    {
      label: "新竹縣",
      value: "Hsinchu_country",
      disabled: !canusecitys.includes(6),
    },
    {
      label: "竹科",
      value: "Hsinchu_science",
      disabled: !canusecitys.includes(20),
    },
    {
      label: "苗栗縣",
      value: "Miaoli",
      disabled: !canusecitys.includes(7),
    },
    {
      label: "台中市",
      value: "Taichung",
      disabled: !canusecitys.includes(8),
    },
    {
      label: "嘉義市",
      value: "Chiayi",
      disabled: !canusecitys.includes(12),
    },

    {
      label: "台南市",
      value: "Tainan",
      disabled: !canusecitys.includes(14),
    },
    {
      label: "高雄市",
      value: "Kaohsiung",
      disabled: !canusecitys.includes(15),
    },
    {
      label: "屏東縣",
      value: "Pingtung",
      disabled: !canusecitys.includes(16),
    },
  ];
  selectoptions.value = [...arr.filter((item) => !item.disabled)];

  //預設為第一筆
  cityvalue.value = selectoptions.value[0]["value"];
}

const timestamp = ref(Getnowday());

//表別start
const Typevalue = ref(3);
const TypeOptions = ref([
  {
    label: "無車",
    value: 3,
  },
  {
    label: "無位",
    value: 5,
  },
]);

async function getData() {
  const url = `${import.meta.env.VITE_NODE_URL}/db/catch_4/${cityvalue.value}/${
    Typevalue.value
  }`;
  // console.log(url);
  const url2 = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;

  const params = {
    dataset_id: "yb2",
    table_id: "station_empty_city_timerange_info",
  };
  try {
    const res = await Promise.all([
      axios.get(url),
      axios.get(url2, { params }),
    ]);

    isLoading.value = false;
    const { data } = res[0];
    console.log(res);
    // console.log(data);s
    await editData1(data);

    //長條圖
    const data2 = res[1]["data"]["data"];
    await editData2(data2);
  } catch (error) {
    console.log(error);
  }
}

function Getnowday() {
  const today = new Date();
  const todayString = `${today.getFullYear()}-${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

  return todayString;
}

const search = async () => {
  if (timestamp.value === Getnowday()) {
    await getData();
  } else {
    await ErrorAlert("目前只提供即時資料");
  }
};

async function editData1(data) {
  const arr = [
    //這是無擋住綁車
    {
      data: [],
      title: `${Typevalue.value === 3 ? "無車" : "無位"}可還-無擋柱綁車`,
    },

    //這是擋住綁車
    {
      data: [],
      title: `${Typevalue.value === 3 ? "無車" : "無位"}可還-擋柱綁車`,
    },
    //這是全部
    {
      data: [],
      title: `即時統計${Typevalue.value === 3 ? "無車" : "無位"}站位數`,
    },
  ];

  //這是無擋柱綁車
  for (let index = 0; index < arr.length; index++) {
    arr[index]["data"] = data.data.map((item) => {
      const d = item.updated_at.split(" ")[1].substring(0, 5);

      return {
        date: d,
        value: item[`${index}`]["station_count"],
      };
    });
  }

  data1.value = [...arr];
}

const data2 = ref({});
async function editData2(d) {
  // console.log(data2);
  const filterData2 = d.data.filter(
    (item) => item.city === cityvalue.value && item.status === Typevalue.value
  );
  // console.log(filterData2);
  const arr = new Array(12);
  filterData2.forEach((element) => {
    const e = element["time_range"];
    const v = element["station_count"];
    if (e === "0-15") {
      arr[0] = v;
    } else if (e === "30") {
      arr[1] = v;
    } else if (e === "45") {
      arr[2] = v;
    } else if (e === "60") {
      arr[3] = v;
    } else if (e === "75") {
      arr[4] = v;
    } else if (e === "90") {
      arr[5] = v;
    } else if (e === "150") {
      arr[6] = v;
    } else if (e === "210") {
      arr[7] = v;
    } else if (e === "270") {
      arr[8] = v;
    } else if (e === "330") {
      arr[9] = v;
    } else if (e === "390") {
      arr[10] = v;
    } else if (e === "+390") {
      arr[11] = v;
    }
  });
  const resData = [
    {
      data: [...arr],
      title: `即時${Typevalue.value === 3 ? "無車" : "無位"}站點累計時間`,
    },
  ];
  data2.value = [...resData];
  console.log(data2.value);
}

onMounted(async () => {
  await getData();
  // console.log(data1.value);
});

// const childRef = ref();
// function output() {
//   childRef.value[0].downloadImage();
//   childRef.value[1].downloadImage();
//   childRef.value[2].downloadImage();
// }

(async () => {
  // await getData();
  checkCity();
})();
</script>

<style lang="scss" scoped></style>
