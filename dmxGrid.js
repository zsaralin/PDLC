export function createDMXGrid() {
    const dmxGrid = document.getElementById('dmxGrid');
    dmxGrid.innerHTML = ''; // Clear existing content

    for (let row = 0; row < 28; row++) {
        for (let col = 0; col < 10; col++) {
            const cell = document.createElement('div');
            cell.classList.add('dmxCell');
            cell.id = `dmxCell-${row}-${col}`; // Assign unique ID
            dmxGrid.appendChild(cell);
        }
    }
}
createDMXGrid()

export function updateDMXGrid(brightnessValues, startColumn = 10, totalColumns = 20) {
    const gridWidth = 10; // Number of columns to display
    const rows = 28; // Total rows

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < gridWidth; col++) {
            const cellId = `dmxCell-${row}-${9-col}`;
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