// --- STATE AWAL ---
let hpBattery = 45;
let caseBattery = 82;
let hpTemp = 31;
let caseTemp = 35;
let limitTemp = 45;

let isCutoff = false;
let mode = 'eco'; 

document.addEventListener("DOMContentLoaded", () => {
    // Jalankan animasi default mode saat aplikasi dibuka
    setMode(mode); 
});

// --- NAVIGASI TAB ---
function switchTab(tabId, element) {
    document.querySelectorAll('.tab-pane').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
    element.classList.add('active');
}

// --- LOGIKA TOMBOL DISTRIBUSI DAYA & ANIMASI CHARGING ---
function setMode(newMode) {
    if(isCutoff && newMode !== 'standby') {
        alert("Sistem Terkunci: AI Cut-Off sedang aktif karena suhu HP ekstrem.");
        return;
    }
    
    mode = newMode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('mode-' + mode).classList.add('active');
    
    // Menerapkan Animasi Charge sesuai Mode (Targetkan ke panel charging)
    let flowBar = document.getElementById('charge-flow-bar');
    let transferStatus = document.getElementById('transfer-status');
    
    if (!isCutoff) {
        flowBar.className = 'transfer-bar'; // Reset class
        if(mode === 'eco') {
            flowBar.classList.add('flow-eco');
            transferStatus.className = 'text-eco';
            transferStatus.innerText = "Eco Mode";
        } else if(mode === 'boost') {
            flowBar.classList.add('flow-boost');
            transferStatus.className = 'text-boost';
            transferStatus.innerText = "Boost Mode";
        } else if(mode === 'bypass') {
            flowBar.classList.add('flow-bypass');
            transferStatus.className = 'text-bypass';
            transferStatus.innerText = "Bypass Mode";
        } else if(mode === 'standby') {
            flowBar.classList.add('flow-standby');
            transferStatus.className = 'text-standby';
            transferStatus.innerText = "Standby";
        }
    }
}

// --- INTERAKSI SLIDER LIMIT SUHU ---
document.getElementById('temp-limit').addEventListener('input', function() {
    limitTemp = parseInt(this.value);
    document.getElementById('limit-val').innerText = limitTemp + "°C";
    checkCutoff();
});

// --- LOGIKA CUT-OFF & PERINGATAN ---
function checkCutoff() {
    let ind = document.getElementById('safety-indicator');
    
    // 1. KONDISI CUT-OFF: Hanya jika SUHU HP melebihi limit
    if(hpTemp >= limitTemp) {
        isCutoff = true;
        setMode('standby');
        
        // UI Cut-Off (Danger Merah)
        ind.className = 'thermal-status danger-state glass-panel';
        ind.querySelector('.status-icon').className = 'fas fa-triangle-exclamation fa-2x status-icon';
        
        document.getElementById('thermal-h4').innerText = "PERINGATAN: SMARTPHONE OVERHEATING!";
        document.getElementById('thermal-h4').style.color = '#ef4444';
        document.getElementById('thermal-p').innerText = "(Auto Cut-Off) sedang bekerja untuk mendinginkan Smartphone.";
        
        document.getElementById('hp-fill').classList.add('fill-danger');
        document.getElementById('case-fill').classList.remove('fill-warning');
        
        // Disable tombol mode
        document.getElementById('mode-eco').disabled = true;
        document.getElementById('mode-boost').disabled = true;
        document.getElementById('mode-bypass').disabled = true;
        
        // Hentikan animasi charging HP
        document.getElementById('charge-flow-bar').className = 'transfer-bar flow-standby';
        let transferStatus = document.getElementById('transfer-status');
        transferStatus.className = 'text-danger';
        transferStatus.style.color = '#ef4444';
        transferStatus.innerText = "CUT-OFF AKTIF";
        
    } 
    // 2. KONDISI PERINGATAN SAJA: Jika Suhu Casing melebihi limit, TAPI Suhu HP masih aman
    else if (caseTemp >= limitTemp && hpTemp < limitTemp) {
        isCutoff = false;
        
        // UI Peringatan (Warning Oranye)
        ind.className = 'thermal-status warning-state glass-panel';
        ind.querySelector('.status-icon').className = 'fas fa-exclamation-circle fa-2x status-icon';
        
        document.getElementById('thermal-h4').innerText = "Peringatan: Casing Panas";
        document.getElementById('thermal-h4').style.color = '#f59e0b';
        document.getElementById('thermal-p').innerText = "Suhu smartphone masih aman, melanjutkan.";
        
        document.getElementById('case-fill').classList.add('fill-warning');
        document.getElementById('hp-fill').classList.remove('fill-danger');
        
        // Enable kembali tombol
        document.getElementById('mode-eco').disabled = false;
        document.getElementById('mode-boost').disabled = false;
        document.getElementById('mode-bypass').disabled = false;
        
        // Pulihkan animasi sesuai mode
        setMode(mode);
    } 
    // 3. KONDISI AMAN: Kedua suhu di bawah limit
    else {
        isCutoff = false;
        
        // UI Aman (Safe Hijau)
        ind.className = 'thermal-status safe glass-panel';
        ind.querySelector('.status-icon').className = 'fas fa-shield-check fa-2x status-icon';
        
        document.getElementById('thermal-h4').innerText = "Suhu Normal";
        document.getElementById('thermal-h4').style.color = '';
        document.getElementById('thermal-p').innerText = "AI Auto Cut-off Standby";
        
        document.getElementById('hp-fill').classList.remove('fill-danger');
        document.getElementById('case-fill').classList.remove('fill-warning');
        
        // Enable kembali tombol
        document.getElementById('mode-eco').disabled = false;
        document.getElementById('mode-boost').disabled = false;
        document.getElementById('mode-bypass').disabled = false;
        
        // Pulihkan animasi sesuai mode
        setMode(mode);
    }
    updateUI();
}

// --- EFEK LIVE ANIMASI (Fluktuasi Watt Panen Surya) ---
setInterval(() => {
    // Memanen surya diasumsikan tetap berjalan selama casing belum penuh 
    if (caseBattery < 100) {
        let randomFluctuation = (Math.random() * 0.15) - 0.05; 
        let currentWatt = (3.45 + randomFluctuation).toFixed(2);
        document.getElementById('watt-display').innerHTML = currentWatt + ' <span class="unit">W</span>';
    }
}, 2000);

// --- FUNGSI UPDATE UI ---
function updateUI() {
    // 1. Set Progress Baterai (Menggunakan Persentase %)
    document.getElementById('hp-pct').innerText = hpBattery + "%";
    document.getElementById('case-pct').innerText = caseBattery + "%";
    document.getElementById('hp-circ').style.setProperty('--progress', hpBattery + '%');
    document.getElementById('case-circ').style.setProperty('--progress', caseBattery + '%');

    // 2. Set Visual Bar Suhu
    document.getElementById('hp-temp').innerHTML = hpTemp + '<span class="unit">°C</span>';
    document.getElementById('case-temp').innerHTML = caseTemp + '<span class="unit">°C</span>';
    
    document.getElementById('hp-fill').style.width = (hpTemp / 60 * 100) + '%';
    document.getElementById('case-fill').style.width = (caseTemp / 60 * 100) + '%';

    // 3. Set Warna Teks Suhu
    if(hpTemp >= limitTemp) document.getElementById('hp-temp').style.color = '#ef4444';
    else document.getElementById('hp-temp').style.color = '#f8fafc';
    
    if(caseTemp >= limitTemp) document.getElementById('case-temp').style.color = '#f59e0b';
    else document.getElementById('case-temp').style.color = '#f8fafc';
}