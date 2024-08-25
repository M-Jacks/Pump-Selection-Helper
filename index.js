document.addEventListener('DOMContentLoaded', () => {
    const pumpData = JSON.parse(document.getElementById('pumpData').textContent);
    const pumpList = document.getElementById('pumpList');
    console.log("Product Library:", pumpData);

    pumpData.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.pump}`;
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

        console.log("Ranked suggestions:", suggestions);

        if (suggestions.length > 0) {
            const bestPumpSection = document.getElementById('bestPump');
            const optionSection = document.getElementById('option');
        
            bestPumpResults.innerHTML = '';
            optionResults.innerHTML = '';
        
            if (suggestions.length > 0) {
                const bestPump = suggestions[0];
                const bestFlowRate = Math.round(bestPump.flowRate);
                const bestRange = `${Math.max(0, Math.round(bestFlowRate - 10))} L/h to ${Math.round(bestFlowRate + 10)} L/h`;
                firstOption.innerHTML = 'Best Option';
                bestPumpResults.innerHTML = `<a href="${bestPump.url}" target="_blank" class="pump-link"><strong> ${bestPump.pump}:</strong> ${bestRange}</a>`;
                bestPumpResults.setAttribute('data-toggle', 'tooltip');
                bestPumpResults.setAttribute('data-placement', 'top');
                bestPumpResults.setAttribute('title', 'Click to see Specs');
                bestPumpSection.style.display = 'block';
            }
        
            if (suggestions.length > 1) {
                const option = suggestions[1];
                const optionFlowRate = Math.round(option.flowRate);
                const optionRange = `${Math.max(0, Math.round(optionFlowRate - 10))} L/h to ${Math.round(optionFlowRate + 10)} L/h`;
                secondOption.innerHTML = 'Best Alternative';
                optionResults.innerHTML = `<a href="${option.url}" target="_blank" class="pump-link"><strong> ${option.pump}:</strong> ${optionRange}</a>`;
                optionResults.setAttribute('data-toggle', 'tooltip');
                optionResults.setAttribute('data-placement', 'top');
                optionResults.setAttribute('title', 'Click to see Specs');
                optionSection.style.display = 'block';
            }
        } else {
            bestPumpResults.innerHTML = 'No suggestions available for the given head.';
            optionResults.innerHTML = '';
            secondOption.innerHTML = '';
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
        });

        console.log("After map operation:", performances);

        const validPerformances = performances.filter(entry => entry !== null);

        console.log("After filter operation:", validPerformances);

        validPerformances.sort((a, b) => b.flowRate - a.flowRate);

        return validPerformances.slice(0, 2);
    }
});
