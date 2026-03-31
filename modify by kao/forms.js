(function () {
  "use strict";

  var API = "";

  function parseError(res, bodyText) {
    try {
      var json = JSON.parse(bodyText);
      if (json.detail) {
        if (Array.isArray(json.detail)) {
          return json.detail
            .map(function (item) {
              return item.msg || JSON.stringify(item);
            })
            .join(" / ");
        }
        if (typeof json.detail === "string") return json.detail;
      }
    } catch (e) {}

    return bodyText || res.statusText || "請稍後再試。";
  }

  function showMsg(el, type, text) {
    if (!el) return;
    el.textContent = text;
    el.className =
      "form-msg is-visible form-msg--" + (type === "ok" ? "ok" : "err");
  }

  function bindRegistrationForm() {
    var form = document.getElementById("form-registration");
    var msg = document.getElementById("form-registration-msg");
    if (!form || !msg) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      msg.className = "form-msg";
      msg.textContent = "";

      var data = {
        name_zh: form.name_zh.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        organization: form.organization.value.trim(),
        participant_type: form.participant_type.value,
        dietary: form.dietary.value.trim(),
        invoice_need: form.invoice_need.value.trim(),
        remarks: form.remarks.value.trim()
      };

      fetch(API + "/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          return res.text().then(function (text) {
            return { res: res, text: text };
          });
        })
        .then(function (payload) {
          if (!payload.res.ok) throw new Error(parseError(payload.res, payload.text));
          var json = JSON.parse(payload.text);
          showMsg(msg, "ok", json.message + "，報名編號 #" + json.id);
          form.reset();
        })
        .catch(function (err) {
          showMsg(msg, "err", err.message || "送出失敗。");
        });
    });
  }

  function bindSubmissionForm() {
    var form = document.getElementById("form-submission");
    var msg = document.getElementById("form-submission-msg");
    if (!form || !msg) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      msg.className = "form-msg";
      msg.textContent = "";

      var fd = new FormData(form);

      fetch(API + "/api/submissions", {
        method: "POST",
        body: fd
      })
        .then(function (res) {
          return res.text().then(function (text) {
            return { res: res, text: text };
          });
        })
        .then(function (payload) {
          if (!payload.res.ok) throw new Error(parseError(payload.res, payload.text));
          var json = JSON.parse(payload.text);
          showMsg(msg, "ok", json.message + "，查詢代碼：" + json.receipt_token);
          form.reset();
        })
        .catch(function (err) {
          showMsg(msg, "err", err.message || "送出失敗。");
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindRegistrationForm();
    bindSubmissionForm();
  });
})();
