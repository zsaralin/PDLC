function generateDmxGrid(gridId, startCol, endCol) {
    let dmxGrid = document.getElementById(gridId);
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

// Generate grids for dmx1, dmx2, and dmx3
generateDmxGrid('dmx1', 0, 10);
generateDmxGrid('dmx2', 10, 20);
generateDmxGrid('dmx3', 20, 30);

export function updateDMXGrid(brightnessValues, startColumn = 0, totalColumns = 30) {
    const gridWidth = 30; // Number of columns to display
    const rows = 28; // Total rows

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < gridWidth; col++) {
            const cellId = `dmxCell-${row}-${29-col}`;
            const cell = document.getElementById(cellId);

            // Calculate the actual index in brightnessValues
            // Considering the startColumn and the row's offset in the full data width
            const rowIndex = row;
            const colIndex = startColumn + col;

            // Get the brightness value from the brightnessValues array of arrays
            const brightness = brightnessValues[rowIndex][colIndex];
            const colorValue = Math.min(Math.max(brightness, 0), 255);

            // Update the cell color
            cell.style.backgroundColor = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
        }
    }
}