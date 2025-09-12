<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ExportOutlined } from '@ant-design/icons-vue'
const btnList = ['单组份', '环氧', '聚氨酯']
const bottomBtnList = ['配方导入', '配方导出', '记录配方', '历史记录']
const activeBtnName = ref('单组份')
const formDataA = ref([
  {
    name: '08-038',
    desc: '60%601环氧树脂液',
    testQuality: '15.00',
    qualityScore: '9.55',
    mixQuality: '9.19',
    price: '￥17.00'
  }, {
    name: '06-054',
    desc: 'D650防沉剂',
    testQuality: '0.25',
    qualityScore: '0.16',
    mixQuality: '0.15',
    price: '￥48.67'
  }, {
    name: '06-003',
    desc: 'HF-140膨润土',
    testQuality: '1.25',
    qualityScore: '0.80',
    mixQuality: '0.77',
    price: '￥19.65'
  }, {
    name: '06-120',
    desc: '防腐基料',
    testQuality: '77.50',
    qualityScore: '49.36',
    mixQuality: '47.46',
    price: '￥24.14'
  }, {
    name: '08-025',
    desc: '2号混合溶剂',
    testQuality: '3.00',
    qualityScore: '1.91',
    mixQuality: '1.84',
    price: '￥7.00'
  }, {
    name: '04-001',
    desc: '石油混合二甲苯',
    testQuality: '45.00',
    qualityScore: '28.66',
    mixQuality: '27.56',
    price: '￥6.11'
  }, {
    name: '04-006',
    desc: '正丁醇',
    testQuality: '15.00',
    qualityScore: '9.55',
    mixQuality: '9.19',
    price: '￥6.73'
  }
])
const formDataB = ref([
  {
    name: '04-001',
    desc: '石油混合二甲苯',
    testQuality: '45.00',
    qualityScore: '28.66',
    mixQuality: '27.56',
    price: '￥6.11'
  }, {
    name: '04-006',
    desc: '正丁醇',
    testQuality: '15.00',
    qualityScore: '9.55',
    mixQuality: '9.19',
    price: '￥6.73'
  }, {
    name: '02-174',
    desc: 'WSCM-41115环氧固化剂',
    testQuality: '40.00',
    qualityScore: '40.00',
    mixQuality: '1.54',
    price: '￥27.17'
  }
])
onMounted(() => {
  for (let i = 0; i < 50; i++) {
    let item = {
      name: '',
      desc: '',
      testQuality: '',
      qualityScore: '',
      mixQuality: '',
      price: ''
    }
    formDataA.value.push(item)
    formDataB.value.push(item)
  }
})
</script>

