/*
环球挑战赛
活动时间：2021-02-02 至 2021-02-22
1个号可以助力5人，需要5人助力，如每天跑满能换1000+京豆
多个账号会相互互助
活动地址：https://gmart.jd.com/?appId=54935130
活动入口：京东app搜索京东国际-环球挑战赛
已支持IOS双京东账号,Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
============Quantumultx===============
[task_local]
#环球挑战赛
0 1,4,12,13 2-22 2 *   https://gitee.com/lxk0301/jd_scripts/raw/master/jd_global.js, tag=环球挑战赛, img-url=https://raw.githubusercontent.com/yogayyy/Scripts/main/Icon/lxk0301/jd_global.png, enabled=true

================Loon==============
[Script]
cron "0 1,4,12,13 2-22 2 *" script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_global.js,tag=环球挑战赛

===============Surge=================
环球挑战赛 = type=cron,cronexp="0 1,4,12,13 2-22 2 *",wake-system=1,timeout=3600,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_global.js

============小火箭=========
环球挑战赛 = type=cron,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_global.js, cronexpr="0 1,4,12,13 2-22 2 *", timeout=3600, enable=true
 */
const $ = new Env('环球挑战赛');

const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let jdNotify = true;//是否关闭通知，false打开通知推送，true关闭通知推送
const randomCount = $.isNode() ? 20 : 5;
//IOS等用户直接用NobyDa的jd cookie

let cookiesArr = [], cookie = '', message;
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {
  };
} else {
  let cookiesData = $.getdata('CookiesJD') || "[]";
  cookiesData = jsonParse(cookiesData);
  cookiesArr = cookiesData.map(item => item.cookie);
  cookiesArr.reverse();
  cookiesArr.push(...[$.getdata('CookieJD2'), $.getdata('CookieJD')]);
  cookiesArr.reverse();
  cookiesArr = cookiesArr.filter(item => item !== "" && item !== null && item !== undefined);
}

const JD_API_HOST = 'https://api.m.jd.com/', actCode = 'visa-card-001';
const inviteCodes = [
  'WmpHM2pndWh3OFphS2NsbTRLMmhqZz09@M3ozUGw0eExUZ25hSHBTZ2pJcTdpZz09@S2tETnZ0REtONy9Dc2Nqek1KNXpmWHFTNnF3OUtQQjJKZmJ2YUtSS3BQTT0=@a1RrenU1WExQaXRWS3VIZHgwMjlUYzJSeHhVMDlvZXgxR2RsdkZkRXZnOD0=@bHNsOVFIL2tQRTJhSndpRVNHVTlheXJLbzZRK09HaUtidjJUUFNQRXdqbz0=@M0JxTFVEbmxtV05uQWJVQVdyL2NxeTcycG1lcWtEbzVOc283bjR2MklkWT0=',
  'a1RrenU1WExQaXRWS3VIZHgwMjlUYzJSeHhVMDlvZXgxR2RsdkZkRXZnOD0=@bHNsOVFIL2tQRTJhSndpRVNHVTlheXJLbzZRK09HaUtidjJUUFNQRXdqbz0=@WmpHM2pndWh3OFphS2NsbTRLMmhqZz09@M3ozUGw0eExUZ25hSHBTZ2pJcTdpZz09@S2tETnZ0REtONy9Dc2Nqek1KNXpmWHFTNnF3OUtQQjJKZmJ2YUtSS3BQTT0=',
];
$.invites = [];
!(async () => {
  await requireConfig();
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      message = '';
      await TotalBean();
      console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      await shareCodesFormat()
      await jdGlobal()
    }
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.canHelp = true;
      for (let code of $.invites) {
        if (!code) continue
        await helpFriend(code)
        if(!$.canHelp) break
        await $.wait(1000)
      }
    }
  }
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })

async function jdGlobal() {
  try {
    $.earn = 0
    $.score = 0
    $.beans = 0
    await getHome()
    await getTask()
    await getHome(true)
    await helpFriends()
    await showMsg()
  } catch (e) {
    $.logErr(e)
  }
}

