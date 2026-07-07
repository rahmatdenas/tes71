'use strict';

function loadPrimaryData() {
  queryWdqsThenProcess(
    SPARQL_RESIDENCE_QUERY,
    function(result) {
      // Ekstraksi tiap baris data
      let record = {
        locationName: result.locationLabel.value,
        rawTime: result.pointInTime.value,
        formattedDate: formatWikidataDate(result.pointInTime.value, result.ptPrecision.value)
      };

      if (result.coord) {
        let wktBits = result.coord.value.split(/\(|\)| /); 
        record.lon = parseFloat(wktBits[1]);
        record.lat = parseFloat(wktBits[2]);
      }

      if (result.image) {
        let filename = decodeURIComponent(result.image.value.replace(/https?:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\//, ''));
        record.imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=300`;
      }

      TimelineRecords.push(record);
    },
    function() {
      // Urutkan berdasarkan waktu mentah paling awal ke akhir
      TimelineRecords.sort((a, b) => a.rawTime.localeCompare(b.rawTime));
      renderMapAndPanel();
    }
  );
}

function renderMapAndPanel() {
  let detailsContainer = document.getElementById('details');
  detailsContainer.innerHTML = ''; 
  let markerBounds = [];

  TimelineRecords.forEach((record, index) => {
    // 1. RENDER KONTEN PANEL SAMPING (UI Sederhana)
    let panelHtml = `
      <div class="timeline-item" id="item-${index}" style="margin-bottom: 30px;">
        <h2 style="margin-bottom: 10px;">${record.formattedDate}</h2>
        ${record.imageUrl ? `<img src="${record.imageUrl}" alt="${record.locationName}" style="width:100%; border-radius:8px; margin-bottom:10px;">` : ''}
        <p style="margin: 0;"><strong>${record.locationName}</strong></p>
        ${record.lat && record.lon ? `<p style="font-size: 0.9em; color: #555;">Koordinat: ${record.lat.toFixed(4)}, ${record.lon.toFixed(4)}</p>` : ''}
        <hr style="margin-top: 20px;">
      </div>
    `;
    detailsContainer.innerHTML += panelHtml;

    // 2. RENDER MARKER & POPUP PETA
    if (record.lat && record.lon) {
      let marker = L.marker([record.lat, record.lon]).addTo(Map);
      markerBounds.push([record.lat, record.lon]);
      
      // Popup UI: Gambar -> Judul Lokasi -> Waktu
      let popupContent = `
        <div style="text-align:center; min-width: 150px;">
          ${record.imageUrl ? `<img src="${record.imageUrl}" style="width:100%; max-width:200px; border-radius:4px; margin-bottom:8px;"><br>` : ''}
          <strong style="font-size:1.1em;">${record.locationName}</strong><br>
          <span style="color:#666; font-size:0.9em;">${record.formattedDate}</span>
        </div>
      `;
      marker.bindPopup(popupContent);
      
      // Interaksi: Klik marker otomatis scroll panel
      marker.on('click', function() {
        document.getElementById(`item-${index}`).scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  });

  // Sesuaikan zoom peta agar semua marker terlihat
  if (markerBounds.length > 0) {
    Map.fitBounds(markerBounds, { padding: [30, 30] });
  }
}

// Fungsi utilitas format waktu
function formatWikidataDate(dateString, precision) {
  if (!dateString) return null;  
  let cleanStr = dateString.replace(/^[+-]/, '');   
  let yearStr  = cleanStr.substring(0, 4);
  let monthStr = cleanStr.substring(5, 7);
  let dayStr   = cleanStr.substring(8, 10);
  let yearNum  = parseInt(yearStr);
  const bulanIndo = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  let prec = parseInt(precision) || 9; 
  if (prec === 11) {
    return `${parseInt(dayStr)} ${bulanIndo[parseInt(monthStr)]} ${yearStr}`;
  } 
  else if (prec === 10) {
    return `${bulanIndo[parseInt(monthStr)]} ${yearStr}`;
  } 
  else if (prec === 9) {
    return yearStr;
  } 
  else if (prec === 8) {
    return `${yearStr}-an`;
  } 
  else if (prec === 7) {
    let century = Math.ceil(yearNum / 100);
    return `Abad ke-${century}`;
  } 
  else {
    return yearStr;
  }
}
