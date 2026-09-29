document.querySelector('.menu')?.addEventListener('click',()=>alert('KAABE menu — navigation will be connected in the next app phase.'));
document.querySelectorAll('button').forEach(btn=>{if(btn.textContent.includes('Get Started'))btn.addEventListener('click',()=>document.querySelector('#pricing')?.scrollIntoView({behavior:'smooth'}));});
