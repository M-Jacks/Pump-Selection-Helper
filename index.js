document.addEventListener('DOMContentLoaded', () => {
    const pumpData = JSON.parse(document.getElementById('pumpData').textContent);
    const pumpList = document.getElementById('pumpList');
    console.log(pumpData);

    pumpData.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.pump} - ${item.controller}`;
        pumpList.appendChild(listItem);
    });

    const pumpForm = document.getElementById('pumpForm');
    const bestPumpResults = document.getElementById('bestPumpResults');
    const optionResults = document.getElementById('optionResults');

    pumpForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const head = parseFloat(document.getElementById('head').value);
            
        if (isNaN(head)) {
            alert('Please enter a valid number for the head.');
            return;
        }

        const suggestions = rankPumps(pumpData, head);

        if (suggestions.length > 0) {
            const bestPumpSection = document.getElementById('bestPump');
            const optionSection = document.getElementById('option');

            bestPumpResults.innerHTML = '';
            optionResults.innerHTML = '';

            if (suggestions.length > 0) {
                const bestPump = suggestions[0];
                const bestFlowRate = Math.round(bestPump.flowRate);
                const bestRange = `${Math.max(0, Math.round(bestFlowRate - 30))} L/h to ${Math.round(bestFlowRate + 30)} L/h`;
                bestPumpResults.innerHTML = `<p><strong>${bestPump.pump}</strong> with ${bestPump.controller}: Expected Flow Rate Range ${bestRange}</p>`;
                bestPumpSection.style.display = 'block';
            }

            if (suggestions.length > 1) {
                const option = suggestions[1];
                const optionFlowRate = Math.round(option.flowRate);
                const optionRange = `${Math.max(0, Math.round(optionFlowRate - 30))} L/h to ${Math.round(optionFlowRate + 30)} L/h`;
                optionResults.innerHTML = `<p><strong>${option.pump}</strong> with ${option.controller}: Expected Flow Rate Range ${optionRange}</p>`;
                optionSection.style.display = 'block';
            }
        } else {
            // When provided head is not in range
            bestPumpResults.innerHTML = 'No suggestions available for the given head.';
            optionResults.innerHTML = '';
            document.getElementById('bestPump').style.display = 'block';
        }
    });

    function interpolateFlowRate(performance, head) {
        const heads = Object.keys(performance).map(h => parseFloat(h)).sort((a, b) => a - b);

        for (let i = 0; i < heads.length - 1; i++) {
            if (head >= heads[i] && head <= heads[i + 1]) {
                const x0 = heads[i];
                const x1 = heads[i + 1];
                const y0 = performance[x0];
                const y1 = performance[x1];
                const flowRate = y0 + ((y1 - y0) * (head - x0)) / (x1 - x0);
                return flowRate;
            }
        }

        return null;
    }

    function rankPumps(data, head) {
        const performances = data.map(entry => {
            const flowRate = interpolateFlowRate(entry.performance, head);
            return flowRate !== null ? { ...entry, flowRate } : null;
        }).filter(entry => entry !== null);

        performances.sort((a, b) => b.flowRate - a.flowRate);

        return performances.slice(0, 2);
    }
});
