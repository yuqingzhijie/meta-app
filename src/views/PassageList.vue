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
  let item: Passage | null =
    leftPassageList.value.find(child => child.id === id) ||
    rightPassageList.value.find(child => child.id === id) ||
    null;
  if (item) {
    if (item.isActive) {
      item.isActive = false;
    } else {
      item.isActive = true;

      let lastItem: Passage | null =
        leftPassageList.value.find(child => child.id === lastPlayedVideoId) ||
        rightPassageList.value.find(child => child.id === lastPlayedVideoId) ||
        null;

      if (lastItem) {
        lastItem.isActive = false;
      }
      lastPlayedVideoId = id;
    }
  }
};

async function onLoad(pageIndex: number, pageSize: number) {
  loading.value = true;
  // 定义每列宽度 rem 单位（可调整）
  const columnWidthRem = 11.25;

  const queryString = new URLSearchParams({
    pageIndex: String(pageIndex),
    pageSize: String(pageSize)
  }).toString();
  const url = `http://rap2api.taobao.org/app/mock/323529/get/passageList?${queryString}`;
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
  pageIndex = 0;
  leftPassageList.value = [];
  rightPassageList.value = [];
  finished.value = false;
  onLoad(pageIndex, pageSize);
}

// 初始加载
onLoad(pageIndex, pageSize);
</script>

<style scoped lang="less">
.waterfall-container {
  display: flex;
  gap: 0.1875rem; /* 12px */
  padding: 0.375rem;
}
.column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1875rem;
}
</style>
