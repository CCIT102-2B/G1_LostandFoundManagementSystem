const seedItems = [
{id:1,name:'Wireless earbuds',type:'Lost',category:'Electronics',location:'Student lounge',date:'2026-10-08',description:'White earbuds in a small charging case. May have been left near the window seats.',reporter:'FAITH student',status:'Open',emoji:'🎧',tone:'purple'},
{id:2,name:'Blue water bottle',type:'Found',category:'Personal items',location:'Gym entrance',date:'2026-10-08',description:'Reusable blue bottle with a silver lid. Handed in after PE class.',reporter:'FAITH campus community',status:'Open',emoji:'🧴',tone:'green'},
{id:3,name:'Student ID holder',type:'Lost',category:'Accessories',location:'Main building, Room 204',date:'2026-10-07',description:'Clear ID holder with a blue strap. Please check around the classroom.',reporter:'FAITH student',status:'Open',emoji:'🪪',tone:'yellow'},
{id:4,name:'Black umbrella',type:'Found',category:'Personal items',location:'Cafeteria',date:'2026-10-06',description:'Compact black umbrella left beside the tables near the entrance.',reporter:'FAITH campus community',status:'Open',emoji:'☂️',tone:'pink'},
{id:5,name:'Math notebook',type:'Lost',category:'School supplies',location:'Library study area',date:'2026-10-05',description:'Blue notebook with handwritten notes inside. Name may be written on the first page.',reporter:'FAITH student',status:'Open',emoji:'📓',tone:'green'},
{id:6,name:'Silver keychain',type:'Found',category:'Accessories',location:'Gate 2',date:'2026-10-04',description:'One silver key with a small star keychain. Please confirm details when claiming.',reporter:'FAITH campus community',status:'Returned',emoji:'🔑',tone:'purple'}
];
let items = loadItems(); let activeType='All';
function loadItems(){try{const saved=localStorage.getItem('findit_items');return saved?JSON.parse(saved):seedItems.map(x=>({...x}));}catch(e){return seedItems.map(x=>({...x}));}}
function saveItems(){try{localStorage.setItem('findit_items',JSON.stringify(items));}catch(e){}}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function formatDate(s){if(!s)return 'Date not provided';return new Date(s+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});}
function render(){
const query=document.getElementById('searchInput').value.trim().toLowerCase();
const cat=document.getElementById('categoryFilter').value;
const sort=document.getElementById('sortFilter').value;
let list=items.filter(x=>(activeType==='All'||(activeType==='Returned'?x.status==='Returned':x.type===activeType&&x.status!=='Returned'))&&(cat==='All'||x.category===cat)&&[x.name,x.description,x.location,x.category].join(' ').toLowerCase().includes(query));
list.sort((a,b)=>sort==='newest'?b.date.localeCompare(a.date):a.date.localeCompare(b.date));
document.getElementById('totalCount').textContent=items.length;
document.getElementById('openCount').textContent=items.filter(x=>x.status!=='Returned').length;
document.getElementById('returnedCount').textContent=items.filter(x=>x.status==='Returned').length;
const grid=document.getElementById('itemGrid');
if(!list.length){grid.innerHTML='<div class="empty"><div>🧭</div><strong>No matching reports yet</strong><p>Try another search or create a new report.</p></div>';return;}
grid.innerHTML=list.map(x=>`<article class="item-card"><div class="item-visual ${esc(x.tone||'green')} ${x.photo?'has-photo':''}"><span class="badge ${x.type==='Found'?'found':''}">${x.type==='Lost'?'Lost item':'Found item'}</span>${x.photo?`<img class="item-photo" src="${x.photo}" alt="Photo of ${esc(x.name)}" loading="lazy">`:`<span aria-hidden="true">${esc(x.emoji||'📦')}</span>`}</div><div class="item-content"><div class="item-title-row"><h3>${esc(x.name)}</h3><span class="status ${x.status==='Returned'?'returned':''}">${x.status==='Returned'?'Returned':'Open'}</span></div><p class="item-desc">${esc(x.description)}</p><div class="meta"><span>📍 ${esc(x.location)}</span><span>📅 ${formatDate(x.date)} · ${esc(x.category)}</span></div></div><div class="card-footer"><small>Reported by ${esc(x.reporter||'FAITH community member')}</small>${x.status==='Returned'?'<span style="color:#16856b;font-size:11px;font-weight:800">✓ Reunited</span>':`<button class="text-button" onclick="markReturned(${x.id})">Mark returned ↗</button>`}</div></article>`).join('');
}
function openModal(type){document.getElementById('reportForm').reset();clearPhoto();document.getElementById('reportType').value=type||'Lost';document.getElementById('itemDate').value=new Date().toISOString().slice(0,10);document.getElementById('modalBackdrop').classList.add('open');document.getElementById('itemName').focus();}
function closeModal(){document.getElementById('modalBackdrop').classList.remove('open');}
function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.remove('show');void t.offsetWidth;t.classList.add('show');}
function markReturned(id){const item=items.find(x=>x.id===id);if(!item)return;if(confirm(`Mark “${item.name}” as returned?`)){item.status='Returned';saveItems();render();showToast('Item status updated to Returned.');}}
let selectedPhoto = '';
const photoInput = document.getElementById('itemPhoto');
const photoPreview = document.getElementById('photoPreview');
const photoPreviewWrap = document.getElementById('photoPreviewWrap');
photoInput.addEventListener('change', async () => {
  const file = photoInput.files && photoInput.files[0];
  if (!file) { clearPhoto(); return; }
  if (!file.type.startsWith('image/')) {
    showToast('Please choose an image file.'); photoInput.value=''; clearPhoto(); return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('Photo must be 5 MB or smaller.'); photoInput.value=''; clearPhoto(); return;
  }
  try {
    selectedPhoto = await compressPhoto(file);
    photoPreview.src = selectedPhoto;
    photoPreviewWrap.hidden = false;
  } catch (error) {
    showToast('Could not load that photo. Please try another image.');
    photoInput.value=''; clearPhoto();
  }
});
function clearPhoto() {
  selectedPhoto = '';
  photoPreview.removeAttribute('src');
  photoPreviewWrap.hidden = true;
}
function compressPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('File read failed'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('Image load failed'));
      image.onload = () => {
        const maxSide = 1000;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        if (!context) { reject(new Error('Canvas unavailable')); return; }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
document.getElementById('removePhoto').addEventListener('click', () => {
  photoInput.value = '';
  clearPhoto();
});

document.getElementById('reportForm').addEventListener('submit',e=>{e.preventDefault();const type=document.getElementById('reportType').value;const name=document.getElementById('itemName').value.trim();const tones=['purple','green','yellow','pink'];const emojis={Electronics:'🎧',Accessories:'🎒','School supplies':'📓','Personal items':'🧴',Other:'📦'};items.unshift({id:Date.now(),name,type,category:document.getElementById('itemCategory').value,location:document.getElementById('itemLocation').value.trim(),date:document.getElementById('itemDate').value,description:document.getElementById('itemDescription').value.trim(),reporter:document.getElementById('reporterName').value.trim()||'FAITH community member',photo:selectedPhoto,status:'Open',emoji:emojis[document.getElementById('itemCategory').value]||'📦',tone:tones[Math.floor(Math.random()*tones.length)]});saveItems();activeType='All';document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.type==='All'));closeModal();photoInput.value='';clearPhoto();render();showToast('Your report has been added to the board!');document.getElementById('items').scrollIntoView({behavior:'smooth'});});
document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{activeType=t.dataset.type;document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b===t));render();}));document.getElementById('searchInput').addEventListener('input',render);document.getElementById('categoryFilter').addEventListener('change',render);document.getElementById('sortFilter').addEventListener('change',render);document.getElementById('modalBackdrop').addEventListener('click',e=>{if(e.target.id==='modalBackdrop')closeModal();});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});render();
