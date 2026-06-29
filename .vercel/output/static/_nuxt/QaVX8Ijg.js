const n=r=>{const t=typeof r=="string"?parseFloat(r):r;return isNaN(t)?"Rp 0":new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",minimumFractionDigits:0}).format(t)};export{n as f};
