(async function (pubkey,empId) {
  //done
  //https://hrmv101phqaupgrade.phrsandbox.dev/hr/EIM/JavaScript/forge.min.js neww
  //https://cdn.jsdelivr.net/npm/node-forge@1.3.1/dist/forge.min.js ol
  if (typeof forge === 'undefined') {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://hrmv101phqaupgrade.phrsandbox.dev/hr/EIM/JavaScript/forge.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  function encryptWithForge(publicKeyPem, data) {
    data = data.replace(/\s/g, "");
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    const dataBytes = forge.util.encodeUtf8(data);
    const encryptedBytes = publicKey.encrypt(dataBytes, 'RSA-OAEP', {
      md: forge.md.sha256.create()
    });
    return forge.util.encode64(encryptedBytes);
  }
  const encrypted = encryptWithForge(pubkey, empId);
  return encrypted;
});
