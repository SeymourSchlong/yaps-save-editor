let saveInfo = {};
var header = '';

const peterNames = ['Peter','Bird','Electric','Fire','Ice','Wind','Karate','Moai','Baby','Bat','Tiger','Snail','Lizard','Alpaca','Lanky','Fat','Rabbit','Propellor','Sigma','Dragon','Frog','Mech','Beetle','Pterodactyl','Penguin'];

const onFileLoad = (data) => {
    // fuck you header
    header = data.slice(0, 80);
    data = atob(data.substring(80)).replace('\x00', '');
    data = JSON.parse(data);
    saveInfo = data;

    document.querySelector('#container').style.display = '';

    data.time++;

    let mapViewed = 0;
    for (let xx = 0; xx < 15; xx++) {
        for (let yy = 0; yy < 17; yy++) {
            mapViewed += saveInfo[`map_${xx},${yy}`];
        }
    }
    document.querySelector('#exploration').textContent = Math.round((mapViewed / (15*17)) * 1000) / 10;

    document.querySelectorAll('input[type="checkbox"]').forEach(inp => {
        inp.checked = false;
    });

    Object.keys(data).forEach(entry => {
        const input = document.querySelector(`[data-for="${entry}"`);

        if (!input) return;

        switch(input.type) {
            case "checkbox": {
                input.checked = typeof data[entry] !== undefined ? !!data[entry] : false;
                break;
            }
            case "number": {
                if (typeof data[entry] === undefined) {
                    input.value = '';
                }
                input.value = typeof data[entry] !== undefined ? data[entry] : '';
                break;
            }
            case "select-one": {
                input.selectedIndex = data[entry] < 0 ? 1 : data[entry];
                break;
            }
            default:
                break;
        }
    });
}

const makeSave = (data) => {
    const saveText = header + btoa(JSON.stringify(data) + '\x00');
    return saveText;
}

