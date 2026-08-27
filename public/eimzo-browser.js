const HujjatUzEIMZOClient = {
  __eif: null,

  checkVersion: async function () {
    return this._call("checkVersion", null);
  },

  installApiKeys: async function () {
    return this._call("installApiKeys", null);
  },

  listAllUserKeys: async function () {
    const result = await this._call("listAllUserKeys", null);

    result.items.forEach((item) => {
      item.validFrom = new Date(item.validFrom);
      item.validTo = new Date(item.validTo);
    });

    return result.items;
  },

  loadKey: async function (itemObject) {
    const result = await this._call("loadKey", { itemObject });
    return { cert: itemObject, id: result.id };
  },

  isIDCardPlugged: async function () {
    const result = await this._call("idCardIsPLuggedIn", {
      plugin: "idcard",
      name: "list_readers",
    });
    return result.success;
  },

  isCKCPLuggedIn: async function () {
    const result = await this._call("isCKCPLuggedIn", {
      plugin: "ckc",
      name: "list_ckc",
    });
    return result.success;
  },

  createPkcs7: async function (id, content, timestamper) {
    const data = await this._call("createPkcs7", { id, data: content });

    if (!timestamper) return data.pkcs7;

    const timestampToken = await timestamper(data.signatureHex);
    const timestamped = await this._call("attachTimestampTokenPkcs7", {
      data: data.pkcs7,
      serialNumber: data.serialNumber,
      timestampToken,
    });

    return timestamped.pkcs7;
  },

  _call: async function (action, args) {
    await this._checkAndCreateModule();

    const response = await this._syncData({
      action,
      arguments: args,
    });

    if (response?.success) {
      return response.success instanceof Object ? response.success : undefined;
    }

    if (response?.fail) {
      throw new Error(response.fail.reason || "E-IMZO tunnel xatosi");
    }

    throw new Error("E-IMZO tunnel javobi bo'sh");
  },

  _syncData: function (data) {
    return new Promise((resolve) => {
      try {
        const channel = new MessageChannel();
        channel.port1.onmessage = (event) => resolve(JSON.parse(event.data));
        this.__eif.contentWindow.postMessage(
          JSON.stringify(data),
          "https://hujjat.uz",
          [channel.port2],
        );
      } catch (error) {
        resolve({ fail: { error, reason: "E-IMZO tunnel bilan aloqa uzildi" } });
      }
    });
  },

  _checkAndCreateModule: async function () {
    if (this.__eif) return;

    const loopbackStatus = await queryLoopbackPermission();
    if (loopbackStatus?.state === "denied") {
      throw new Error("Local network access ruxsati berilmagan");
    }

    await new Promise((resolve, reject) => {
      this.__eif = document.createElement("iframe");
      this.__eif.style.display = "none";
      this.__eif.allow = "local-network-access";
      this.__eif.src = "https://hujjat.uz/eimzo/tunnel.html";
      this.__eif.onload = resolve;
      this.__eif.onerror = () =>
        reject(new Error("Hujjat E-IMZO tunnel iframe yuklanmadi"));
      document.body.appendChild(this.__eif);
    });
  },

  install: async function () {
    await this.checkVersion();
    await this.installApiKeys();
  },

  getVersion: async function () {
    try {
      return await this.checkVersion();
    } catch {
      return null;
    }
  },

  isInstalled: async function () {
    try {
      await this.checkVersion();
      return true;
    } catch {
      return false;
    }
  },
};

if (typeof window !== "undefined") {
  window.HujjatUzEIMZOClient = HujjatUzEIMZOClient;
  window.EIMZO = HujjatUzEIMZOClient;
}

async function queryLoopbackPermission() {
  if (!navigator.permissions) return null;

  for (const name of ["loopback-network", "local-network-access"]) {
    try {
      return await navigator.permissions.query({ name });
    } catch {
      // Browser does not support this permission name.
    }
  }

  return null;
}
