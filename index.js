document.addEventListener('DOMContentLoaded', () => {
    const pumpDataLibrary = [
        {
            pump: 'Surface Pump',
            controller: 'CSD GD32',
            performance: {
                '1': 2968.46, '5': 2782.07, '10': 1689.35, '15': 809.31, '20': 101.03, '21': 0.0
            }
        },
        {
            pump: 'RM2C-KUBWA',
            controller: 'CSD GD32',
            performance: {
                '1': 2622.95, '5': 2193.12, '10': 1953.34, '15': 1582.42, '20': 1035.97, '25': 733.65, '30':0
            }
        },
        {
            pump: 'RM2C-KUBWA',
            controller: 'CSD AMT49406',
            performance: {
                '1': 2998.13, '5': 2405.21, '10': 2160.54, '15': 1474.35, '20': 804.83, '25': 234.43, '27': 0
            }
        },
        {
            pump: 'RM2C-KUBWA',
            controller: 'CSD A4964',
            performance: {
                '1': 3339.52, '5': 3143.42, '10': 2699.66, '15': 2421.39, '20': 1854.0, '25': 1292.76, '30': 616.97, '35': 395.39, '39': 0
            }
        },
        {
            pump: 'RM2S PUMP',
            controller: 'CSD GD32',
            performance: {
                '1': 1172.64, '10': 1028.64, '20': 864.5, '30': 713.93, '40': 569.24, '50': 732.94, '60': 199.19, '70': 0
            }
        },
        {
            pump: 'RM2S PUMP',
            controller: 'CSD AMT49406',
            performance: {
                '1': 1256.33, '10': 1101.34, '20': 937.68, '30': 791.82, '40': 627.34, '50': 732.94, '60': 271.04, '70': 93.23, '71': 0
            }
        },
        {
            pump: 'RM2S PUMP',
            controller: 'CSD A4964',
            performance: {
                '1': 1328.78, '10': 1159.98, '20': 1004.18, '30': 861.55, '40': 694.78, '50': 516.98, '60': 342.76, '70': 132.21, '70': 0
            }
        }
    ];

    const pumpList = document.getElementById('pumpList');
    
    pumpDataLibrary.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.pump} - ${item.controller}`;
        pumpList.appendChild(listItem);
    });

    const pumpForm = document.getElementById('pumpForm');
    const resultsDiv = document.getElementById('results');

    pumpForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const head = parseFloat(document.getElementById('head').value);
        const suggestions = rankPumps(pumpDataLibrary, head);

        resultsDiv.innerHTML = '';
        suggestions.forEach(suggestion => {
            const { pump, controller, flowRate } = suggestion;
            const flowRateRange = `${flowRate - 50} L/h to ${flowRate + 50} L/h`;
            resultsDiv.innerHTML += `<p><strong>${pump}</strong> with ${controller}: Expected Flow Rate ${flowRateRange}</p>`;
        });
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

// npm install -g http-server
// http-server -p 8000