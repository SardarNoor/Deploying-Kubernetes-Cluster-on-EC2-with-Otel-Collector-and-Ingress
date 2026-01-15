const out = document.getElementById("out");

async function call(path) {
  out.textContent = "Loading...";
  try {
    const res = await fetch(path);
    const json = await res.json();
    out.textContent = JSON.stringify({ path, ...json }, null, 2);
  } catch (e) {
    out.textContent = `Error: ${e.message}`;
  }
}

document.getElementById("btnHealth").onclick = () => call("/api/health");
document.getElementById("btnRandom").onclick = () => call("/api/random");
document.getElementById("btnSlow").onclick = () => call("/api/slow");