<template>
  <div class="cont">
    <div class="btnCont">
      <div class="btnItem" v-for="btn in btnList" :key="btn" :class="{ activeBtn: activeBtnName === btn }"
        @click="activeBtnName = btn">
        {{ btn }}
      </div>
      <div class="bottomBtnCont">
        <div class="btnItem" v-for="btn in bottomBtnList" :key="btn" :class="{ activeBtn: activeBtnName === btn }"
          @click="activeBtnName = btn">
          {{ btn }}
        </div>
      </div>
    </div>
    <div class="formCont">
      <div class="tablesContainer">
        <div class="formItem">
          <div class="formTitle">组分A</div>
          <div class="tableWrapper">
            <table class="formInfo">
              <thead>
                <tr class="formInfoTitle">
                  <th>原料代码</th>
                  <th width="300px">原料描述</th>
                  <th>测试质量</th>
                  <th>质量分数%</th>
                  <th>混合后%</th>
                  <th>参考价</th>
                </tr>
              </thead>
              <tbody>
                <tr class="formInfoDetail" v-for="(item, index) in formDataA" :key="index">
                  <td>{{ item.name }}</td>
                  <td>{{ item.desc }}</td>
                  <td>{{ item.testQuality }}</td>
                  <td>{{ item.qualityScore }}</td>
                  <td>{{ item.mixQuality }}</td>
                  <td>{{ item.price }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="formItem">
          <div class="formTitle">组分B</div>
          <div class="tableWrapper">
            <table class="formInfo">
              <thead>
                <tr class="formInfoTitle">
                  <th>原料代码</th>
                  <th width="300px">原料描述</th>
                  <th>测试质量</th>
                  <th>质量分数%</th>
                  <th>混合后%</th>
                  <th>参考价</th>
                </tr>
              </thead>
              <tbody>
                <tr class="formInfoDetail" v-for="(item, index) in formDataB" :key="index">
                  <td>{{ item.name }}</td>
                  <td>{{ item.desc }}</td>
                  <td>{{ item.testQuality }}</td>
                  <td>{{ item.qualityScore }}</td>
                  <td>{{ item.mixQuality }}</td>
                  <td>{{ item.price }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="bottomForm">
        <div class="bottomFormItem">
          <div class="title">配方比重</div>
          <div class="info">
            <div title="组分A的比重">组分A的比重</div>
            <p>1.56</p>
            <p>g/cm3</p>
          </div>
          <div class="info">
            <div title="组分B的比重">组分B的比重</div>
            <p>1.56</p>
            <p>g/cm3</p>
          </div>
          <div class="info">
            <div title="混合物的比重">混合物的比重</div>
            <p>1.56</p>
            <p>g/cm3</p>
          </div>
        </div>
        <div class="bottomFormItem">
          <div class="title">配比</div>
          <div class="info infoSmall">
            <div title="组分A的质量比">组分A的质量比</div>
            <p>96.14</p>
            <p>wt%</p>
          </div>
          <div class="info infoSmall">
            <div>组分B的质量比</div>
            <p>3.86</p>
            <p>wt%</p>
          </div>
          <div class="info infoSmall">
            <div>组分A的体积比</div>
            <p>93.45</p>
            <p>v%</p>
          </div>
          <div class="info infoSmall">
            <div>组分B的体积比</div>
            <p>6.55</p>
            <p>v%</p>
          </div>
        </div>
        <div class="bottomFormItem">
          <div class="title">配方价格</div>
          <div class="info">
            <div>组分A的价格</div>
            <p>16.3</p>
            <p>RMB/kg</p>
          </div>
          <div class="info">
            <div>组分B的价格</div>
            <p>14.62</p>
            <p>RMB/kg</p>
          </div>
          <div class="info">
            <div>配方的价格</div>
            <p>16.24</p>
            <p>RMB/kg</p>
          </div>
        </div>
        <div class="bottomFormItem smallForm">
          <div class="title">固含A</div>
          <div class="info infoSmall">
            <div>质量固含(wt%)</div>
            <p>56.05</p>
            <p>wt%</p>
          </div>
          <div class="info infoSmall">
            <div>体积固含(v%)</div>
            <p>19.41</p>
            <p>wt%</p>
          </div>
          <div class="info infoSmall">
            <div>组分A的体积比</div>
            <p>93.45</p>
            <p>v%</p>
          </div>
          <div class="info infoSmall">
            <div>PVC</div>
            <p>60.4</p>
            <p>v%</p>
          </div>
        </div>
        <div class="bottomFormItem smallForm">
          <div class="title">固含B</div>
          <div class="info infoSmall">
            <div>质量固含(wt%)</div>
            <p>40</p>
            <p>wt%</p>
          </div>
          <div class="info infoSmall">
            <div>体积固含(v%)</div>
            <p>37.111</p>
            <p>wt%</p>
          </div>
          <div class="info infoSmall">
            <div>组分A的体积比</div>
            <p>0</p>
            <p>v%</p>
          </div>
          <div class="info infoSmall">
            <div>PVC</div>
            <p>0</p>
            <p>v%</p>
          </div>
        </div>
        <div class="bottomFormItem smallForm">
          <div class="title">固含混合</div>
          <div class="info infoSmall">
            <div>质量固含(wt%)</div>
            <p>40</p>
            <p>wt%</p>
          </div>
          <div class="info infoSmall">
            <div>体积固含(v%)</div>
            <p>37.111</p>
            <p>wt%</p>
          </div>
          <div class="info infoSmall">
            <div>组分A的体积比</div>
            <p>0</p>
            <p>v%</p>
          </div>
          <div class="info infoSmall">
            <div>PVC</div>
            <p>0</p>
            <p>v%</p>
          </div>
        </div>
        <div class="exportBtnCont">
          <ExportOutlined />
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="less">
.cont {
  width: 100%;
  height: 100vh;
  display: flex;

  .btnCont {
    width: 140px;
    height: 100%;
    box-sizing: border-box;
    padding: 24px 0;
    position: relative;
    border-right: 1px solid #cfcfcf;

    .bottomBtnCont {
      position: absolute;
      bottom: 0;
      width: 140px;
    }

    .btnItem {
      width: 110px;
      height: 40px;
      line-height: 35px;
      text-align: center;
      background: #fff;
      margin: 0 auto 20px;
      font-size: 16px;
      border-radius: 20px;
      border: 2px solid #d1d1d1;
      cursor: pointer;

      &:hover {
        background: #81b337;
        color: #fff;
      }
    }

    .activeBtn {
      background: #81b337;
      color: #fff;
    }
  }

  .formCont {
    width: calc(100% - 140px);
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    font-size: 12px;

    .tablesContainer {
      display: flex;
      flex: 1;
      overflow: hidden;
      margin-bottom: 138px; // 为底部表格留出空间
    }

    .formItem {
      width: 50%;
      box-sizing: border-box;
      height: 100%;
      display: flex;
      flex-direction: column;

      .formTitle {
        height: 24px;
        text-align: center;
        line-height: 24px;
        background: #f5f5f5;
        border: 1px solid #cfcfcf;
        flex-shrink: 0; // 防止标题被压缩
      }

      .tableWrapper {
        flex: 1;
        overflow: auto;
        border: 1px solid #cfcfcf;
        border-top: none;
      }

      .formInfo {
        width: 100%;
        border-collapse: collapse;
        position: relative;

        .formInfoTitle {
          background: #f5f5f5;
          height: 20px;
          border: 1px solid #cfcfcf;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .formInfoDetail {
          border: 1px solid #adadad;
          height: 28px;

          td {
            text-align: center;
          }
        }
      }
    }

    .bottomForm {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      height: 138px;
      display: flex;

      .exportBtnCont {
        width: 40px;
        background: #fff;
        border: 1px solid #cfcfcf;
        font-size: 24px;
        text-align: center;
        padding-top: 90px;
        color: #828282;
      }

      // .bottomFormItem {
      //   width: calc(50% / 3);
      //   height: 100%;
      //   border: 1px solid #cfcfcf;

      //   .title {
      //     height: 25%;
      //     display: flex;
      //     align-items: center;
      //     justify-content: center;
      //     background: #f5f5f5;

      //   }

      //   .info {
      //     height: 25%;
      //     display: flex;
      //     width: 100%;
      //     background: #fff;
      //     border-top: 1px solid #cfcfcf;

      //     div {
      //       width: calc(100% - 120px);
      //       height: 100%;
      //       padding-left: 6px;
      //       box-sizing: border-box;
      //       display: flex;
      //       align-items: center;
      //     }

      //     p {
      //       width: 60px;
      //       display: flex;
      //       align-items: center;
      //       border-left: 1px solid #c5c5c5;
      //       padding-left: 6px;
      //     }
      //   }

      //   .infoSmall {
      //     height: calc(75% / 4);
      //   }
      // }



      .bottomFormItem {
        width: calc(50% / 3);
        height: 100%;
        border: 1px solid #cfcfcf;

        .title {
          height: 25%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;

        }

        .info {
          height: 25%;
          display: flex;
          width: 100%;
          background: #fff;
          border-top: 1px solid #cfcfcf;

          div,
          p {
            flex: 1;
            min-width: 0; // 防止flex撑爆
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 4px;
            text-align: center;

            overflow: hidden; // 超出隐藏
            text-overflow: ellipsis; // 超出显示...
            white-space: nowrap; // 不换行
            cursor: help; // 鼠标提示
          }

          div:first-child {
            flex: none;
            width: 50%;
          }

          p {
            width: 60px;
            display: flex;
            text-align: center;
            align-items: center;
            word-break: break-word;
            border-left: 1px solid #c5c5c5;
            padding-left: 6px;
          }
        }

        .infoSmall {
          height: calc(75% / 4);
        }
      }

      .smallForm {
        width: calc((50% - 40px) / 3);
      }
    }
  }
}
</style>
