/* =========================================================
   守夜人 · 智慧社区智慧养老互动科普 H5
   交互逻辑：原生 JavaScript，无第三方依赖
   ========================================================= */

(function () {
  "use strict";

  const MAX_SCORE = 90;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const behavior = reduceMotion ? "auto" : "smooth";

  const state = {
    stepIndex: 0,
    answered: false,
    score: 0,
    results: [],
    sensorStage: 0,
    textLarge: false
  };

  const steps = [
    {
      id: "verify",
      tag: "第一反应 · 02:37",
      title: "告警响了，你先做什么？",
      body: "雷达捕捉到“快速下坠 → 30 秒静止”，但一键呼叫没有按下。值班室离李阿姨家步行 2 分钟。",
      options: [
        {
          key: "rush",
          label: "立刻跑上楼，推门进去把人扶起来",
          note: "关心很及时，但先确认、再行动会更稳。",
          score: 5,
          verdict: "partial",
          feedbackTitle: "关心是对的，顺序还能更好",
          feedback: "先语音确认，同时让物业拿备用钥匙上楼。给自己 30 秒时限；无应答立即升级。若真跌倒，也不要急着扶起——先判断伤情。",
          source: "中国疾控中心《预防老年人跌倒健康教育核心信息》第 13 条",
          sourceHref: "#source-3",
          badge: "先验证"
        },
        {
          key: "voice",
          label: "先打开双向语音：“李阿姨，您还好吗？”",
          note: "同时让物业拿备用钥匙，30 秒无应答就升级。",
          score: 30,
          verdict: "good",
          feedbackTitle: "对，先验证，再行动",
          feedback: "报警是“待验证的异常”，不是诊断。先以最低打扰确认，同时准备上门；30 秒无应答，立即升级。",
          source: "",
          sourceHref: "",
          badge: "先验证"
        },
        {
          key: "ignore",
          label: "可能只是翻身，先静音，明早再说",
          note: "",
          score: 0,
          verdict: "bad",
          feedbackTitle: "这一步最危险",
          feedback: "夜间异常被静音，可能错过帮助窗口。可以验证，但不要关闭告警。",
          source: "",
          sourceHref: "",
          badge: "先验证"
        }
      ]
    },
    {
      id: "escalate",
      tag: "应急联动 · 02:38",
      title: "无人应答，通知谁？",
      body: "语音里没有回应，门磁仍显示关闭。女儿住在 20 分钟车程外，物业值班室步行 2 分钟。",
      options: [
        {
          key: "daughter",
          label: "只给女儿发微信，等她回复再说",
          note: "微信不一定被及时看到，响应链容易卡住。",
          score: 5,
          verdict: "partial",
          feedbackTitle: "少了一个并行的支点",
          feedback: "微信不一定被及时看到。紧急情况要“并行通知”，不是排队等回复。最近的人先到，家属同步知情，120 给出专业评估。",
          source: "中国疾控中心《预防老年人跌倒健康教育核心信息》第 13 条",
          sourceHref: "#source-3",
          badge: "会联动"
        },
        {
          key: "chain",
          label: "同时联系物业上门、女儿电话、120 评估",
          note: "三条线并行，谁近谁先到。",
          score: 30,
          verdict: "good",
          feedbackTitle: "对，应急链要并行",
          feedback: "最近的人先到，家属同步知情，120 给出专业评估。不要只依赖一个联系人，也不要让“等回复”拖慢现场处置。",
          source: "",
          sourceHref: "",
          badge: "会联动"
        },
        {
          key: "wait",
          label: "可能睡沉了，等天亮再处理",
          note: "",
          score: 0,
          verdict: "bad",
          feedbackTitle: "这一等，可能错过帮助窗口",
          feedback: "无人应答 + 长时间静止，是需要升级的信号。可以继续求证，但不能把处置推到天亮。",
          source: "",
          sourceHref: "",
          badge: "会联动"
        }
      ]
    },
    {
      id: "firstaid",
      tag: "现场急救 · 02:44",
      title: "进门后，她喊髋部疼",
      body: "物业已进门，120 已接通。李阿姨意识清醒，能说话，但一动髋部就疼，无法自己站起。",
      options: [
        {
          key: "lift",
          label: "赶紧扶她坐起来，喝口水缓一缓",
          note: "怀疑骨折时，搬动可能加重损伤。",
          score: 0,
          verdict: "bad",
          feedbackTitle: "先别急着扶，也别喂水",
          feedback: "不要盲目扶起或喂水。怀疑髋部骨折时，搬动可能加重损伤；意识不清时喂水还有呛咳风险。",
          source: "中国疾控中心《预防老年人跌倒健康教育核心信息》第 13 条",
          sourceHref: "#source-3",
          badge: "不盲动"
        },
        {
          key: "stay",
          label: "保持原位、注意保暖，按 120 调度员指导",
          note: "先判断意识、呼吸和伤情，不随意搬动。",
          score: 30,
          verdict: "good",
          feedbackTitle: "对，先判断伤情，再科学帮助",
          feedback: "先判断意识、呼吸和伤情，不随意搬动，注意保暖，等待专业急救。若老人意识不清或伤情严重，立即拨打急救电话。",
          source: "中国疾控中心《预防老年人跌倒健康教育核心信息》第 13 条",
          sourceHref: "#source-3",
          badge: "不盲动"
        },
        {
          key: "video",
          label: "拍段视频发到邻里群，问大家怎么办",
          note: "邻里关心很温暖，但急救不能靠群聊投票。",
          score: 0,
          verdict: "bad",
          feedbackTitle: "先打 120，再谈其他",
          feedback: "邻里关心很温暖，但急救不能靠群聊投票。先拨打 120，按调度员指导处理；拍摄和转发还可能带来隐私风险。",
          source: "",
          sourceHref: "",
          badge: "不盲动"
        }
      ]
    }
  ];

  const sensorStages = [
    {
      radar: ["疑似跌倒", "warning"],
      door: ["关闭", "ok"],
      call: ["未触发", "idle"],
      events: [
        { time: "02:36:58", text: "雷达检测到快速下坠", alert: false },
        { time: "02:37:04", text: "体动消失，持续 30 秒", alert: true },
        { time: "02:37:08", text: "平台生成一级告警", alert: true }
      ]
    },
    {
      radar: ["无应答", "warning"],
      door: ["关闭", "ok"],
      call: ["未触发", "idle"],
      events: [
        { time: "02:36:58", text: "雷达检测到快速下坠", alert: false },
        { time: "02:37:04", text: "体动消失，持续 30 秒", alert: true },
        { time: "02:37:08", text: "平台生成一级告警", alert: true },
        { time: "02:38:10", text: "双向语音：无应答", alert: true }
      ]
    },
    {
      radar: ["人员在场", "ok"],
      door: ["开启", "ok"],
      call: ["120 已接通", "warning"],
      events: [
        { time: "02:36:58", text: "雷达检测到快速下坠", alert: false },
        { time: "02:37:04", text: "体动消失，持续 30 秒", alert: true },
        { time: "02:37:08", text: "平台生成一级告警", alert: true },
        { time: "02:38:10", text: "双向语音：无应答", alert: true },
        { time: "02:39:20", text: "物业：已上门", alert: false },
        { time: "02:40:05", text: "120：已接通", alert: false }
      ]
    },
    {
      radar: ["等待急救", "warning"],
      door: ["开启", "ok"],
      call: ["通话中", "warning"],
      events: [
        { time: "02:36:58", text: "雷达检测到快速下坠", alert: false },
        { time: "02:37:04", text: "体动消失，持续 30 秒", alert: true },
        { time: "02:37:08", text: "平台生成一级告警", alert: true },
        { time: "02:38:10", text: "双向语音：无应答", alert: true },
        { time: "02:39:20", text: "物业：已上门", alert: false },
        { time: "02:40:05", text: "120：已接通", alert: false },
        { time: "02:44:30", text: "现场：保持原位、注意保暖", alert: false }
      ]
    }
  ];

  const timeData = {
    morning: {
      label: "起床时刻",
      title: "06:30 · 起床",
      desc: "从躺到坐、再到站，是老年人容易头晕和跌倒的时刻。设备可以记录“离床”，但起身稳不稳，仍需要人观察。",
      can: "床垫或雷达记录离床时间；长时间未回床，推送提醒给联系人。",
      cannot: "不能判断头晕、低血糖或体位性低血压；一句“您慢点”仍然重要。"
    },
    medicine: {
      label: "服药时刻",
      title: "08:00 · 服药",
      desc: "慢病老人常要按时吃药。提醒能减少“忘了”，但吃没吃、吃得对不对，是另一回事。",
      can: "智能药盒亮灯、语音提醒，记录开盖时间；可同步给照护者。",
      cannot: "不能替医生调整处方；开盖也不等于真的服下，不能据此判断疗效。"
    },
    cooking: {
      label: "做饭时刻",
      title: "12:00 · 做饭",
      desc: "厨房同时有火、电、油和水，是居家安全的重要场景。报警器要装对位置，也要定期测试。",
      can: "燃气或烟感报警；若联动装置合规，可自动关阀、切断气源。",
      cannot: "设备会老化、会没电；报警后仍要人确认，不能把“装了”当成“永远安全”。"
    },
    walk: {
      label: "散步时刻",
      title: "18:00 · 散步",
      desc: "出门走走对身心都好。定位和电子围栏能减少“找不到人”的焦虑，但不能代替陪伴。",
      can: "手环或手机定位、电子围栏；偏离常走路线时提醒家属。",
      cannot: "定位有误差，也可能没电；不能预防所有跌倒，更不能替代现实中的照看。"
    },
    night: {
      label: "睡眠时刻",
      title: "02:37 · 睡眠",
      desc: "夜间是响应链最容易被拉长的时段。雷达能在不拍画面的前提下，捕捉体动与呼吸的变化。",
      can: "毫米波雷达监测体动、呼吸趋势；异常静止时发出告警。",
      cannot: "不是诊断，可能误报或漏报；必须有人确认、上门和持续维护。"
    }
  };

  const $ = (selector, root) => (root || document).querySelector(selector);
  const $$ = (selector, root) => Array.prototype.slice.call((root || document).querySelectorAll(selector));

  const scenarioContent = $("#scenarioContent");
  const feedbackEl = $("#feedback");
  const stepLabel = $("#stepLabel");
  const scoreLabel = $("#scoreLabel");
  const progressBar = $("#progressBar");
  const reportSection = $("#report");
  const scoreRing = $("#scoreRing");
  const scoreValue = $("#scoreValue");
  const reportLead = $("#reportLead");
  const badgeList = $("#badgeList");
  const shareModal = $("#shareModal");
  const shareImage = $("#shareImage");
  const downloadCard = $("#downloadCard");
  const copyStatus = $("#copyStatus");

  /* ---------- 模拟器 ---------- */

  function renderStep() {
    const step = steps[state.stepIndex];
    state.answered = false;
    feedbackEl.hidden = true;
    feedbackEl.className = "feedback";
    feedbackEl.innerHTML = "";

    stepLabel.textContent = "判断 " + (state.stepIndex + 1) + " / " + steps.length;
    scoreLabel.textContent = "守护值 " + state.score + " / " + MAX_SCORE;
    progressBar.style.width = (state.stepIndex / steps.length) * 100 + "%";

    scenarioContent.innerHTML =
      '<span class="scenario-tag">' + step.tag + "</span>" +
      '<h3 tabindex="-1">' + step.title + "</h3>" +
      '<p class="scenario-body">' + step.body + "</p>" +
      '<div class="options" role="group" aria-label="请选择一个做法">' +
      step.options
        .map(function (option, index) {
          return (
            '<button class="option-btn" type="button" data-option="' + index + '">' +
            '<span class="option-letter">' + String.fromCharCode(65 + index) + "</span>" +
            "<span><strong>" + option.label + "</strong>" +
            (option.note ? '<small class="option-note">' + option.note + "</small>" : "") +
            "</span></button>"
          );
        })
        .join("") +
      "</div>";

    $$(".option-btn", scenarioContent).forEach(function (button) {
      button.addEventListener("click", function () {
        chooseOption(Number(button.getAttribute("data-option")));
      });
    });
  }

  function chooseOption(optionIndex) {
    if (state.answered) return;
    const step = steps[state.stepIndex];
    const option = step.options[optionIndex];
    if (!option) return;

    state.answered = true;
    state.score += option.score;
    state.results.push({
      stepId: step.id,
      key: option.key,
      score: option.score,
      verdict: option.verdict,
      badge: option.badge
    });

    const buttons = $$(".option-btn", scenarioContent);
    const correctIndex = step.options.findIndex(function (item) {
      return item.score === 30;
    });

    buttons.forEach(function (button, index) {
      button.disabled = true;
      if (index === correctIndex) button.classList.add("is-correct");
      if (index === optionIndex && index !== correctIndex) button.classList.add("is-wrong");
      if (index !== optionIndex && index !== correctIndex) button.classList.add("is-dimmed");
    });

    scoreLabel.textContent = "守护值 " + state.score + " / " + MAX_SCORE;
    progressBar.style.width = ((state.stepIndex + 1) / steps.length) * 100 + "%";

    const sourceHtml = option.source
      ? '<a class="feedback-source" href="' + option.sourceHref + '">依据：' + option.source + " ↗</a>"
      : "";

    feedbackEl.className = "feedback " + option.verdict;
    feedbackEl.innerHTML =
      '<div class="feedback-head">' +
      '<svg class="icon" aria-hidden="true"><use href="#' + (option.verdict === "good" ? "i-check" : "i-alert") + '"></use></svg>' +
      option.feedbackTitle +
      "</div>" +
      '<p class="feedback-body">' + option.feedback + "</p>" +
      sourceHtml +
      '<button class="next-btn" type="button" id="nextBtn">' +
      (state.stepIndex === steps.length - 1 ? "查看守夜报告" : "下一步") +
      ' <svg class="icon" aria-hidden="true"><use href="#i-arrow"></use></svg></button>';
    feedbackEl.hidden = false;

    applySensorStage(state.stepIndex + 1);
    $("#nextBtn").addEventListener("click", goNext);

    window.setTimeout(function () {
      feedbackEl.scrollIntoView({ behavior: behavior, block: "nearest" });
    }, 40);
  }

  function goNext() {
    if (state.stepIndex === steps.length - 1) {
      finishSimulation();
      return;
    }
    state.stepIndex += 1;
    renderStep();
    const heading = $("h3", scenarioContent);
    if (heading) {
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ behavior: behavior, block: "start" });
    }
  }

  function applySensorStage(stage) {
    const data = sensorStages[Math.max(0, Math.min(stage, sensorStages.length - 1))];
    state.sensorStage = stage;

    setDevice("#radarStatus", "#radarLight", data.radar);
    setDevice("#doorStatus", "#doorLight", data.door);
    setDevice("#callStatus", "#callLight", data.call);

    $("#eventList").innerHTML = data.events
      .map(function (event) {
        return (
          "<li" + (event.alert ? ' class="is-alert"' : "") + ">" +
          "<time>" + event.time + "</time>" +
          "<span>" + event.text + "</span></li>"
        );
      })
      .join("");
  }

  function setDevice(textSelector, lightSelector, pair) {
    const textEl = $(textSelector);
    const lightEl = $(lightSelector);
    if (textEl) textEl.textContent = pair[0];
    if (lightEl) lightEl.className = "device-light " + pair[1];
  }

  function finishSimulation() {
    renderReport();
    reportSection.hidden = false;
    stepLabel.textContent = "已完成 " + steps.length + " / " + steps.length;
    progressBar.style.width = "100%";
    const reportTitle = $("#reportTitle");
    if (reportTitle) reportTitle.focus({ preventScroll: true });
    window.setTimeout(function () {
      reportSection.scrollIntoView({ behavior: behavior, block: "start" });
    }, 50);
  }

  function renderReport() {
    const total = state.score;
    const pct = Math.max(0, Math.min(100, (total / MAX_SCORE) * 100));
    scoreRing.style.setProperty("--score-pct", pct);
    scoreValue.textContent = total;

    if (total >= 90) {
      reportLead.textContent = "三项判断全部到位。你已经有了一张靠谱的“夜间响应路线图”：先验证、会联动、不盲动。";
    } else if (total >= 60) {
      reportLead.textContent = "主线判断基本稳，个别环节还能更稳。守夜不是靠勇气，而是靠一条每个人都接得住的流程。";
    } else {
      reportLead.textContent = "别灰心，守夜不是靠勇气，是靠流程。下面三条，就是下次可以立刻用上的“补丁”。";
    }

    const labels = ["先验证", "会联动", "不盲动"];
    const resultMap = {};
    state.results.forEach(function (result) {
      resultMap[result.stepId] = result;
    });

    badgeList.innerHTML = steps
      .map(function (step, index) {
        const result = resultMap[step.id];
        const passed = result && result.score === 30;
        return (
          '<span class="badge' + (passed ? "" : " is-missed") + '">' +
          '<svg class="icon" aria-hidden="true"><use href="#' + (passed ? "i-check" : "i-alert") + '"></use></svg>' +
          labels[index] + (passed ? " · 已掌握" : " · 再练一次") +
          "</span>"
        );
      })
      .join("");
  }

  function resetSimulation() {
    state.stepIndex = 0;
    state.answered = false;
    state.score = 0;
    state.results = [];
    state.sensorStage = 0;
    reportSection.hidden = true;
    applySensorStage(0);
    renderStep();
    $("#simulator").scrollIntoView({ behavior: behavior, block: "start" });
  }

  /* ---------- 24 小时时间轴 ---------- */

  const timeNodes = $$(".time-node");

  function selectTime(key) {
    const data = timeData[key];
    if (!data) return;

    timeNodes.forEach(function (node) {
      const active = node.getAttribute("data-time") === key;
      node.classList.toggle("is-active", active);
      node.setAttribute("aria-selected", active ? "true" : "false");
    });

    $("#timeLabel").textContent = data.label;
    $("#timeTitle").textContent = data.title;
    $("#timeDesc").textContent = data.desc;
    $("#timeCan").textContent = data.can;
    $("#timeCannot").textContent = data.cannot;

    const detail = $("#timeDetail");
    if (!reduceMotion && detail && detail.animate) {
      detail.animate(
        [
          { opacity: 0.35, transform: "translateY(5px)" },
          { opacity: 1, transform: "translateY(0)" }
        ],
        { duration: 260, easing: "ease-out" }
      );
    }
  }

  timeNodes.forEach(function (node) {
    node.addEventListener("click", function () {
      selectTime(node.getAttribute("data-time"));
    });
  });

  const timeline = $(".timeline");
  if (timeline) {
    timeline.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      const current = timeNodes.indexOf(document.activeElement);
      if (current < 0) return;
      event.preventDefault();
      const next =
        event.key === "ArrowRight"
          ? (current + 1) % timeNodes.length
          : (current - 1 + timeNodes.length) % timeNodes.length;
      timeNodes[next].focus();
      timeNodes[next].click();
    });
  }

  /* ---------- 隐私开关 ---------- */

  const privacyAlert = $("#privacyAlert");
  const privacyCamera = $("#privacyCamera");
  const privacyLocation = $("#privacyLocation");
  const privacyNote = $("#privacyNote");
  const privacyScore = $("#privacyScore");
  const privacyVerdict = $("#privacyVerdict");
  const meterRing = $("#meterRing");

  function updatePrivacy() {
    let score = 100;
    if (!privacyAlert.checked) score -= 35;
    if (privacyCamera.checked) score -= 35;
    if (privacyLocation.checked) score -= 30;
    score = Math.max(0, score);

    privacyScore.textContent = score;
    meterRing.style.setProperty("--privacy-pct", score);

    let color = "var(--mint)";
    let verdict = "边界感很好";
    if (score < 70) {
      color = "var(--coral)";
      verdict = "需要调整";
    } else if (score < 90) {
      color = "var(--amber)";
      verdict = "基本稳妥";
    }

    meterRing.style.background =
      "conic-gradient(" + color + " " + score + "%, rgba(255,255,255,0.08) 0)";
    privacyVerdict.textContent = verdict;
    privacyVerdict.style.color = color;

    if (privacyCamera.checked) {
      privacyNote.textContent =
        "卧室摄像头可能拍到更衣、起夜等私密场景。建议改用不成像的雷达，或至少征得本人明确同意，并限定角度与时段。";
    } else if (privacyLocation.checked) {
      privacyNote.textContent =
        "位置共享范围过大，容易变成“被盯着”。只共享给必要的人，并设置有效期和退出方式。";
    } else if (!privacyAlert.checked) {
      privacyNote.textContent =
        "紧急联系人收不到告警，技术就失去了响应链。隐私保护不等于切断求助。";
    } else {
      privacyNote.textContent =
        "当前设置：只把异常事件发给该响应的人，边界感很好。";
    }
  }

  [privacyAlert, privacyCamera, privacyLocation].forEach(function (input) {
    input.addEventListener("change", updatePrivacy);
  });

  /* ---------- 识伪卡 ---------- */

  const mythCards = $$(".myth-card");
  const mythProgress = $("#mythProgress");
  let revealed = 0;

  mythCards.forEach(function (card) {
    const toggle = $(".myth-toggle", card);
    const answer = $(".myth-answer", card);
    toggle.addEventListener("click", function () {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", open ? "false" : "true");
      answer.hidden = open;
      card.classList.toggle("is-open", !open);

      if (!open && card.getAttribute("data-revealed") !== "true") {
        card.setAttribute("data-revealed", "true");
        revealed += 1;
        mythProgress.textContent =
          revealed >= mythCards.length
            ? "已翻开 4 / 4 张真相卡 · 技术是哨兵，不是医生。"
            : "已翻开 " + revealed + " / 4 张真相卡";
      }
    });
  });

  /* ---------- 字号 ---------- */

  const textToggle = $("#textToggle");
  const textLabel = $(".text-toggle-label", textToggle);

  function applyTextMode(large, persist) {
    state.textLarge = large;
    document.documentElement.setAttribute("data-text", large ? "large" : "normal");
    textToggle.setAttribute("aria-pressed", large ? "true" : "false");
    textLabel.textContent = large ? "标准字号" : "大字模式";
    if (persist) {
      try {
        window.localStorage.setItem("nightwatch-text", large ? "large" : "normal");
      } catch (error) {
        /* 本地存储不可用时，字号仍会在当前页面生效 */
      }
    }
  }

  try {
    const saved = window.localStorage.getItem("nightwatch-text");
    if (saved === "large") applyTextMode(true, false);
  } catch (error) {
    /* 忽略隐私模式下的存储限制 */
  }

  textToggle.addEventListener("click", function () {
    applyTextMode(!state.textLarge, true);
  });

  /* ---------- 首屏开始按钮 ---------- */

  $$(".js-start").forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const simulator = $("#simulator");
      simulator.scrollIntoView({ behavior: behavior, block: "start" });
      window.setTimeout(function () {
        const firstOption = $(".option-btn", scenarioContent);
        if (firstOption) firstOption.focus({ preventScroll: true });
      }, reduceMotion ? 0 : 450);
    });
  });

  /* ---------- 滚动进度 ---------- */

  const scrollProgress = $("#scrollProgress");
  function updateScrollProgress() {
    const root = document.documentElement;
    const max = root.scrollHeight - root.clientHeight;
    const pct = max > 0 ? (root.scrollTop / max) * 100 : 0;
    scrollProgress.style.width = Math.max(0, Math.min(100, pct)) + "%";
  }
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress);
  updateScrollProgress();

  /* ---------- 守夜卡 ---------- */

  let lastFocused = null;
  let cardDataUrl = "";

  function roundRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    const chars = Array.from(text);
    const lines = [];
    let line = "";
    const limit = maxLines || 3;

    chars.forEach(function (char) {
      const next = line + char;
      if (line && ctx.measureText(next).width > maxWidth) {
        lines.push(line);
        line = char;
      } else {
        line = next;
      }
    });
    if (line) lines.push(line);

    lines.slice(0, limit).forEach(function (item, index) {
      const suffix = index === limit - 1 && lines.length > limit ? "…" : "";
      ctx.fillText(item + suffix, x, y + index * lineHeight);
    });

    return y + Math.min(lines.length, limit) * lineHeight;
  }

  function drawCheck(ctx, x, y) {
    ctx.save();
    ctx.strokeStyle = "#7ee0c1";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 11, y);
    ctx.lineTo(x - 3, y + 8);
    ctx.lineTo(x + 13, y - 9);
    ctx.stroke();
    ctx.restore();
  }

  function buildShareCard() {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1440;
    const ctx = canvas.getContext("2d");

    const bg = ctx.createLinearGradient(0, 0, 700, 1440);
    bg.addColorStop(0, "#102b3f");
    bg.addColorStop(0.52, "#0a1b2a");
    bg.addColorStop(1, "#06111b");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1080, 1440);

    const glow = ctx.createRadialGradient(840, 90, 10, 840, 90, 520);
    glow.addColorStop(0, "rgba(255,178,107,0.22)");
    glow.addColorStop(0.55, "rgba(255,178,107,0.06)");
    glow.addColorStop(1, "rgba(255,178,107,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1080, 800);

    function seeded(index) {
      const value = Math.sin(index * 12.9898) * 43758.5453;
      return value - Math.floor(value);
    }

    for (let i = 0; i < 52; i++) {
      const x = seeded(i + 1) * 1080;
      const y = seeded(i + 90) * 760;
      const r = seeded(i + 200) * 1.8 + 0.5;
      ctx.beginPath();
      ctx.fillStyle = "rgba(240,248,252," + (0.18 + seeded(i + 300) * 0.42) + ")";
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 右上角雷达/月亮图形
    ctx.save();
    ctx.strokeStyle = "rgba(126,224,193,0.18)";
    ctx.lineWidth = 2;
    [110, 170, 235].forEach(function (radius) {
      ctx.beginPath();
      ctx.arc(865, 185, radius, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.fillStyle = "rgba(255,178,107,0.16)";
    ctx.beginPath();
    ctx.arc(865, 185, 64, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffb26b";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(865, 185, 28, 0.45, Math.PI * 1.75);
    ctx.stroke();
    ctx.fillStyle = "#7ee0c1";
    ctx.beginPath();
    ctx.arc(944, 108, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "#7ee0c1";
    ctx.font = '600 25px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.letterSpacing = "4px";
    ctx.fillText("FAMILY NIGHT WATCH", 90, 96);

    ctx.fillStyle = "#a6b8c6";
    ctx.font = '400 23px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillText("守夜人 · 家庭守夜卡", 90, 132);

    ctx.fillStyle = "#f4f1e9";
    ctx.font = '700 74px "Songti SC", "STSong", "SimSun", serif';
    ctx.fillText("今晚，谁守这盏灯？", 90, 258);

    ctx.fillStyle = "#ffb26b";
    ctx.font = '400 30px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillText("给爸妈的夜间守护清单", 90, 330);

    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(90, 360);
    ctx.lineTo(990, 360);
    ctx.stroke();

    const items = [
      "报警先验证：语音确认，30 秒无应答立即升级。",
      "通知要并行：物业、子女、120 同时启动。",
      "急救不盲动：先判断伤情，保暖，听 120 指导。"
    ];

    let y = 450;
    items.forEach(function (item) {
      drawCheck(ctx, 118, y - 9);
      ctx.fillStyle = "#dce6ed";
      ctx.font = '400 32px "Microsoft YaHei", "PingFang SC", sans-serif';
      const nextY = wrapCanvasText(ctx, item, 170, y, 790, 47, 2);
      y = Math.max(nextY + 48, y + 120);
    });

    ctx.fillStyle = "rgba(255,255,255,0.06)";
    roundRect(ctx, 90, 850, 900, 230, 24);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,210,122,0.18)";
    ctx.stroke();

    ctx.fillStyle = "#a6b8c6";
    ctx.font = '400 24px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillText("本次守护值", 120, 905);

    ctx.fillStyle = "#ffb26b";
    ctx.font = '600 96px "Songti SC", "STSong", "SimSun", serif';
    ctx.fillText(String(state.score), 120, 1015);

    ctx.fillStyle = "#7f95a6";
    ctx.font = '400 28px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillText("/ 90", 285, 1010);

    ctx.fillStyle = "#dce6ed";
    ctx.font = '400 26px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillText("三项判断，决定夜里那条响应链有多稳。", 420, 930);
    ctx.fillStyle = "#a6b8c6";
    ctx.font = '400 23px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillText("分数只记录本次模拟，不代表真实安全能力。", 420, 972);

    ctx.fillStyle = "#f4f1e9";
    ctx.font = '400 30px "Songti SC", "STSong", "SimSun", serif';
    ctx.fillText("“技术是哨兵，不是医生；", 90, 1160);
    ctx.fillText("人是最后一道防线。”", 90, 1210);

    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.moveTo(90, 1270);
    ctx.lineTo(990, 1270);
    ctx.stroke();

    ctx.fillStyle = "#7f95a6";
    ctx.font = '400 22px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillText("智慧社区 · 智慧养老互动科普", 90, 1322);
    ctx.textAlign = "right";
    ctx.fillText("长按保存 · 转给家人", 990, 1322);
    ctx.textAlign = "left";

    ctx.fillStyle = "rgba(126,224,193,0.7)";
    ctx.font = '400 18px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillText("如遇紧急情况，请立即拨打 120。", 90, 1366);

    cardDataUrl = canvas.toDataURL("image/png");
    shareImage.src = cardDataUrl;
    downloadCard.href = cardDataUrl;
  }

  function openShareModal() {
    buildShareCard();
    lastFocused = document.activeElement;
    shareModal.hidden = false;
    document.body.classList.add("modal-open");
    copyStatus.textContent = "";
    $("#closeModal").focus();
  }

  function closeShareModal() {
    shareModal.hidden = true;
    document.body.classList.remove("modal-open");
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  $("#openShareCard").addEventListener("click", openShareModal);
  $("#closeModal").addEventListener("click", closeShareModal);
  $(".modal-backdrop", shareModal).addEventListener("click", closeShareModal);

  document.addEventListener("keydown", function (event) {
    if (shareModal.hidden) return;

    if (event.key === "Escape") {
      closeShareModal();
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = $$("a[href], button:not([disabled])", shareModal);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  $("#copyCardText").addEventListener("click", function () {
    const text = [
      "我家的守夜卡｜智慧社区·智慧养老",
      "",
      "1. 报警先验证：语音确认，30 秒无应答立即升级。",
      "2. 通知要并行：物业、子女、120 同时启动。",
      "3. 急救不盲动：先判断伤情，保暖，听 120 指导。",
      "",
      "本次守护值：" + state.score + " / 90",
      "",
      "给爸妈装设备前，先问：您愿意吗？数据给谁看？出事谁先到？",
      "",
      "技术是哨兵，不是医生；人是最后一道防线。"
    ].join("\n");

    function done() {
      copyStatus.textContent = "已复制，可以粘贴到家庭群。";
    }

    function fallbackCopy() {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        done();
      } catch (error) {
        copyStatus.textContent = "复制失败，请长按上方图片保存。";
      }
      document.body.removeChild(textarea);
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  });

  $("#restartBtn").addEventListener("click", resetSimulation);

  /* ---------- 初始化 ---------- */

  applySensorStage(0);
  renderStep();
  updatePrivacy();
  selectTime("morning");
  updateScrollProgress();
})();
