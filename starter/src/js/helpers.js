import { TIMEOUT_SEC } from './config';

function timeout(sec) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(
        new Error(`Request took too long and timed out after ${sec} seconds`)
      );
    }, sec * 1000);
  });
}

export async function AJAX(url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(uploadData),
        })
      : await fetch(url);
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await res.json();
    return data;
  } catch (err) {
    throw err;
  }
}

// export async function getJSON(url) {
//   try {
//     const fetchPro = await fetch(url);
//     const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
//     const data = await res.json();
//     return data;
//   } catch (err) {
//     throw err;
//   }
// }

// export async function sendJSON(url, uploadData) {
//   try {
//     const fetchPro = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(uploadData),
//     });
//     const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
//     const data = await res.json();
//     return data;
//   } catch (err) {
//     throw err;
//   }
// }
