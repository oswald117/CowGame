const canvas = document.getElementById('farm-canvas');
//const context = canvas.getContext('2d');

const $ = (id) => document.getElementById(id);

document.getElementById('start-button').addEventListener('click', () => {
    const farmNameInput = $('farm-name-input'); 
    const farmNameError = $('farm-name-error'); 
    const farmName = farmNameInput.value.trim();
    if (!farmName || (farmName.length < 3 || farmName.length > 20) || !/^[a-zA-Z0-9\s]+$/.test(farmName)) {
        farmNameError.style.display = 'block'; 
        farmNameInput.focus(); 
        return;
    }

    farmNameError.style.display = 'none'; 
    document.querySelector('.game-layout').style.display = 'grid';
    localStorage.setItem('farmName', farmName);
	window.location.href = 'game.html';
});