const load = () => {
    const uploadSave = document.querySelector('#upload-save');
    const submitSave = document.querySelector('#submit-save');

    uploadSave.addEventListener('change', () => {
        submitSave.disabled = false;
    });

    submitSave.addEventListener('click', () => {
        const reader = new FileReader();
        reader.onload = (e) => {
            onFileLoad(e.target.result);
        }
        reader.readAsText(uploadSave.files[0]);

        document.querySelector('#saveLink').download = uploadSave.files[0].name
    });

    const checkboxUpdateUsingFor = (input) => {
        input.addEventListener('change', () => {
            saveInfo[input.dataset.for] = +input.checked;
        });
    }

    const diskContainer = document.querySelector('#disks .scrollable');

    // create 25 input boxes for disks
    for (let i = 0; i < 25; i++) {
        const diskCheckbox = document.createElement('input');
        diskCheckbox.dataset.for = `disk_${i}`;
        diskCheckbox.type = 'checkbox';
        diskCheckbox.checked = false;

        const diskLabel = document.createElement('label');
        diskLabel.appendChild(diskCheckbox);
        diskLabel.appendChild(document.createTextNode(` ${peterNames[i]}`));
        diskContainer.appendChild(diskLabel);

        checkboxUpdateUsingFor(diskCheckbox);
        
    }


    const formsContainer = document.querySelector('#forms .scrollable');

    // create 25 input boxes for forms
    for (let i = 0; i < 25; i++) {
        const boxDiv = document.createElement('div');

        const formCheckbox = document.createElement('input');
        formCheckbox.dataset.for = `form_${i}`;
        formCheckbox.type = 'checkbox';
        formCheckbox.checked = false;
        formCheckbox.title = 'Enable form';

        const superCheckbox = document.createElement('input');
        superCheckbox.dataset.for = `super_${i}`;
        superCheckbox.type = 'checkbox';
        superCheckbox.checked = false;
        superCheckbox.title = 'Enable super';
        
        boxDiv.appendChild(formCheckbox);
        boxDiv.appendChild(superCheckbox);

        const diskLabel = document.createElement('span');
        diskLabel.appendChild(boxDiv);
        diskLabel.appendChild(document.createTextNode(` ${peterNames[i]}`));
        formsContainer.appendChild(diskLabel);
        
        checkboxUpdateUsingFor(formCheckbox);
        checkboxUpdateUsingFor(superCheckbox);
    }

    
    const enemyContainer = document.querySelector('#enemies .scrollable');

    // create 299 input boxes for enemies (10x30)
    for (let i = 1; i <= 299; i++) {
        const enemyCheckbox = document.createElement('input');
        enemyCheckbox.dataset.for = `enemy_${i}`;
        enemyCheckbox.type = 'checkbox';
        enemyCheckbox.checked = false;

        const enemyLabel = document.createElement('label');
        enemyLabel.appendChild(enemyCheckbox);
        enemyLabel.appendChild(document.createTextNode(` #${i}`));
        enemyContainer.appendChild(enemyLabel);

        checkboxUpdateUsingFor(enemyCheckbox);
    }

    // add checkbox detection for flags
    document.querySelectorAll('#flags input[type="checkbox"]').forEach(input => {
        checkboxUpdateUsingFor(input);
    });
    
    // add checkbox detection for game details
    document.querySelectorAll('#game input[type="checkbox"]').forEach(input => {
        checkboxUpdateUsingFor(input);
    });

    // number inputs
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('change', () => {
            saveInfo[input.dataset.for] = +input.value;
        });
    });

    const diffSelector = document.querySelector('#difficulty-select');
    diffSelector.addEventListener('click', () => {
        saveInfo[diffSelector.dataset.for] = +diffSelector.selectedIndex;
    });


    const allEnemyBoxes = [...enemyContainer.querySelectorAll('input')];

    document.querySelector('#mark-all-cap').addEventListener('click', () => {
        allEnemyBoxes.forEach(input => {
            if (!input.checked) input.click();
        });
    });

    document.querySelector('#mark-all-no-cap').addEventListener('click', () => {
        allEnemyBoxes.forEach(input => {
            if (input.checked) input.click();
        });
    });
    
    
    const allDiskBoxes = [...diskContainer.querySelectorAll('input')];

    document.querySelector('#mark-all-disk').addEventListener('click', () => {
        allDiskBoxes.forEach(input => {
            if (!input.checked) input.click();
        });
    });

    document.querySelector('#mark-all-no-disk').addEventListener('click', () => {
        allDiskBoxes.forEach(input => {
            if (input.checked) input.click();
        });
    });

    document.querySelector('#reveal-map').addEventListener('click', () => {
        for (let xx = 0; xx < 15; xx++) {
            for (let yy = 0; yy < 17; yy++) {
                saveInfo[`map_${xx},${yy}`] = 1;
            }
        }
        document.querySelector('#exploration').textContent = '100';
    });


    const saveButton = document.querySelector('#saveButton');
    const saveLink = document.querySelector('#saveLink');

    saveLink.addEventListener('click', () => {
        const blob = new Blob([makeSave(saveInfo)], { type: 'text/plain' });

        saveLink.href = URL.createObjectURL(blob);
    });
}

/**
 * GAMEMODE
 *** custom 0/1
 *** difficulty 0-3
 * RANDOMIZER OPTIONS
 *** random_seed (0-9999)
 *** shuffle_enemies 0/1
 *** shuffle_items 0/1
 *** disks_required: 0-25
 * DEATHS
 * DISKS UNLOCKED
 *** disk_X
 * DISK COUNT
 *** disks
 * SUPERS UNLOCKED
 *** super_X 0-25
 * ENEMIES
 * ENEMY COUNT
 * ENABLED FORMS
 * CUTSCENES
 *** scene0
 *** scene1
 *** gargoyles
 *** alien
 * BOSSES
 *** scientist_boss
 *** amalgam_boss
 * MAP SECTIONS
 *** map_X,Y (15x17)
 * GAME BEATEN
 *** beat
 */