async function helpFriends() {
  $.canHelp = true
  for (let code of $.newShareCodes) {
    if (!code) continue
    await helpFriend(code)
    if(!$.canHelp) break
    await $.wait(1000)
  }
}


function showMsg() {
  return new Promise(resolve => {
    message += `本次运行获得${$.earn}里程，${$.beans}京豆，共计${$.score}里程`
    $.msg($.name, '', `京东账号${$.index}${$.nickName}\n${message}`);
    resolve()
  })
}

async function getHome(info = false) {
  return new Promise(resolve => {
    $.get(taskUrl("mainInfo", {"activityCode": actCode}), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['code'] === '0') {
              const {activityCalendar, activityStations} = data.result.data
              if (info) {
                $.earn = parseInt(data.result.data.mileageAmount) - $.score
                let station = activityStations.filter(vo => vo.unlock === true)
                for (let vo of station) {
                  let ids = []
                  for (let bo of vo.rewards) {
                    if (bo['unlock'] && !bo['received']) {
                      if (/^[0-9]+.?[0-9]*$/.test(bo['couponPrice'])) {
                        $.beans += parseInt(bo['couponPrice'])
                      }
                      console.log(`去领取 ${/^[0-9]+.?[0-9]*$/.test(bo['couponPrice']) ? bo['couponPrice'] + '京豆' : bo['couponPrice']} 奖励`)
                      ids.push(bo['id'])
                    }
                  }
                  if (ids.length) {
                    await receiveReward({"stationId": vo['id'], "rewardIds": ids, "activityCode": actCode})
                    await $.wait(1000)
                  }
                }
              } else {
                console.log(`当前活动：第${activityCalendar.currDays}/${activityCalendar.totalDays}天`)
              }
              $.score = parseInt(data.result.data.mileageAmount)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

async function getTask() {
  return new Promise(resolve => {
    $.get(taskUrl("myTask", {"activityCode": actCode}), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['code'] === '0') {
              const {timeLimitTask, commonTask} = data.result.data
              let task = [...timeLimitTask, ...commonTask]
              for (let vo of task) {
                if (vo['taskName'] === '每日邀请好友') {
                  console.log(`您的好友助力码为 ${vo['jingCommand']['keyOpenapp'].match(/masterPin":"(.*)","/)[1]}`)
                  $.invites.push(vo['jingCommand']['keyOpenapp'].match(/masterPin":"(.*)","/)[1]);
                }
                if (['70', '50', '30', '40'].includes(vo['taskType'])) {
                  if (vo['executedTimes'] === vo['totalTimes']) {
                    console.log(`${vo['taskName']}任务已完成`)
                  } else {
                    console.log(`去做${vo['taskName']}任务`)
                    for (let i = vo['executedTimes']; i < vo['totalTimes']; ++i) {
                      await doTask({
                        "taskId": vo['taskId'],
                        "itemId": vo['itemId'],
                        "viewSeconds": vo['viewSeconds'],
                        "activityCode": actCode
                      })
                    }
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

async function doTask(body) {
  return new Promise(resolve => {
    $.get(taskUrl("taskRun", body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['code'] === '0') {
              console.log(data['result']['message'])

            } else {
              console.log(JSON.stringify(data))
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

async function helpFriend(inviterPin) {
  return new Promise(resolve => {
    $.get(taskUrl("inviteHelp", {
      "inviterPin": inviterPin,
      "taskId": "3",
      "pageType": "doHelp",
      "headImg": "",
      "username": "",
      "activityCode": actCode
    }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['code'] === '0') {
              console.log(data['result']['message'])
              if(data['result']['message']==='您今天的助力次数已达上限，明天再试试吧~') $.canHelp = false
            } else {
              console.log(JSON.stringify(data))
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

async function receiveReward(body) {
  return new Promise(resolve => {
    $.get(taskUrl("receiveRewardVisa", body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['code'] === '0') {
              console.log(data['result']['message'])

            } else {
              console.log(JSON.stringify(data))
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function readShareCode() {
  console.log(`开始`)
  return new Promise(async resolve => {
    $.get({
      url: `http://jd.turinglabs.net/api/v2/jd/jdglobal/read/${randomCount}/`,
      'timeout': 10000
    }, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            console.log(`随机取${randomCount}个码放到您固定的互助码后面(不影响已有固定互助)`)
            data = JSON.parse(data);
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
    await $.wait(10000);
    resolve()
  })
}

//格式化助力码
function shareCodesFormat() {
  return new Promise(async resolve => {
    // console.log(`第${$.index}个京东账号的助力码:::${$.shareCodesArr[$.index - 1]}`)
    $.newShareCodes = [];
    if ($.shareCodesArr[$.index - 1]) {
      $.newShareCodes = $.shareCodesArr[$.index - 1].split('@');
    } else {
      console.log(`由于您第${$.index}个京东账号未提供shareCode,将采纳本脚本自带的助力码\n`)
      const tempIndex = $.index > inviteCodes.length ? (inviteCodes.length - 1) : ($.index - 1);
      $.newShareCodes = inviteCodes[tempIndex].split('@');
    }
    const readShareCodeRes = await readShareCode();
    if (readShareCodeRes && readShareCodeRes.code === 200) {
      $.newShareCodes = [...new Set([...$.newShareCodes, ...(readShareCodeRes.data || [])])];
    }
    console.log(`第${$.index}个京东账号将要助力的好友${JSON.stringify($.newShareCodes)}`)
    resolve();
  })
}

function requireConfig() {
  return new Promise(resolve => {
    console.log(`开始获取${$.name}配置文件\n`);
    //Node.js用户请在jdCookie.js处填写京东ck;
    let shareCodes = []
    console.log(`共${cookiesArr.length}个京东账号\n`);
    if ($.isNode() && process.env.JDGLOBAL_SHARECODES) {
      if (process.env.JDGLOBAL_SHARECODES.indexOf('\n') > -1) {
        shareCodes = process.env.JDGLOBAL_SHARECODES.split('\n');
      } else {
        shareCodes = process.env.JDGLOBAL_SHARECODES.split('&');
      }
    }
    $.shareCodesArr = [];
    if ($.isNode()) {
      Object.keys(shareCodes).forEach((item) => {
        if (shareCodes[item]) {
          $.shareCodesArr.push(shareCodes[item])
        }
      })
    }
    console.log(`您提供了${$.shareCodesArr.length}个账号的${$.name}PK助力码\n`);
    resolve()
  })
}

function taskUrl(function_id, body = {}) {
  return {
    url: `${JD_API_HOST}/client.action?functionId=${function_id}&body=${escape(JSON.stringify(body))}&appid=global_mart&time=${new Date().getTime()}`,
    headers: {
      "Cookie": cookie,
      "origin": "https://h5.m.jd.com",
      "referer": "https://h5.m.jd.com/",
      'Content-Type': 'application/x-www-form-urlencoded',
      "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0")
    }
  }
}

function taskPostUrl(function_id, body = {}, function_id2) {
  let url = `${JD_API_HOST}`;
  if (function_id2) {
    url += `?functionId=${function_id2}`;
  }
  return {
    url,
    body: `functionId=${function_id}&body=${escape(JSON.stringify(body))}&client=wh5&clientVersion=1.0.0`,
    headers: {
      "Cookie": cookie,
      "origin": "https://h5.m.jd.com",
      "referer": "https://h5.m.jd.com/",
      'Content-Type': 'application/x-www-form-urlencoded',
      "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0")
    }
  }
}

function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
      "headers": {
        "Accept": "application/json,text/plain, */*",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        "Connection": "keep-alive",
        "Cookie": cookie,
        "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0")
      }
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === 13) {
              $.isLogin = false; //cookie过期
              return
            }
            $.nickName = data['base'].nickname;
          } else {
            console.log(`京东服务器返回空数据`)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function safeGet(data) {
  try {
    if (typeof JSON.parse(data) == "object") {
      return true;
    }
  } catch (e) {
    console.log(e);
    console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
    return false;
  }
}

function jsonParse(str) {
  if (typeof str == "string") {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(e);
      $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
      return [];
    }
  }
}

// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHy")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try
