// 7Sense Landing Page - Minimalist JS
// Lead Capture & Contact Reveal Logic

document.addEventListener('DOMContentLoaded', () => {
    const leadForm = document.getElementById('lead-form');
    const captureInterface = document.getElementById('capture-interface');
    const revealInterface = document.getElementById('reveal-interface');

    if (leadForm) {
        leadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = leadForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Verifying...';
            submitBtn.disabled = true;

            // Collect lead data
            const leadData = {
                name: document.getElementById('lead-name').value,
                email: document.getElementById('lead-email').value,
                interest: document.getElementById('lead-interest').value,
                message: document.getElementById('lead-message').value,
                timestamp: new Date().toISOString()
            };

            // Simulate routing to Notion (replace with actual integration)
            console.log('Lead captured:', leadData);

            // Simulate brief delay for UX
            await new Promise(resolve => setTimeout(resolve, 800));

            // Reveal contact details
            captureInterface.style.display = 'none';
            revealInterface.classList.remove('hidden');
        });
    }
});
