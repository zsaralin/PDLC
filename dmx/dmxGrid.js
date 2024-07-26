import {imgCol, setNumCol} from './imageRatio.js'

// Function to generate the DMX grid
function generateDmxGrid(gridId, startCol, endCol) {
    const dmxGrid = document.getElementById(gridId);
    if (!dmxGrid) return; // Exit if the element is not found

    dmxGrid.innerHTML = ''; // Clear existing content

    for (let row = 0; row < 28; row++) {
        for (let col = startCol; col < endCol; col++) {
            const cell = document.createElement('div');
            cell.classList.add('dmxCell');
            cell.id = `dmxCell-${row}-${col}`; // Assign unique ID
            dmxGrid.appendChild(cell);
        }
    }
}

// Generate DMX grids
generateDmxGrid('dmx1', 0, 10);
generateDmxGrid('dmx2', 10, 20);
generateDmxGrid('dmx3', 20, 30);
handleGapChange(imgCol - 30);

// Function to update the DMX grid with brightness values
export function updateDMXGrid(brightnessValues, startColumn = 0) {
    const rows = 28;
    const gridWidth = 30; // Number of columns to display

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < gridWidth; col++) {
            const cellId = `dmxCell-${row}-${col}`;
            const cell = document.getElementById(cellId);

            // Calculate the correct column index considering the startColumn
            let colIndex = startColumn + col;

            if (colIndex > 19) { // First panel
                colIndex += (imgCol - 30);
            } else if (colIndex > 9 && colIndex <= 19) { // Middle panel
                colIndex += (imgCol - 30) / 2;
            } else if (colIndex <= 9) { // Last panel
                // Keep the colIndex as is
            }

            // Get the brightness value from the brightnessValues array
            const brightness = brightnessValues[row][colIndex];
            const colorValue = Math.min(Math.max(brightness, 0), 255);

            // Update the cell color
            cell.style.backgroundColor = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
        }
    }
}

// Function to handle changes in the gap between DMX grids
export function handleGapChange(newCol) {
    const dmxGridElements = document.querySelectorAll('.dmxGrid');
    setNumCol(30 + parseInt(newCol, 10));
    dmxGridElements.forEach(element => {
        element.style.margin = `${newCol * 2}px`;
    });
}