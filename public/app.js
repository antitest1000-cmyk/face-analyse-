const input = document.getElementById("imageInput");
const dropzone = document.getElementById("dropzone");
const previewWrap = document.getElementById("previewWrap");
const preview = document.getElementById("preview");
const removeBtn = document.getElementById("removeBtn");
const analyzeBtn = document.getElementById("analyzeBtn");
const results = document.getElementById("results");
const errorBox = document.getElementById("errorBox");

let selectedFile = null;

window.addEventListener('DOMContentLoaded', async () => {
  const pendingImage = sessionStorage.getItem('pendingImage');
  if (pendingImage) {
    sessionStorage.removeItem('pendingImage');
    
    if (window.location.pathname.includes('/ai-face-analyzer')) {
      try {
        const res = await fetch(pendingImage);
        const blob = await res.blob();
        const file = new File([blob], "uploaded.png", { type: blob.type });
        setFile(file);
        analyzeBtn.click();
      } catch (err) {
        console.error("Failed to load pending image:", err);
      }
    }
  }
});

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function clearError() {
  errorBox.textContent = "";
  errorBox.classList.add("hidden");
}

function setFile(file) {
  clearError();

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showError("Please choose an image file.");
    return;
  }

  if (file.size > 8 * 1024 * 1024) {
    showError("Image is larger than 8 MB.");
    return;
  }

  selectedFile = file;
  preview.src = URL.createObjectURL(file);
  previewWrap.classList.remove("hidden");
  dropzone.classList.add("hidden");
  analyzeBtn.disabled = false;
}

input.addEventListener("change", () => setFile(input.files[0]));

["dragenter", "dragover"].forEach(type => {
  dropzone.addEventListener(type, e => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });
});

["dragleave", "drop"].forEach(type => {
  dropzone.addEventListener(type, e => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
  });
});

dropzone.addEventListener("drop", e => setFile(e.dataTransfer.files[0]));

removeBtn.addEventListener("click", () => {
  selectedFile = null;
  input.value = "";
  preview.src = "";
  previewWrap.classList.add("hidden");
  dropzone.classList.remove("hidden");
  analyzeBtn.disabled = true;
  clearError();
});

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPersonType(raw) {
  const map = {
    "baby": "Baby",
    "child-boy": "Child Boy",
    "child-girl": "Child Girl",
    "teen-male": "Teen Male",
    "teen-female": "Teen Female",
    "young-adult-male": "Young Adult Male",
    "young-adult-female": "Young Adult Female",
    "adult-male": "Adult Male",
    "adult-female": "Adult Female",
    "middle-aged-male": "Middle-Aged Male",
    "middle-aged-female": "Middle-Aged Female",
    "elderly-male": "Elderly Male",
    "elderly-female": "Elderly Female",
    "unclear": "Unclear"
  };
  return map[raw] || raw || "Unclear";
}

function renderResults(data) {
  let html = `
    <div class="result-list" style="margin-bottom: 20px;">
      <div class="result-row">
        <label>Face detected</label>
        <value>${data.faceDetected ? "Yes" : "No"}</value>
      </div>
      <div class="result-row">
        <label>Face count</label>
        <value>${escapeHtml(data.faceCount ?? 0)}</value>
      </div>
      <div class="result-row">
        <label>Image quality</label>
        <value>${escapeHtml(data.imageQuality?.overall || "Unknown")}</value>
      </div>
      <div class="result-row">
        <label>Notes</label>
        <value>${escapeHtml(data.notes || "No additional notes.")}</value>
      </div>
    </div>
  `;

  if (data.faces && Array.isArray(data.faces)) {
    data.faces.forEach((face, index) => {
      const features = Array.isArray(face.visibleFeatures) ? face.visibleFeatures : [];
      html += `
        <h3 style="color: var(--orange); margin-top: 25px; margin-bottom: 15px;">Face #${index + 1} Analysis</h3>
        <div class="result-list">
          <div class="result-row">
            <label>Person Type</label>
            <value>${formatPersonType(face.personType)}</value>
          </div>
          <div class="result-row">
            <label>Apparent age</label>
            <value>${escapeHtml(face.apparentAgeRange || "Unclear")}</value>
          </div>
          <div class="result-row">
            <label>Emotion</label>
            <value>${escapeHtml(face.expression?.primary || "Unknown")}</value>
          </div>
          <div class="result-row">
            <label>Eye Color</label>
            <value>${escapeHtml(face.eyes?.apparentColor || "Unknown")}</value>
          </div>
          <div class="result-row">
            <label>Hair Style</label>
            <value>${escapeHtml(face.hair?.style || "Unknown")}</value>
          </div>
          <div class="result-row">
            <label>Vibe & Aura</label>
            <value>${escapeHtml(face.vibe?.primary || "Unknown")}</value>
          </div>
          <div class="result-row">
            <label>Best Feature</label>
            <value>${escapeHtml(face.bestFeature?.feature || "Unknown")}</value>
          </div>
          <div class="result-row">
            <label>Style Profile</label>
            <value>${escapeHtml(face.styleProfile?.overall || "Unknown")}</value>
          </div>
          <div class="result-row">
            <label>Fun Description</label>
            <value>${escapeHtml(face.funDescription || "Unknown")}</value>
          </div>
          <div class="result-row">
            <label>Portrait Summary</label>
            <value>${escapeHtml(face.portraitSummary || "Unknown")}</value>
          </div>
          <div class="result-row">
            <label>Visible features</label>
            <value>${features.length
              ? features.map(x => `<span class="badge">${escapeHtml(x)}</span>`).join("")
              : "None clearly detected"}</value>
          </div>
        </div>
      `;
    });
  }

  // Add download button
  const jsonData = encodeURIComponent(JSON.stringify(data, null, 2));
  html += `
    <div style="margin-top: 30px; text-align: center;">
      <a href="data:application/json;charset=utf-8,${jsonData}" download="face-analysis.json" class="upload-btn" style="display: inline-block; text-decoration: none; padding: 12px 24px;">Download Full Data (JSON)</a>
    </div>
  `;

  results.innerHTML = html;
}

analyzeBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  if (window.location.pathname === "/" || window.location.pathname === "/index.html") {
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Redirecting...";
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        sessionStorage.setItem('pendingImage', e.target.result);
        window.location.href = '/ai-face-analyzer/';
      } catch (err) {
        alert("Image is too large to transfer. Please upload it directly on the Analyzer page.");
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = "Analyze Image";
      }
    };
    reader.readAsDataURL(selectedFile);
    return;
  }

  clearError();
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analyzing...";

  results.innerHTML = `
    <div class="empty">
      <div class="empty-mark">...</div>
      <strong>Analyzing image</strong>
      <span>Sending the image to the configured vision model.</span>
    </div>
  `;

  // Convert image to base64 and send as JSON (works with both Express & Netlify Functions)
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // strip the "data:image/xxx;base64," prefix
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  try {
    const imageBase64 = await toBase64(selectedFile);

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64, mimeType: selectedFile.type })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Analysis failed.");
    }

    renderResults(data);
  } catch (error) {
    results.innerHTML = `
      <div class="empty">
        <div class="empty-mark">!</div>
        <strong>Analysis failed</strong>
        <span>Check the server configuration and try again.</span>
      </div>
    `;
    showError(error.message);
  } finally {
    analyzeBtn.disabled = !selectedFile;
    analyzeBtn.textContent = "Analyze Image";
  }
});