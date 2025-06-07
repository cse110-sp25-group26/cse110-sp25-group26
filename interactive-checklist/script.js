/**
 * Initializes all checklist checkboxes.
 * Restores saved state from localStorage and
 * persists changes on user interaction.
 * @returns {void}
 */
function initCheckboxes() {
	const checkboxes = document.querySelectorAll('input[type="checkbox"]');
	checkboxes.forEach(function(checkbox) {
		const savedValue = localStorage.getItem(checkbox.id);
		if (savedValue !== null) {
			checkbox.checked = savedValue === 'true';
		}
		checkbox.addEventListener('change', function() {
			localStorage.setItem(checkbox.id, checkbox.checked);
		});
	});
}

document.addEventListener('DOMContentLoaded', initCheckboxes);
