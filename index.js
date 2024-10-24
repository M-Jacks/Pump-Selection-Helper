document.addEventListener('DOMContentLoaded', () => {
    const pumpList = document.getElementById('pumpList');
    const bestPumpResultsDiv = document.getElementById('bestPumpResults');
    const optionResultsDiv = document.getElementById('optionResults');

    const categoryButtons = document.querySelectorAll('.category-btn');
    const subcategoryButtons = document.querySelectorAll('.subcategory-btn');
    const headInput = document.getElementById('head');

    let selectedCategory = '';
    let selectedSubcategory = '';

    const pumpDataLibrary = [
        {
            "pump": "Surface Pump",
            "controller": "CSD GD32",
            "category": "surface",
            "subcategory": "smart_direct",
            "performance": {
                "1": 2968.46,
                "5": 2782.07,
                "10": 1689.35,
                "15": 809.31,
                "20": 101.03,
                "21": 0.0
            },
            "url": "https://sunculture.io/surfacepump/"
        },
        {
            "pump": "RainMaker2C Kubwa",
            "controller": "CSD AMT49406",
            "category": "surface",
            "subcategory": "smart_direct",
            "performance": {
                "1": 2998.13,
                "5": 2405.21,
                "10": 2160.54,
                "15": 1474.35,
                "20": 804.83,
                "25": 234.43,
                "27": 0
            },
            "url": "https://sunculture.io/products/rainmaker2c-kubwa/"
        },
        {
            "pump": "ClimateSmart™ Direct",
            "controller": "CSD AMT49406",
            "category": "submersible",
            "subcategory": "smart_direct",
            "performance": {
                "1": 1256.33,
                "10": 1101.34,
                "20": 937.68,
                "30": 791.82,
                "40": 627.34,
                "50": 732.94,
                "60": 271.04,
                "70": 93.23,
                "71": 0
            },
            "url": "https://sunculture.io/products/climatesmart-direct/"
        },
        {
            "pump": "RainMaker2 with ClimateSmart™ Battery",
            "controller": "CSB1",
            "category": "submersible",
            "subcategory": "smart_battery",
            "performance": {
                "1": 1110,
                "5": 990,
                "10": 852,
                "15": 744,
                "20": 612,
                "25": 540,
                "30": 462,
                "35": 390,
                "40": 300,
                "45": 240,
                "50": 180,
                "55": 0
            },
            "url": "https://sunculture.io/products/rainmaker2-with-climatesmart-battery/"
        }
    ];

    pumpDataLibrary.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.pump}`;
        pumpList.appendChild(listItem);
    });

    // Tooltip 
    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    tooltip.innerText = 'View specs';
    document.body.appendChild(tooltip);

    // Tooltip hover logic
    document.addEventListener('mousemove', (e) => {
        const pumpLinks = document.querySelectorAll('.pump-link');
        pumpLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                tooltip.style.display = 'block';
            });

            link.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });
        });

        // Position tooltip near the mouse cursor
        tooltip.style.left = `${e.pageX + 15}px`;
        tooltip.style.top = `${e.pageY + 15}px`;
    });

    const modal = document.getElementById("pumpModal");
    const btn = document.getElementById("selectPumpBtn");
    const closeBtn = document.querySelector(".close");

    // Show modal when button is clicked
    btn.addEventListener("click", function () {
        modal.style.display = "block";
    });

    // Close modal 
    closeBtn.addEventListener("click", function () {
        modal.style.display = "none";
    });

    // Close modal when clicking outside the modal content
    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // category selection
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            toggleButton(button, categoryButtons);
            selectedCategory = button.classList.contains('active') ? button.getAttribute('data-value') : '';
            handleInputChange();
        });
    });

    // subcategory selection
    subcategoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            toggleButton(button, subcategoryButtons);
            selectedSubcategory = button.classList.contains('active') ? button.getAttribute('data-value') : '';
            handleInputChange();
        });
    });

    // Input event listener for the head input
    headInput.addEventListener('input', handleInputChange);

    // Handle input change
    function handleInputChange() {
        const head = parseFloat(headInput.value);

        // Filter based on category/subcategory
        const filteredPumps = filterPumpsByCategory(pumpDataLibrary, selectedCategory, selectedSubcategory);

        // If head is provided, rank the pumps and display results
        if (!isNaN(head)) {
            const suggestions = rankPumps(filteredPumps, head);
            clearResults();
            displayResults(suggestions);
        } else {
            clearResults();
        }
    } 

    // Clear previous results
    function clearResults() {
        bestPumpResultsDiv.innerHTML = 'Provide pumping head to get pump suggestion.';
        optionResultsDiv.innerHTML = '';
    }

    // Display pump suggestions
    function displayResults(suggestions) {
        if (suggestions.length === 0) {
            bestPumpResultsDiv.innerHTML = '<p>No available suggestion.</p>';
            optionResultsDiv.innerHTML = 'No available option';
            return;
        }

        if (suggestions.length > 0) {
            const head = parseFloat(headInput.value);
            const bestPump = suggestions[0];
            bestPumpResultsDiv.innerHTML = createPumpLink(bestPump, head);
        }

        if (suggestions.length > 1) {
            const head = parseFloat(headInput.value);
            const option = suggestions[1];
            optionResultsDiv.innerHTML = createPumpLink(option, head);
        }
    }

    // Create pump link
    function createPumpLink(pump, head) {
        return `<a href="${pump.url}" target="_blank" class="pump-link">
                    ${pump.pump} with Flow Rate ${pump.flowRate.toFixed(2)} L/h at ${head} meters.
                </a>`;
    }

    // Rank pumps based on flow rate for the given head
    function rankPumps(filteredData, head) {
        const performances = filteredData.map(entry => {
            const flowRate = interpolateFlowRate(entry.performance, head);
            return flowRate !== null ? { ...entry, flowRate } : null;
        }).filter(entry => entry !== null);

        performances.sort((a, b) => b.flowRate - a.flowRate);

        return performances;
    }

    // Filter pumps based on category and subcategory
    function filterPumpsByCategory(data, category, subcategory) {
        return data.filter(pump => {
            const categoryMatch = !category || pump.category === category;
            const subcategoryMatch = !subcategory || pump.subcategory === subcategory;
            return categoryMatch && subcategoryMatch;
        });
    }

    // Interpolate flow rate
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

    // Toggle button state (select/unselect)
    function toggleButton(selectedButton, allButtons) {
        allButtons.forEach(button => {
            if (button === selectedButton) {
                button.classList.toggle('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
});
