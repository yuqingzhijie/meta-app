<!-- Waterfall.vue: 手动两列分发，按真实图片高度分配 -->
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
          <div v-for="item in leftColumn" :key="item.id" class="passage">
            <img
              :src="item.imgUrl"
              class="img"
            />
            <div class="content">
              <p class="text">{{ item.text }}</p>
              <p class="community">{{ item.community }}</p>
              <div class="footer">
                <div class="user">
                  <img :src="item.avatarUrl" />
                  <span>{{ item.userName }}</span>
                </div>
                <div class="like-wrap">
                  <van-icon name="good-job-o" />
                  <span>{{ item.likes }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="column">
          <div v-for="item in rightColumn" :key="item.id" class="passage">
            <img
              :src="item.imgUrl"
              class="img"
            />
            <div class="content">
              <p class="text">{{ item.text }}</p>
              <p class="community">{{ item.community }}</p>
              <div class="footer">
                <div class="user">
                  <img :src="item.avatarUrl" />
                  <span>{{ item.userName }}</span>
                </div>
                <div class="like-wrap">
                  <van-icon name="good-job-o" />
                  <span>{{ item.likes }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-list>
  </van-pull-refresh>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import girl1Img from './assets/img/girl.jpg';
import girl2Img from './assets/img/girl2.jpg';

interface Item {
  id: number;
  imgUrl: string;
  text: string;
  community: string;
  avatarUrl: string;
  userName: string;
  likes: number;
  height: number;
}

const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const leftColumn = ref<Item[]>([]);
const rightColumn = ref<Item[]>([]);

function mockData(): Item[] {
  return Array.from({ length: 10 }).map(() => ({
    id: Date.now() + Math.random(),
    imgUrl: Math.random() < 0.5 ? girl1Img : girl2Img,
    text: '小啊小二郎，背着书包上学校，完整文本展示…',
    community: '小学语文版块',
    avatarUrl: girl1Img,
    userName: '小明',
    likes: Math.floor(Math.random() * 100),
    height: 0
  }));
}

// 预加载图片并计算渲染高度
async function measureItem(item: Item, columnWidth: number) {
  return new Promise<Item>(resolve => {
    const img = new Image();
    img.src = item.imgUrl;
    img.onload = () => {
      const h = (img.naturalHeight / img.naturalWidth) * columnWidth;
      resolve({ ...item, height: h });
    };
    img.onerror = () => resolve({ ...item, height: columnWidth });
  });
}

async function onLoad() {
  loading.value = true;
  if (refreshing.value) {
    leftColumn.value = [];
    rightColumn.value = [];
    finished.value = false;
    refreshing.value = false;
  }
  const columnWidth = (document.body.clientWidth - 24) / 2; // 两列拆分，间距共24px
  const batch = mockData();
  for (const raw of batch) {
    const item = await measureItem(raw, columnWidth);
    const leftHeight = leftColumn.value.reduce((sum, it) => sum + it.height, 0);
    const rightHeight = rightColumn.value.reduce((sum, it) => sum + it.height, 0);
    if (leftHeight <= rightHeight) {
      leftColumn.value.push(item);
    } else {
      rightColumn.value.push(item);
    }
  }
  loading.value = false;
  if (leftColumn.value.length + rightColumn.value.length >= 40) {
    finished.value = true;
  }
}

function onRefresh() {
  refreshing.value = true;
  onLoad();
}

// 初始加载
onLoad();
</script>

<style scoped lang="less">
.waterfall-container {
  display: flex;
  gap: 12px;
  padding: 12px;
}
.column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.passage {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.img {
  width: 100%;
  display: block;
}
.content {
  padding: 8px;
}
.text {
  margin: 0 0 8px;
}
.community {
  margin: 0 0 8px;
}
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.user img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 4px;
}
.like-wrap {
  font-size: 12px;
  display: flex;
  align-items: center;
}
.like-wrap span {
  margin-left: 4px;
}
</style>
