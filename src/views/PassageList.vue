<template>
  <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <div class="waterfall-container">
        <div class="column">
          <passage-item
            v-for="item in leftPassageList"
            @toggle-play="togglePlay"
            :passage="item"
            :key="item.id"
            class="passage"
          ></passage-item>
        </div>
        <div class="column">
          <passage-item
            v-for="item in rightPassageList"
            @toggle-play="togglePlay"
            :passage="item"
            :key="item.id"
            class="passage"
          ></passage-item>
        </div>
      </div>
    </van-list>
  </van-pull-refresh>
</template>

<script setup lang="ts">
import type { Passage, PassageListResp } from "../types/passageList.types";

import { ref } from "vue";
import PassageItem from "../components/PassageItem.vue";
import { measureItemDomHeight } from "../utils/measure";

const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const leftPassageList = ref<Passage[]>([]);
const rightPassageList = ref<Passage[]>([]);
let lastPlayedVideoId = "";
let pageIndex = 1;
const pageSize = 10;

const togglePlay = (id: string) => {
  let passage: Passage | null = getPassage(id);
  if (passage) {
    if (passage.isActive) {
      passage.isActive = false;
      lastPlayedVideoId = "";
    } else {
      passage.isActive = true;

      let lastPassage: Passage | null = getPassage(lastPlayedVideoId);
      if (lastPassage) {
        lastPassage.isActive = false;
      }
      lastPlayedVideoId = id;
    }
  }
};

const getPassage = (id: string) => {
  return (
    leftPassageList.value.find(child => child.id === id) ||
    rightPassageList.value.find(child => child.id === id) ||
    null
  );
};

async function onLoad() {
  loading.value = true;
  // 定义每列宽度 rem 单位（可调整）
  const columnWidthRem = 11.25;

  const queryString = new URLSearchParams({
    pageIndex: `${pageIndex++}`,
    pageSize: `${pageSize}`
  }).toString();
  // const url = `http://rap2api.taobao.org/app/mock/323529/get/passageList?${queryString}`;
  const url = `https://m1.apifoxmock.com/m1/6394040-6090769-default/passageList?${queryString}`;
  const response = await fetch(url);
  const res = (await (response as any).json()) as PassageListResp;
  for (const raw of res.list) {
    const height = await measureItemDomHeight(raw, columnWidthRem);
    const passage = { ...raw, height, isActive: false };
    // 计算当前左右高度总和
    const leftHeight = leftPassageList.value.reduce((sum, it) => sum + it.height, 0);
    const rightHeight = rightPassageList.value.reduce((sum, it) => sum + it.height, 0);
    if (leftHeight <= rightHeight) {
      leftPassageList.value.push(passage);
    } else {
      rightPassageList.value.push(passage);
    }
  }
  loading.value = false;
  finished.value = !res.hasMore;
}

function onRefresh() {
  pageIndex = 1;
  leftPassageList.value = [];
  rightPassageList.value = [];
  finished.value = false;
  refreshing.value = false;
  onLoad();
}

// 初始加载
onLoad();
</script>

<style scoped lang="less">
.waterfall-container {
  display: flex;
  gap: 0.1875rem;
  padding: 0.375rem;
}
.column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1875rem;

  // .passage {
  //   width: 11.25rem;
  // }
}
</style>
