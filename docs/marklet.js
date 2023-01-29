window.mklet_chatgpt_tools = (d, slackToken, slackChannel) => {
  window.mklet_chatgpt_tools_slackToken = slackToken;
  window.mklet_chatgpt_tools_slackChannel = slackChannel;
  window.mklet_chatgpt_tools_copyText = (text) => {
    if (!text) return;
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  };
  window.mklet_chatgpt_tools_sendToSlack = (slackToken, slackChannel, text) => {
    // 投稿する内容を設定する
    const message = {
      token: slackToken,
      channel: slackChannel,
      text: text,
    };
    const formData = new FormData();
    Object.keys(message).forEach((key) => {
      formData.append(key, message[key]);
    });

    // Slack API のエンドポイントを指定する
    const endpoint = "https://slack.com/api/chat.postMessage";

    fetch(endpoint, {
      method: "post",
      mode: "no-cors",
      body: formData,
    });
  };
  window.mklet_chatgpt_tools_parseChatGPT = () => {
    const resultsElements = [
      ...document.querySelectorAll(
        ".flex > div.border-b.bg-gray-50"
      ),
    ];
    const lastResultElement = resultsElements[resultsElements.length - 1];
    if (!lastResultElement) return null;
    const lastRequestElement = lastResultElement.previousElementSibling;
    const lastResult = [
      ...lastResultElement.querySelector(".markdown").childNodes,
    ]
      .map((item) => {
        const code = item.querySelector("pre code");
        if (code) {
          return "```" + `\n${code.textContent}\n` + "```";
        }
        if(item.tagName === "OL"){
          let count = Number(item?.getAttribute('start') ?? 1);
          const liTextList = [...item.querySelectorAll("li")].map((item, index) => {
            return `${count + index}. ${item.textContent}  `;
          });
          return `${liTextList.join("\n")}\n`;
        }
        if(item.tagName === "UL"){
          const liTextList = [...item.querySelectorAll("li")].map((item, index) => {
            return `- ${item.textContent}  `;
          });
          return `${liTextList.join("\n")}\n`;
        }
        return `${item.textContent}  `;
      })
      .join("\n");
    const lastRequest = lastRequestElement.textContent;
    const data = {
      lastRequest,
      lastResult,
      text: `${lastRequest}\n${lastResult}`,
    };
    return data;
  };
  const parent = document.querySelector("form > div.relative");
  if(!parent.attributes["mklet-btn-append"]){
    const div = document.createElement("div");
    div.className = "flex justify-center";
    const button = document.createElement("button");
    button.innerHTML = "Copy";
    button.className = "border px-4 py-1 rounded";
    button.onclick = () => {
      const data = window.mklet_chatgpt_tools_parseChatGPT();
      if (window.mklet_chatgpt_tools_slackToken && window.mklet_chatgpt_tools_slackChannel) {
        window.mklet_chatgpt_tools_sendToSlack(window.mklet_chatgpt_tools_slackToken, window.mklet_chatgpt_tools_slackChannel, data?.text);
      } else {
        window.mklet_chatgpt_tools_copyText(data?.text);
        alert("クリップボードに保存しました: " + data?.text);
      }
    }
    parent.setAttribute("mklet-btn-append",true);
    div.appendChild(button);
    parent.appendChild(div);
  };
//   window.mklet_chatgpt_observer = new MutationObserver(function (mutations) {
//     mutations.forEach(function (mutation) {
//       mutation.addedNodes.forEach(function (node) {
//         if (node.matches("div.bg-gray-50")) {
//           console.log("reload", node)
//           if(node.parentElement.attributes["mklet-btn-append"])return;
//           var button = document.createElement("button");
//           button.innerHTML = "Copy";
//           button.onClick = () => {
//             const data = parseChatGPT();
//             if (slackToken && slackChannel) {
//               sendToSlack(slackToken, slackChannel, data?.text);
//             } else {
//               copyText(data?.text);
//               alert("クリップボードに保存しました: " + data?.text);
//             }
//           }
//           node.parentElement.setAttribute("mklet-btn-append",true);
//           node.parentElement.appendChild(button);
//         }
//       });
//     });
//   });
//   window.mklet_chatgpt_observer.observe(document.querySelector("[class*=react-scroll-to-bottom--css-] > div.flex"), { childList: true });
};
