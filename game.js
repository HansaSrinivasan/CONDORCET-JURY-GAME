// Game functionality JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Only run this code on the new game page
    const gameWizard = document.getElementById('gameWizard');
    if (!gameWizard) return;
    
    // Game state
    let currentStep = 1;
    const totalSteps = 3;
    let judges = [];
    let calculationResults = null;
    
    // Elements
    const judgeCount = document.getElementById('judgeCount');
    const decreaseBtn = document.getElementById('decreaseBtn');
    const increaseBtn = document.getElementById('increaseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const judgeForms = document.getElementById('judgeForms');
    const saveGameBtn = document.getElementById('saveGameBtn');
    
    // Initialize step handlers
    setupStepControls();
    setupJudgeCounter();
    setupSaveGame();
    
    // Step navigation functions
    function setupStepControls() {
        prevBtn.addEventListener('click', goToPreviousStep);
        nextBtn.addEventListener('click', goToNextStep);
        
        function goToPreviousStep() {
            if (currentStep > 1) {
                currentStep--;
                updateUI();
            }
        }
        
        async function goToNextStep() {
            if (currentStep < totalSteps) {
                if (currentStep === 1) {
                    // Validate judge count and generate forms
                    const count = parseInt(judgeCount.value);
                    if (isNaN(count) || count < 3 || count > 99) {
                        alert('Please enter a valid number of judges (3-99)');
                        return;
                    }
                    
                    if (count % 2 === 0) {
                        alert('Please enter an odd number to avoid ties');
                        return;
                    }
                    
                    generateJudgeForms(count);
                }
                else if (currentStep === 2) {
                    // Validate judge details and calculate results
                    if (!validateJudges()) {
                        return;
                    }
                    
                    try {
                        // Show loading state
                        nextBtn.disabled = true;
                        nextBtn.textContent = 'Calculating...';
                        
                        // Calculate results
                        calculationResults = await calculateResults(judges);
                        
                        // Display results
                        displayResults(calculationResults);
                        
                        // Reset button state
                        nextBtn.disabled = false;
                        nextBtn.textContent = 'Next';
                    } catch (error) {
                        console.error('Error calculating results:', error);
                        alert('An error occurred while calculating results. Please try again.');
                        nextBtn.disabled = false;
                        nextBtn.textContent = 'Next';
                        return;
                    }
                }
                
                currentStep++;
                updateUI();
            }
        }
    }
    
    // Judge counter controls
    function setupJudgeCounter() {
        decreaseBtn.addEventListener('click', () => {
            let count = parseInt(judgeCount.value);
            if (count > 3) {
                count = count - 2; // Ensure odd numbers
                judgeCount.value = count;
            }
        });
        
        increaseBtn.addEventListener('click', () => {
            let count = parseInt(judgeCount.value);
            if (count < 99) {
                count = count + 2; // Ensure odd numbers
                judgeCount.value = count;
            }
        });
        
        // Ensure odd number when manually changed
        judgeCount.addEventListener('change', () => {
            let count = parseInt(judgeCount.value);
            if (isNaN(count) || count < 3) {
                count = 3;
            } else if (count > 99) {
                count = 99;
            }
            
            // Ensure odd
            if (count % 2 === 0) {
                count = count + 1;
            }
            
            judgeCount.value = count;
        });
    }
    
    // Generate judge forms for step 2
    function generateJudgeForms(count) {
        judgeForms.innerHTML = '';
        judges = [];
        
        for (let i = 0; i < count; i++) {
            const judgeName = `Judge ${i + 1}`;
            const form = document.createElement('div');
            form.className = 'judge-form';
            form.innerHTML = `
                <h3 class="judge-form-title">Judge ${i + 1}</h3>
                <div class="form-group">
                    <label for="judge-name-${i}">Name:</label>
                    <input type="text" id="judge-name-${i}" value="${judgeName}" required>
                </div>
                <div class="form-group">
                    <label for="judge-vote-${i}">Vote:</label>
                    <select id="judge-vote-${i}" required>
                        <option value="convict">Convict</option>
                        <option value="acquit">Acquit</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="judge-probability-${i}">Probability (0-1):</label>
                    <input type="number" id="judge-probability-${i}" min="0" max="1" step="0.01" value="0.75" required>
                </div>
            `;
            
            judgeForms.appendChild(form);
            
            // Initialize judge data
            judges.push({
                name: judgeName,
                vote: 'convict',
                probability: 0.75
            });
            
            // Add event listeners to update judge data
            const nameInput = document.getElementById(`judge-name-${i}`);
            const voteSelect = document.getElementById(`judge-vote-${i}`);
            const probInput = document.getElementById(`judge-probability-${i}`);
            
            nameInput.addEventListener('change', () => {
                judges[i].name = nameInput.value;
            });
            
            voteSelect.addEventListener('change', () => {
                judges[i].vote = voteSelect.value;
            });
            
            probInput.addEventListener('change', () => {
                const prob = parseFloat(probInput.value);
                if (!isNaN(prob) && prob >= 0 && prob <= 1) {
                    judges[i].probability = prob;
                }
            });
        }
    }
    
    // Validate judge data from forms
    function validateJudges() {
        for (let i = 0; i < judges.length; i++) {
            const nameInput = document.getElementById(`judge-name-${i}`);
            const probInput = document.getElementById(`judge-probability-${i}`);
            
            if (!nameInput.value.trim()) {
                alert(`Please enter a name for Judge ${i + 1}`);
                nameInput.focus();
                return false;
            }
            
            const prob = parseFloat(probInput.value);
            if (isNaN(prob) || prob < 0 || prob > 1) {
                alert(`Please enter a valid probability (0-1) for ${judges[i].name}`);
                probInput.focus();
                return false;
            }
            
            // Update judge data
            judges[i].name = nameInput.value.trim();
            judges[i].vote = document.getElementById(`judge-vote-${i}`).value;
            judges[i].probability = prob;
        }
        
        return true;
    }
    
    // Calculate results using API
    async function calculateResults(judges) {
        const response = await fetch('/api/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ judges }),
        });
        
        if (!response.ok) {
            throw new Error('Failed to calculate results');
        }
        
        return await response.json();
    }
    
    // Display results in step 3
    // Display results in step 3
    function displayResults(results) {
        // Update verdict display
        const verdictBox = document.getElementById('verdictBox');
        const verdictValue = document.getElementById('verdictValue');
        
        verdictBox.className = `verdict-box ${results.verdict}`;
        verdictValue.textContent = results.verdict.toUpperCase();
        
        // Update probability circle
        const probabilityCircle = document.getElementById('probabilityCircle');
        const probabilityText = document.getElementById('probabilityText');
        const circumference = 377; // 2 * PI * r (where r = 60)
        
        const correctProb = results.correctProbability;
        const displayProb = Math.round(correctProb * 100);
        
        // Calculate the dashoffset - this is the correct formula for stroke-dashoffset
        // The full circle has a dasharray of 377, so we subtract the filled portion
        const dashOffset = circumference * (1 - correctProb);
        probabilityCircle.style.strokeDashoffset = dashOffset;
        probabilityText.textContent = `${displayProb}%`;
        
        // Update stats
        document.getElementById('judgeTotalCount').textContent = judges.length;
        
        const convictCount = judges.filter(j => j.vote === 'convict').length;
        const acquitCount = judges.length - convictCount;
        
        document.getElementById('convictCount').textContent = convictCount;
        document.getElementById('acquitCount').textContent = acquitCount;
        document.getElementById('averageProbability').textContent = 
            `${Math.round(results.averageProbability * 100)}%`;
        
        // Create chart
        createJudgeChart();
    }
    
    // Create chart for judge probabilities
    function createJudgeChart() {
        const ctx = document.getElementById('resultsChart').getContext('2d');
        
        // Sort judges by probability for better visualization
        const sortedJudges = [...judges].sort((a, b) => b.probability - a.probability);
        
        // Prepare data for chart
        const judgeNames = sortedJudges.map(judge => judge.name);
        const probabilities = sortedJudges.map(judge => judge.probability);
        const backgroundColors = sortedJudges.map(judge => 
            judge.vote === 'convict' ? 'rgba(239, 68, 68, 0.7)' : 'rgba(16, 185, 129, 0.7)'
        );
        const borderColors = sortedJudges.map(judge => 
            judge.vote === 'convict' ? 'rgb(239, 68, 68)' : 'rgb(16, 185, 129)'
        );
        
        // Create chart
        if (window.judgeChart) {
            window.judgeChart.destroy();
        }
        
        window.judgeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: judgeNames,
                datasets: [{
                    label: 'Probability of Correctness',
                    data: probabilities,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1,
                        ticks: {
                            callback: function(value) {
                                return (value * 100) + '%';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Probability'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Judge'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const judge = sortedJudges[context.dataIndex];
                                return [
                                    `Probability: ${Math.round(judge.probability * 100)}%`,
                                    `Vote: ${judge.vote.toUpperCase()}`
                                ];
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Save game
    function setupSaveGame() {
        saveGameBtn.addEventListener('click', async () => {
            // Validate game name
            const gameName = document.getElementById('gameName').value.trim();
            if (!gameName) {
                alert('Please enter a name for your game');
                return;
            }
            
            if (!calculationResults) {
                alert('No calculation results to save');
                return;
            }
            
            try {
                // Show loading state
                saveGameBtn.disabled = true;
                saveGameBtn.textContent = 'Saving...';
                
                // Save game to database
                const response = await fetch('/api/games', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: gameName,
                        judges,
                        results: calculationResults
                    }),
                });
                
                if (!response.ok) {
                    throw new Error('Failed to save game');
                }
                
                // Success - redirect to home page
                alert('Game saved successfully!');
                window.location.href = '/';
                
            } catch (error) {
                console.error('Error saving game:', error);
                alert('An error occurred while saving the game. Please try again.');
                saveGameBtn.disabled = false;
                saveGameBtn.textContent = 'Save Game';
            }
        });
    }
    
    // Update UI based on current step
    function updateUI() {
        // Update step indicators
        const steps = document.querySelectorAll('.step');
        steps.forEach(step => {
            const stepNumber = parseInt(step.dataset.step);
            if (stepNumber === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        // Show current step panel, hide others
        const stepPanels = document.querySelectorAll('.wizard-step');
        stepPanels.forEach((panel, index) => {
            if (index + 1 === currentStep) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
        
        // Update navigation buttons
        prevBtn.disabled = currentStep === 1;
        
        if (currentStep === totalSteps) {
            nextBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'inline-block';
            
            if (currentStep === totalSteps - 1) {
                nextBtn.textContent = 'Calculate Results';
            } else {
                nextBtn.textContent = 'Next';
            }
        }
    }
});